# Implementation Plan: Livret Numérique de Parcours ESAT

**Branch**: `001-esat-skills-portfolio` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-esat-skills-portfolio/spec.md`

## Summary

Application web accessible pour travailleurs ESAT permettant de documenter leur parcours via une frise chronologique, suivre leurs compétences avec un avatar évolutif, et générer un document de synthèse PDF. L'application inclut un back-office administrateur pour gérer les utilisateurs, les référentiels de compétences et valider les acquisitions. Déploiement full Docker avec frontend React, backend Node.js/Express, et PostgreSQL.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend & Backend)
**Primary Dependencies**:
- Frontend: React 18, TailwindCSS, React Router, Axios
- Backend: Node.js 20 LTS, Express.js, Prisma ORM, JWT
- PDF: PDFKit ou Puppeteer
**Storage**: PostgreSQL 16 (données), Stockage local Docker volume (images)
**Testing**: Jest (unit), Playwright (e2e), Supertest (API)
**Target Platform**: Web (navigateurs modernes), Docker containers
**Project Type**: Web application (frontend + backend + database)
**Performance Goals**: < 2s chargement initial, < 500ms interactions, PDF généré < 30s
**Constraints**: WCAG 2.1 AA, RGPD, démo locale Docker, images < 5MB
**Scale/Scope**: Mono-ESAT (~50-200 utilisateurs par instance), ~10 écrans

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Note: La constitution du projet est un template non configuré. Les principes suivants sont appliqués par défaut :

| Principe | Statut | Commentaire |
|----------|--------|-------------|
| Simplicité | ✅ Pass | Architecture 3-tiers standard, pas de sur-ingénierie |
| Testabilité | ✅ Pass | Tests unitaires, intégration et e2e prévus |
| Accessibilité | ✅ Pass | WCAG 2.1 AA requis par la spec |
| Sécurité | ✅ Pass | JWT, rôles, RGPD intégrés |
| Déploiement | ✅ Pass | Full Docker avec docker-compose |

## Project Structure

### Documentation (this feature)

```text
specs/001-esat-skills-portfolio/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Application Web Dockerisée

docker/
├── docker-compose.yml       # Orchestration des services
├── docker-compose.dev.yml   # Override pour développement
├── Dockerfile.frontend      # Build React
├── Dockerfile.backend       # Build Node.js
└── nginx.conf               # Config reverse proxy

backend/
├── src/
│   ├── models/              # Entités Prisma
│   ├── services/            # Logique métier
│   ├── api/
│   │   ├── routes/          # Routes Express
│   │   ├── middlewares/     # Auth, validation, errors
│   │   └── controllers/     # Handlers
│   ├── utils/               # Helpers (PDF, images)
│   └── index.ts             # Point d'entrée
├── prisma/
│   ├── schema.prisma        # Schéma BDD
│   └── seed.ts              # Données initiales
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Boutons, inputs accessibles
│   │   ├── timeline/        # Frise chronologique
│   │   ├── skills/          # Compétences et avatar
│   │   ├── document/        # Génération PDF
│   │   └── admin/           # Back-office
│   ├── pages/
│   │   ├── TimelinePage.tsx
│   │   ├── SkillsPage.tsx
│   │   ├── DocumentPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── admin/
│   │       ├── DashboardPage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── SkillsManagementPage.tsx
│   │       └── ValidationsPage.tsx
│   ├── services/            # API calls
│   ├── hooks/               # Custom hooks
│   ├── context/             # Auth, Theme
│   ├── assets/
│   │   └── avatars/         # Niveaux d'avatar (SVG)
│   └── App.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
└── tsconfig.json

uploads/                     # Volume Docker pour images (hors git)
```

**Structure Decision**: Architecture web standard avec séparation frontend/backend, orchestrée via Docker Compose. Le frontend React est servi par Nginx en production, le backend Express expose une API REST. PostgreSQL stocke les données, les images sont sur un volume Docker.

## Complexity Tracking

> Aucune violation de complexité détectée. Architecture standard pour une application web.

| Composant | Justification |
|-----------|---------------|
| 3 containers Docker | Standard pour web app (frontend, backend, db) |
| Prisma ORM | Simplifie les migrations et le typage TypeScript |
| TailwindCSS | Facilite l'accessibilité et la cohérence UI |
