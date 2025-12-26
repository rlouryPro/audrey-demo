# Agent: Database & Prisma

## Rôle
Expert modélisation de données et Prisma ORM pour PostgreSQL.

## Expertise
- PostgreSQL 16
- Prisma ORM 5.x
- Migrations et seeds
- Optimisation requêtes
- Indexation

## Contexte projet
Modèle de données pour application ESAT :
- Utilisateurs avec rôles (USER/ADMIN)
- Événements frise chronologique
- Hiérarchie compétences (Domaines > Catégories > Compétences)
- Association utilisateur-compétences avec workflow de validation
- Avatar avec niveau calculé

## Schéma Prisma de référence

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum SkillStatus {
  IN_PROGRESS
  PENDING_VALIDATION
  ACQUIRED
  REJECTED
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  firstName    String
  lastName     String
  role         Role     @default(USER)
  avatarLevel  Int      @default(1)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  events          Event[]
  userSkills      UserSkill[] @relation("UserSkills")
  validatedSkills UserSkill[] @relation("ValidatedSkills")

  @@index([role])
  @@index([isActive])
}

model Event {
  id        String   @id @default(uuid())
  userId    String
  date      DateTime @db.Date
  title     String   @db.VarChar(100)
  photoUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date(sort: Desc)])
}

model Domain {
  id           String   @id @default(uuid())
  name         String   @unique @db.VarChar(100)
  description  String?  @db.VarChar(500)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  categories Category[]

  @@index([displayOrder])
}

model Category {
  id           String   @id @default(uuid())
  domainId     String
  name         String   @db.VarChar(100)
  description  String?  @db.VarChar(500)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  domain Domain  @relation(fields: [domainId], references: [id], onDelete: Cascade)
  skills Skill[]

  @@unique([domainId, name])
  @@index([domainId, displayOrder])
}

model Skill {
  id           String   @id @default(uuid())
  categoryId   String
  name         String   @db.VarChar(100)
  description  String   @db.VarChar(500)
  iconName     String   @db.VarChar(50)
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  userSkills UserSkill[]

  @@unique([categoryId, name])
  @@index([categoryId, displayOrder])
  @@index([isActive])
}

model UserSkill {
  id              String      @id @default(uuid())
  userId          String
  skillId         String
  status          SkillStatus
  requestedAt     DateTime    @default(now())
  validatedAt     DateTime?
  validatedById   String?
  rejectionReason String?     @db.VarChar(500)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user        User   @relation("UserSkills", fields: [userId], references: [id], onDelete: Cascade)
  skill       Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  validatedBy User?  @relation("ValidatedSkills", fields: [validatedById], references: [id])

  @@unique([userId, skillId])
  @@index([status])
  @@index([userId, status])
}
```

## Requêtes optimisées

### Récupérer la hiérarchie complète des compétences
```typescript
async function getSkillsHierarchy() {
  return prisma.domain.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      categories: {
        orderBy: { displayOrder: 'asc' },
        include: {
          skills: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      }
    }
  });
}
```

### Récupérer les compétences d'un utilisateur avec stats
```typescript
async function getUserSkillsSummary(userId: string) {
  const [skills, counts] = await Promise.all([
    prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: {
          include: {
            category: {
              include: { domain: true }
            }
          }
        }
      },
      orderBy: { requestedAt: 'desc' }
    }),
    prisma.userSkill.groupBy({
      by: ['status'],
      where: { userId },
      _count: true
    })
  ]);

  const summary = {
    acquired: 0,
    inProgress: 0,
    pendingValidation: 0,
    rejected: 0
  };

  counts.forEach(c => {
    switch (c.status) {
      case 'ACQUIRED': summary.acquired = c._count; break;
      case 'IN_PROGRESS': summary.inProgress = c._count; break;
      case 'PENDING_VALIDATION': summary.pendingValidation = c._count; break;
      case 'REJECTED': summary.rejected = c._count; break;
    }
  });

  return { skills, summary };
}
```

### Récupérer les validations en attente (admin)
```typescript
async function getPendingValidations() {
  return prisma.userSkill.findMany({
    where: { status: 'PENDING_VALIDATION' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, username: true }
      },
      skill: {
        include: {
          category: {
            include: { domain: true }
          }
        }
      }
    },
    orderBy: { requestedAt: 'asc' }
  });
}
```

### Valider une compétence et mettre à jour l'avatar
```typescript
async function approveSkill(userSkillId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Mettre à jour le statut
    const userSkill = await tx.userSkill.update({
      where: { id: userSkillId },
      data: {
        status: 'ACQUIRED',
        validatedAt: new Date(),
        validatedById: adminId
      }
    });

    // 2. Compter les compétences acquises
    const acquiredCount = await tx.userSkill.count({
      where: {
        userId: userSkill.userId,
        status: 'ACQUIRED'
      }
    });

    // 3. Calculer et mettre à jour le niveau d'avatar
    const avatarLevel = calculateAvatarLevel(acquiredCount);
    await tx.user.update({
      where: { id: userSkill.userId },
      data: { avatarLevel }
    });

    return userSkill;
  });
}

