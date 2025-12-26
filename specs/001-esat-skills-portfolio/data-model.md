# Data Model: Livret Numérique de Parcours ESAT

**Date**: 2025-12-25
**Feature**: 001-esat-skills-portfolio

## Diagramme des entités

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Domaine   │──1:N──│  Catégorie  │──1:N──│ Compétence  │
└─────────────┘       └─────────────┘       └─────────────┘
                                                   │
                                                   │ N:M
                                                   ▼
┌─────────────┐       ┌─────────────────────┐
│ Utilisateur │──1:N──│ CompétenceUtilisateur│
└─────────────┘       └─────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│  Événement  │
└─────────────┘
```

---

## Entités

### 1. Utilisateur (User)

Représente un travailleur ESAT ou un administrateur.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| username | String | Unique, 3-50 chars | Identifiant de connexion |
| passwordHash | String | Required | Hash bcrypt du mot de passe |
| firstName | String | Required, 1-100 chars | Prénom |
| lastName | String | Required, 1-100 chars | Nom |
| role | Enum | Required | `USER` ou `ADMIN` |
| avatarLevel | Int | Default: 1, 1-5 | Niveau actuel de l'avatar |
| isActive | Boolean | Default: true | Compte actif/désactivé |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Règles de validation**:
- `username` : alphanumérique + underscore, unique
- `role` : seuls les ADMIN peuvent créer des comptes
- `avatarLevel` : calculé automatiquement selon compétences acquises

**Index**:
- `username` (unique)
- `role` (pour filtrage admin)

---

### 2. Événement (Event)

Moment marquant sur la frise chronologique.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| userId | UUID | FK → User, Required | Propriétaire |
| date | Date | Required | Date de l'événement |
| title | String | Required, 1-100 chars | Texte court descriptif |
| photoUrl | String | Optional, URL | Chemin vers l'image |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Règles de validation**:
- `date` : ne peut pas être > aujourd'hui + 1 an
- `title` : max 100 caractères (FR-004)
- `photoUrl` : formats JPEG, PNG uniquement

**Index**:
- `userId` + `date` (tri chronologique)

---

### 3. Domaine (Domain)

Niveau supérieur de la hiérarchie des compétences.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| name | String | Required, Unique, 1-100 chars | Nom du domaine |
| description | String | Optional, max 500 chars | Description |
| displayOrder | Int | Default: 0 | Ordre d'affichage |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Exemples**:
- "Savoir-être"
- "Compétences techniques"
- "Autonomie"

---

### 4. Catégorie (Category)

Niveau intermédiaire de la hiérarchie.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| domainId | UUID | FK → Domain, Required | Domaine parent |
| name | String | Required, 1-100 chars | Nom de la catégorie |
| description | String | Optional, max 500 chars | Description |
| displayOrder | Int | Default: 0 | Ordre d'affichage |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Contrainte d'unicité**: `domainId` + `name`

**Exemples** (pour domaine "Savoir-être"):
- "Communication"
- "Ponctualité"
- "Travail en équipe"

---

### 5. Compétence (Skill)

Élément du référentiel que les utilisateurs peuvent acquérir.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| categoryId | UUID | FK → Category, Required | Catégorie parente |
| name | String | Required, 1-100 chars | Nom de la compétence |
| description | String | Required, max 500 chars | Description courte |
| iconName | String | Required | Nom du pictogramme |
| displayOrder | Int | Default: 0 | Ordre d'affichage |
| isActive | Boolean | Default: true | Visible dans le référentiel |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Contrainte d'unicité**: `categoryId` + `name`

**Exemples** (pour catégorie "Communication"):
- "S'exprimer clairement"
- "Écouter les consignes"
- "Poser des questions"

---

### 6. CompétenceUtilisateur (UserSkill)

Association entre un utilisateur et une compétence avec statut.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto | Identifiant unique |
| userId | UUID | FK → User, Required | Utilisateur |
| skillId | UUID | FK → Skill, Required | Compétence |
| status | Enum | Required | Statut de la compétence |
| requestedAt | DateTime | Auto | Date de demande |
| validatedAt | DateTime | Optional | Date de validation |
| validatedBy | UUID | FK → User, Optional | Admin validateur |
| rejectionReason | String | Optional, max 500 chars | Motif de refus |
| createdAt | DateTime | Auto | Date de création |
| updatedAt | DateTime | Auto | Dernière modification |

**Enum Status**:
```typescript
enum SkillStatus {
  IN_PROGRESS = 'IN_PROGRESS',           // En cours d'acquisition
  PENDING_VALIDATION = 'PENDING_VALIDATION', // En attente de validation
  ACQUIRED = 'ACQUIRED',                 // Acquise (validée)
  REJECTED = 'REJECTED'                  // Refusée
}
```

**Contrainte d'unicité**: `userId` + `skillId`

**Règles métier**:
- Seul l'utilisateur peut passer de `null` → `IN_PROGRESS` ou `PENDING_VALIDATION`
- Seul un ADMIN peut passer de `PENDING_VALIDATION` → `ACQUIRED` ou `REJECTED`
- `validatedBy` requis si status = `ACQUIRED` ou `REJECTED`

---

## Schéma Prisma

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

  events           Event[]
  userSkills       UserSkill[]       @relation("UserSkills")
  validatedSkills  UserSkill[]       @relation("ValidatedSkills")
}

model Event {
  id        String   @id @default(uuid())
  userId    String
  date      DateTime
  title     String
  photoUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

model Domain {
  id           String   @id @default(uuid())
  name         String   @unique
  description  String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  categories Category[]
}

model Category {
  id           String   @id @default(uuid())
  domainId     String
  name         String
  description  String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  domain Domain  @relation(fields: [domainId], references: [id], onDelete: Cascade)
  skills Skill[]

  @@unique([domainId, name])
}

model Skill {
  id           String   @id @default(uuid())
  categoryId   String
  name         String
  description  String
  iconName     String
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  userSkills UserSkill[]

  @@unique([categoryId, name])
}

model UserSkill {
  id              String      @id @default(uuid())
  userId          String
  skillId         String
  status          SkillStatus
  requestedAt     DateTime    @default(now())
  validatedAt     DateTime?
  validatedById   String?
  rejectionReason String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user        User   @relation("UserSkills", fields: [userId], references: [id], onDelete: Cascade)
  skill       Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  validatedBy User?  @relation("ValidatedSkills", fields: [validatedById], references: [id])

  @@unique([userId, skillId])
  @@index([status])
}
```

