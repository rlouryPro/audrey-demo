import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Administrateur',
      lastName: 'ESAT',
      role: Role.ADMIN,
    },
  });
  console.log('Admin created:', admin.username);

  // 2. Create test users
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
        role: Role.USER,
      },
    }),
    prisma.user.upsert({
      where: { username: 'pierre' },
      update: {},
      create: {
        username: 'pierre',
        passwordHash: userPassword,
        firstName: 'Pierre',
        lastName: 'Martin',
        role: Role.USER,
      },
    }),
  ]);
  console.log('Test users created:', users.map((u) => u.username).join(', '));

  // 3. Create skills hierarchy
  const domainsData = [
    {
      name: 'Savoir-etre',
      description: 'Competences comportementales et relationnelles',
      categories: [
        {
          name: 'Communication',
          skills: [
            { name: "S'exprimer clairement", description: 'Parler de facon comprehensible', iconName: '💬' },
            { name: 'Ecouter les consignes', description: 'Etre attentif aux instructions', iconName: '👂' },
            { name: 'Poser des questions', description: 'Demander quand on ne comprend pas', iconName: '❓' },
          ],
        },
        {
          name: 'Ponctualite',
          skills: [
            { name: "Arriver a l'heure", description: 'Respecter les horaires', iconName: '⏰' },
            { name: 'Respecter les delais', description: 'Finir les taches a temps', iconName: '📅' },
          ],
        },
        {
          name: 'Travail en equipe',
          skills: [
            { name: 'Aider ses collegues', description: 'Proposer son aide', iconName: '🤝' },
            { name: 'Accepter les remarques', description: 'Recevoir les conseils positivement', iconName: '👍' },
          ],
        },
      ],
    },
    {
      name: 'Competences techniques',
      description: 'Savoir-faire professionnels',
      categories: [
        {
          name: 'Informatique',
          skills: [
            { name: 'Utiliser un ordinateur', description: 'Allumer, eteindre, naviguer', iconName: '💻' },
            { name: 'Envoyer un email', description: 'Rediger et envoyer des messages', iconName: '📧' },
          ],
        },
        {
          name: 'Manutention',
          skills: [
            { name: 'Porter des charges', description: 'Soulever en securite', iconName: '📦' },
            { name: 'Utiliser un diable', description: 'Transporter avec equipement', iconName: '🚚' },
          ],
        },
      ],
    },
    {
      name: 'Autonomie',
      description: 'Capacite a travailler seul',
      categories: [
        {
          name: 'Organisation',
          skills: [
            { name: 'Ranger son poste', description: 'Garder son espace propre', iconName: '🗂️' },
            { name: 'Preparer son materiel', description: 'Anticiper les besoins', iconName: '🔧' },
          ],
        },
        {
          name: 'Initiative',
          skills: [
            { name: 'Proposer des idees', description: 'Suggerer des ameliorations', iconName: '💡' },
            { name: 'Resoudre un probleme simple', description: 'Trouver des solutions', iconName: '🧩' },
          ],
        },
      ],
    },
  ];

  for (let i = 0; i < domainsData.length; i++) {
    const domainData = domainsData[i];
    const domain = await prisma.domain.upsert({
      where: { name: domainData.name },
      update: {},
      create: {
        name: domainData.name,
        description: domainData.description,
        displayOrder: i,
      },
    });
    console.log('Domain created:', domain.name);

    for (let j = 0; j < domainData.categories.length; j++) {
      const catData = domainData.categories[j];
      const category = await prisma.category.upsert({
        where: { domainId_name: { domainId: domain.id, name: catData.name } },
        update: {},
        create: {
          domainId: domain.id,
          name: catData.name,
          displayOrder: j,
        },
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
            displayOrder: k,
          },
        });
      }
    }
  }

  // 4. Create sample events for Marie
  const marie = users[0];
  const eventsData = [
    {
      date: new Date('2024-01-15'),
      title: 'Premier jour a l\'ESAT',
      description: 'Accueil et presentation de l\'equipe. Decouverte des locaux et du reglement interieur.',
    },
    {
      date: new Date('2024-03-20'),
      title: 'Formation securite',
      description: 'Formation aux regles de securite et gestes de premiers secours. Obtention du certificat SST.',
    },
    {
      date: new Date('2024-06-10'),
      title: 'Participation au projet jardinage',
      description: 'Debut du projet d\'amenagement de l\'espace vert. Plantation de fleurs et entretien du potager collectif.',
    },
    {
      date: new Date('2024-09-05'),
      title: 'Stage en entreprise',
      description: 'Stage de decouverte de 2 semaines dans une entreprise partenaire. Tres bonne evaluation.',
    },
    {
      date: new Date('2024-11-22'),
      title: 'Remise du diplome',
      description: 'Ceremonie de remise des attestations de competences. Felicitations de toute l\'equipe !',
    },
    {
      date: new Date('2025-01-08'),
      title: 'Nouvelle annee, nouveaux objectifs',
      description: 'Definition des objectifs pour 2025. Projet de formation en informatique.',
    },
  ];

  // Clear and recreate Marie's events
  await prisma.event.deleteMany({ where: { userId: marie.id } });
  for (const eventData of eventsData) {
    await prisma.event.create({
      data: {
        userId: marie.id,
        date: eventData.date,
        title: eventData.title,
        description: eventData.description,
      },
    });
  }
  console.log(`${eventsData.length} events created for Marie`);

  console.log('\nSeed completed!');
  console.log('---');
  console.log('Admin: admin / admin123');
  console.log('Users: marie, pierre / user123');
  console.log(`${domainsData.length} domains with skills created`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