function calculateAvatarLevel(acquiredCount: number): number {
  if (acquiredCount >= 16) return 5;
  if (acquiredCount >= 11) return 4;
  if (acquiredCount >= 6) return 3;
  if (acquiredCount >= 3) return 2;
  return 1;
}
```

### Récupérer le portfolio complet d'un utilisateur
```typescript
async function getUserPortfolio(userId: string) {
  const [user, events, skillsData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarLevel: true,
        createdAt: true
      }
    }),
    prisma.event.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    }),
    getUserSkillsSummary(userId)
  ]);

  return { user, events, skills: skillsData };
}
```

## Migrations

### Créer une migration
```bash
npx prisma migrate dev --name init
npx prisma migrate dev --name add_rejection_reason
```

### Appliquer en production
```bash
npx prisma migrate deploy
```

### Reset (dev only)
```bash
npx prisma migrate reset
```

## Seed de données initiales

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Créer l'admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Administrateur',
      lastName: 'ESAT',
      role: Role.ADMIN
    }
  });

  // 2. Créer des utilisateurs de test
  const userPassword = await bcrypt.hash('user123', 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'marie' },
      update: {},
      create: {
        username: 'marie',
        passwordHash: userPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: Role.USER
      }
    }),
    prisma.user.upsert({
      where: { username: 'pierre' },
      update: {},
      create: {
        username: 'pierre',
        passwordHash: userPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: Role.USER
      }
    })
  ]);

  // 3. Créer la hiérarchie de compétences
  const domainsData = [
    {
      name: 'Savoir-être',
      description: 'Compétences comportementales et relationnelles',
      categories: [
        {
          name: 'Communication',
          skills: [
            { name: "S'exprimer clairement", description: 'Parler de façon compréhensible', iconName: 'chat' },
            { name: 'Écouter les consignes', description: 'Être attentif aux instructions', iconName: 'ear' },
            { name: 'Poser des questions', description: 'Demander quand on ne comprend pas', iconName: 'question' }
          ]
        },
        {
          name: 'Ponctualité',
          skills: [
            { name: "Arriver à l'heure", description: 'Respecter les horaires', iconName: 'clock' },
            { name: 'Respecter les délais', description: 'Finir les tâches à temps', iconName: 'calendar' }
          ]
        },
        {
          name: 'Travail en équipe',
          skills: [
            { name: 'Aider ses collègues', description: 'Proposer son aide', iconName: 'hands' },
            { name: 'Accepter les remarques', description: 'Recevoir les conseils positivement', iconName: 'thumbsup' }
          ]
        }
      ]
    },
    {
      name: 'Compétences techniques',
      description: 'Savoir-faire professionnels',
      categories: [
        {
          name: 'Informatique',
          skills: [
            { name: 'Utiliser un ordinateur', description: 'Allumer, éteindre, naviguer', iconName: 'computer' },
            { name: 'Envoyer un email', description: 'Rédiger et envoyer des messages', iconName: 'mail' }
          ]
        },
        {
          name: 'Manutention',
          skills: [
            { name: 'Porter des charges', description: 'Soulever en sécurité', iconName: 'box' },
            { name: 'Utiliser un diable', description: 'Transporter avec équipement', iconName: 'dolly' }
          ]
        }
      ]
    },
    {
      name: 'Autonomie',
      description: 'Capacité à travailler seul',
      categories: [
        {
          name: 'Organisation',
          skills: [
            { name: 'Ranger son poste', description: 'Garder son espace propre', iconName: 'folder' },
            { name: 'Préparer son matériel', description: 'Anticiper les besoins', iconName: 'tools' }
          ]
        },
        {
          name: 'Initiative',
          skills: [
            { name: 'Proposer des idées', description: 'Suggérer des améliorations', iconName: 'lightbulb' },
            { name: 'Résoudre un problème simple', description: 'Trouver des solutions', iconName: 'puzzle' }
          ]
        }
      ]
    }
  ];

  for (let i = 0; i < domainsData.length; i++) {
    const domainData = domainsData[i];
    const domain = await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: {
        name: domainData.name,
        description: domainData.description,
        displayOrder: i
      }
    });

    for (let j = 0; j < domainData.categories.length; j++) {
      const catData = domainData.categories[j];
      const category = await prisma.category.upsert({
        where: { domainId_name: { domainId: domain.id, name: catData.name } },
        update: {},
        create: {
          domainId: domain.id,
          name: catData.name,
          displayOrder: j
        }
      });

      for (let k = 0; k < catData.skills.length; k++) {
        const skillData = catData.skills[k];
        await prisma.skill.upsert({
          where: { categoryId_name: { categoryId: category.id, name: skillData.name } },
          update: {},
          create: {
            categoryId: category.id,
            name: skillData.name,
            description: skillData.description,
            iconName: skillData.iconName,
            displayOrder: k
          }
        });
      }
    }
  }

  console.log('Seed completed!');
  console.log(`- Admin: admin / admin123`);
  console.log(`- Users: marie, pierre / user123`);
  console.log(`- ${domainsData.length} domains with skills`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Checklist avant PR
- [ ] Index sur colonnes de recherche/filtre
- [ ] Contraintes d'unicité appropriées
- [ ] Cascade delete configuré
- [ ] Pas de N+1 queries (utiliser include)
- [ ] Transactions pour opérations multiples
- [ ] Types Prisma utilisés (pas de `any`)
- [ ] Migration testée localement
- [ ] Seed fonctionne sur base vide