---

## Calcul du niveau d'avatar

```typescript
function calculateAvatarLevel(acquiredSkillsCount: number): number {
  if (acquiredSkillsCount >= 16) return 5;
  if (acquiredSkillsCount >= 11) return 4;
  if (acquiredSkillsCount >= 6) return 3;
  if (acquiredSkillsCount >= 3) return 2;
  return 1;
}
```

| Niveau | Compétences acquises | Évolution |
|--------|---------------------|-----------|
| 1 | 0-2 | Avatar de base |
| 2 | 3-5 | + Accessoire 1 |
| 3 | 6-10 | + Accessoire 2 |
| 4 | 11-15 | + Couleur spéciale |
| 5 | 16+ | Avatar complet |

---

## Données de seed initiales

```typescript
// prisma/seed.ts

const domains = [
  {
    name: "Savoir-être",
    categories: [
      {
        name: "Communication",
        skills: [
          { name: "S'exprimer clairement", icon: "chat" },
          { name: "Écouter les consignes", icon: "ear" },
          { name: "Poser des questions", icon: "question" }
        ]
      },
      {
        name: "Ponctualité",
        skills: [
          { name: "Arriver à l'heure", icon: "clock" },
          { name: "Respecter les délais", icon: "calendar" }
        ]
      }
    ]
  },
  {
    name: "Compétences techniques",
    categories: [
      {
        name: "Informatique",
        skills: [
          { name: "Utiliser un ordinateur", icon: "computer" },
          { name: "Envoyer un email", icon: "mail" }
        ]
      }
    ]
  },
  {
    name: "Autonomie",
    categories: [
      {
        name: "Organisation",
        skills: [
          { name: "Ranger son poste", icon: "folder" },
          { name: "Préparer son matériel", icon: "tools" }
        ]
      }
    ]
  }
];

// Admin initial
const adminUser = {
  username: "admin",
  password: "admin123", // À changer en production
  firstName: "Administrateur",
  lastName: "ESAT",
  role: "ADMIN"
};
```
