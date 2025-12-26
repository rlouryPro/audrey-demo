import { prisma } from '../lib/prisma';

export const documentService = {
  async getPreview(userId: string) {
    const [user, events, skills] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarLevel: true,
          createdAt: true,
        },
      }),
      prisma.event.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          title: true,
          photoUrl: true,
        },
      }),
      prisma.userSkill.findMany({
        where: {
          userId,
          status: 'ACQUIRED',
        },
        include: {
          skill: {
            include: {
              category: {
                include: { domain: true },
              },
            },
          },
        },
        orderBy: { validatedAt: 'asc' },
      }),
    ]);

    if (!user) return null;

    return {
      user,
      events,
      acquiredSkills: skills.map((s) => ({
        id: s.id,
        skillName: s.skill.name,
        categoryName: s.skill.category.name,
        domainName: s.skill.category.domain.name,
        validatedAt: s.validatedAt,
      })),
      generatedAt: new Date(),
    };
  },

  async generateHtml(userId: string): Promise<string> {
    const data = await this.getPreview(userId);
    if (!data) throw new Error('Utilisateur non trouve');

    const { user, events, acquiredSkills } = data;

    // Group skills by domain
    const skillsByDomain = acquiredSkills.reduce((acc, skill) => {
      if (!acc[skill.domainName]) {
        acc[skill.domainName] = [];
      }
      acc[skill.domainName].push(skill);
      return acc;
    }, {} as Record<string, typeof acquiredSkills>);

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Livret de parcours - ${user.firstName} ${user.lastName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1f2937;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1d4ed8;
      margin-top: 30px;
    }
    h3 {
      color: #3b82f6;
      margin-top: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .avatar-level {
      font-size: 24px;
      color: #059669;
      font-weight: bold;
    }
    .section {
      margin-bottom: 30px;
    }
    .event {
      margin: 15px 0;
      padding: 10px;
      background: #f3f4f6;
      border-radius: 8px;
    }
    .event-date {
      font-weight: bold;
      color: #6b7280;
    }
    .skill-list {
      list-style: none;
      padding: 0;
    }
    .skill-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .skill-list li:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Livret de Parcours</h1>
    <p><strong>${user.firstName} ${user.lastName}</strong></p>
    <p class="avatar-level">Niveau ${user.avatarLevel}/5</p>
  </div>

  <div class="section">
    <h2>Ma Frise Chronologique</h2>
    ${events.length === 0
      ? '<p>Aucun evenement enregistre.</p>'
      : events.map(e => `
        <div class="event">
          <span class="event-date">${new Date(e.date).toLocaleDateString('fr-FR')}</span>
          <p>${e.title}</p>
        </div>
      `).join('')}
  </div>

  <div class="section">
    <h2>Mes Competences Acquises</h2>
    ${Object.keys(skillsByDomain).length === 0
      ? '<p>Aucune competence acquise pour le moment.</p>'
      : Object.entries(skillsByDomain).map(([domain, skills]) => `
        <h3>${domain}</h3>
        <ul class="skill-list">
          ${skills.map(s => `<li>${s.skillName} <small>(${s.categoryName})</small></li>`).join('')}
        </ul>
      `).join('')}
  </div>

  <div class="footer">
    <p>Document genere le ${new Date().toLocaleDateString('fr-FR')}</p>
    <p>Livret ESAT</p>
  </div>
</body>
</html>
    `;

    return html;
  },
};
