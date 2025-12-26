# Agents de Développement - Livret ESAT

Ce dossier contient les configurations d'agents spécialisés pour guider le développement du projet.

## Agents disponibles

| Agent | Fichier | Spécialité |
|-------|---------|------------|
| **Frontend React** | `frontend-react.md` | React, TypeScript, TailwindCSS, Radix UI, accessibilité |
| **Backend API** | `backend-api.md` | Node.js, Express, Prisma, JWT, Zod |
| **Database Prisma** | `database-prisma.md` | PostgreSQL, schéma Prisma, migrations, seeds |
| **Docker DevOps** | `docker-devops.md` | Docker Compose, multi-stage builds, Nginx |
| **Accessibilité** | `accessibility-expert.md` | WCAG 2.1 AA, ARIA, navigation clavier, lecteurs d'écran |
| **Testing QA** | `testing-qa.md` | Jest, Playwright, Supertest, axe-core |

## Comment utiliser les agents

### Avec Claude Code

Copiez le contenu de l'agent pertinent dans le contexte de la conversation :

```bash
# Exemple : travailler sur le frontend
cat .specify/agents/frontend-react.md
```

Puis demandez à Claude de suivre les guidelines de cet agent pour la tâche.

### Workflow recommandé

1. **Nouvelle fonctionnalité frontend** : `frontend-react.md` + `accessibility-expert.md`
2. **Nouvelle route API** : `backend-api.md` + `database-prisma.md`
3. **Configuration Docker** : `docker-devops.md`
4. **Écriture de tests** : `testing-qa.md`
5. **Revue accessibilité** : `accessibility-expert.md`

## Couverture par User Story

| User Story | Agents recommandés |
|------------|-------------------|
| US1 - Frise chronologique | frontend-react, backend-api, accessibility-expert |
| US2 - Compétences & Avatar | frontend-react, backend-api, database-prisma |
| US3 - Génération PDF | backend-api |
| US4 - Back-office admin | frontend-react, backend-api, database-prisma |
| US5 - Accessibilité | accessibility-expert, frontend-react, testing-qa |

## Structure de référence

```
project/
├── .specify/
│   └── agents/           # Ce dossier
├── docker/               # Configuration Docker
├── backend/              # API Node.js + Express
├── frontend/             # App React
└── specs/                # Spécifications
```

## Mises à jour

Les agents doivent être mis à jour si :
- Changement de stack technique
- Nouvelles conventions de code
- Ajout de dépendances majeures
- Retours d'expérience sur les patterns

## Quick Reference

### Commandes Docker
```bash
docker compose up -d              # Démarrer
docker compose logs -f backend    # Logs
docker compose exec backend sh    # Shell
```

### Commandes Prisma
```bash
npx prisma migrate dev            # Migration
npx prisma studio                 # Interface BDD
npx prisma db seed                # Seed data
```

### Commandes Test
```bash
npm test                          # Tests unitaires
npm run test:e2e                  # Tests E2E
npm run test:coverage             # Couverture
```
