# Tasks: Livret Numérique de Parcours ESAT

**Feature Branch**: `001-esat-skills-portfolio`
**Generated**: 2025-12-25
**Status**: Ready for implementation

## Overview

Ce document organise les tâches de développement par User Story, avec un graphe de dépendances clair. La priorité P1 représente le MVP, P2 les fonctionnalités complémentaires.

## Dependency Graph

```
[SETUP-1] Docker Infrastructure
     │
     └──► [SETUP-2] Backend Project Init ──► [SETUP-3] Frontend Project Init
              │                                    │
              ▼                                    │
         [AUTH-1] Prisma Schema                    │
              │                                    │
              ▼                                    │
         [AUTH-2] Auth Service                     │
              │                                    │
              ├──────────────────────────────────────┘
              │                                    │
              ▼                                    ▼
         [AUTH-3] Auth API            [FE-AUTH-1] Auth Context
              │                                    │
              └──────────────► [FE-AUTH-2] Login Page
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                       ▼                       ▼
         [US1-*] Timeline        [US2-*] Skills          [US4-*] Admin
                                      │
                                      ▼
                                 [US3-*] Document

         [US5-*] Accessibilité (transversal - appliqué à chaque US)
```

---

## Phase 0: Setup Infrastructure (Prerequisite)

### SETUP-1: Docker Infrastructure
**Priority**: P0 (Prerequisite)
**Estimate**: Foundation
**Dependencies**: None

**Tasks**:
- [ ] SETUP-1.1: Créer `docker/docker-compose.yml` avec services frontend, backend, db
- [ ] SETUP-1.2: Créer `docker/docker-compose.dev.yml` pour override développement
- [ ] SETUP-1.3: Créer `docker/Dockerfile.frontend` (multi-stage)
- [ ] SETUP-1.4: Créer `docker/Dockerfile.backend` (multi-stage)
- [ ] SETUP-1.5: Créer `docker/nginx.conf` pour reverse proxy
- [ ] SETUP-1.6: Créer `.env.example` avec toutes les variables
- [ ] SETUP-1.7: Créer `.dockerignore` pour frontend et backend
- [ ] SETUP-1.8: Tester `docker compose up` et vérifier que les 3 services démarrent

**Acceptance Criteria**:
- `docker compose up -d` démarre les 3 services sans erreur
- PostgreSQL accessible sur port 5432
- Frontend accessible sur port 3000
- Backend accessible sur port 3001

---

### SETUP-2: Backend Project Init
**Priority**: P0 (Prerequisite)
**Estimate**: Foundation
**Dependencies**: SETUP-1

**Tasks**:
- [ ] SETUP-2.1: Initialiser `backend/` avec `npm init` et TypeScript
- [ ] SETUP-2.2: Installer dépendances: express, cors, helmet, bcrypt, jsonwebtoken, zod
- [ ] SETUP-2.3: Installer devDependencies: typescript, ts-node-dev, @types/*
- [ ] SETUP-2.4: Créer `backend/tsconfig.json` avec config stricte
- [ ] SETUP-2.5: Créer structure de dossiers: `src/{api,services,utils,middlewares}`
- [ ] SETUP-2.6: Créer `backend/src/index.ts` avec Express minimal
- [ ] SETUP-2.7: Installer et configurer Prisma
- [ ] SETUP-2.8: Créer script npm: `dev`, `build`, `start`, `test`

**Acceptance Criteria**:
- `npm run dev` démarre le serveur en mode watch
- Route `/health` répond 200

---

### SETUP-3: Frontend Project Init
**Priority**: P0 (Prerequisite)
**Estimate**: Foundation
**Dependencies**: SETUP-1

**Tasks**:
- [ ] SETUP-3.1: Créer projet React avec Vite: `npm create vite@latest frontend -- --template react-ts`
- [ ] SETUP-3.2: Installer dépendances: react-router-dom, axios, @radix-ui/*, lucide-react
- [ ] SETUP-3.3: Installer et configurer TailwindCSS
- [ ] SETUP-3.4: Créer structure de dossiers: `src/{components,pages,services,hooks,context,assets}`
- [ ] SETUP-3.5: Configurer Vite pour proxy API vers backend
- [ ] SETUP-3.6: Créer layout de base avec navigation 3 onglets (placeholder)
- [ ] SETUP-3.7: Configurer ESLint et Prettier

**Acceptance Criteria**:
- `npm run dev` démarre le serveur Vite
- Navigation entre les 3 onglets fonctionne
- TailwindCSS fonctionne (vérifier avec classe de test)

---

## Phase 1: Authentication Foundation

### AUTH-1: Prisma Schema
**Priority**: P0 (Foundation)
**Estimate**: Foundation
**Dependencies**: SETUP-2

**Tasks**:
- [ ] AUTH-1.1: Créer `backend/prisma/schema.prisma` avec tous les modèles (User, Event, Domain, Category, Skill, UserSkill)
- [ ] AUTH-1.2: Définir les enums Role et SkillStatus
- [ ] AUTH-1.3: Configurer les relations et index
- [ ] AUTH-1.4: Exécuter `npx prisma migrate dev --name init`
- [ ] AUTH-1.5: Créer `backend/prisma/seed.ts` avec admin et données de test
- [ ] AUTH-1.6: Configurer script seed dans package.json
- [ ] AUTH-1.7: Exécuter seed et vérifier données

**Acceptance Criteria**:
- Migration appliquée sans erreur
- `npx prisma studio` montre toutes les tables
- Seed crée admin + domaines/catégories/compétences

---

### AUTH-2: Auth Service Backend
**Priority**: P0 (Foundation)
**Estimate**: Foundation
**Dependencies**: AUTH-1

**Tasks**:
- [ ] AUTH-2.1: Créer `backend/src/services/auth.service.ts`
- [ ] AUTH-2.2: Implémenter `login(username, password)` avec bcrypt
- [ ] AUTH-2.3: Implémenter `generateToken(user)` avec JWT
- [ ] AUTH-2.4: Implémenter `verifyToken(token)`
- [ ] AUTH-2.5: Créer middleware `authMiddleware` pour vérifier JWT
- [ ] AUTH-2.6: Créer middleware `adminMiddleware` pour rôle ADMIN
- [ ] AUTH-2.7: Créer `backend/src/utils/password.ts` pour hash/compare
- [ ] AUTH-2.8: Écrire tests unitaires pour auth service

**Acceptance Criteria**:
- Login avec credentials valides retourne JWT
- JWT invalide/expiré rejette la requête
- Tests passent

---

### AUTH-3: Auth API Routes
**Priority**: P0 (Foundation)
**Estimate**: Foundation
**Dependencies**: AUTH-2

**Tasks**:
- [ ] AUTH-3.1: Créer `backend/src/api/routes/auth.routes.ts`
- [ ] AUTH-3.2: Implémenter `POST /api/auth/login`
- [ ] AUTH-3.3: Implémenter `POST /api/auth/logout` (clear cookie)
- [ ] AUTH-3.4: Implémenter `GET /api/auth/me`
- [ ] AUTH-3.5: Configurer cookies HttpOnly, Secure, SameSite
- [ ] AUTH-3.6: Créer schémas Zod pour validation input
- [ ] AUTH-3.7: Écrire tests d'intégration API

**Acceptance Criteria**:
- POST /login avec bon credentials retourne user + set cookie
- GET /me avec cookie valide retourne user connecté
- Tests d'intégration passent

---

### FE-AUTH-1: Auth Context Frontend
**Priority**: P0 (Foundation)
**Estimate**: Foundation
**Dependencies**: AUTH-3

**Tasks**:
- [ ] FE-AUTH-1.1: Créer `frontend/src/context/AuthContext.tsx`
- [ ] FE-AUTH-1.2: Implémenter state: user, isAuthenticated, isLoading
- [ ] FE-AUTH-1.3: Implémenter actions: login, logout, checkAuth
- [ ] FE-AUTH-1.4: Créer `frontend/src/services/auth.service.ts` pour appels API
- [ ] FE-AUTH-1.5: Créer hook `useAuth()`
- [ ] FE-AUTH-1.6: Créer composant `ProtectedRoute`

**Acceptance Criteria**:
- AuthContext persiste état entre refresh (cookie)
- ProtectedRoute redirige vers login si non authentifié

---

### FE-AUTH-2: Login Page
**Priority**: P0 (Foundation)
**Estimate**: Foundation
**Dependencies**: FE-AUTH-1

**Tasks**:
- [ ] FE-AUTH-2.1: Créer `frontend/src/pages/LoginPage.tsx`
- [ ] FE-AUTH-2.2: Design accessible: champs larges, labels clairs, focus visible
- [ ] FE-AUTH-2.3: Implémenter formulaire avec validation
- [ ] FE-AUTH-2.4: Afficher erreurs clairement
- [ ] FE-AUTH-2.5: Rediriger vers frise après login réussi
- [ ] FE-AUTH-2.6: Ajouter pictogramme utilisateur
- [ ] FE-AUTH-2.7: Tester avec lecteur d'écran

**Acceptance Criteria**:
- Login fonctionnel avec redirection
- Erreur affichée si credentials incorrects
- Navigation clavier complète
- Score axe-core 0 violations

---

## Phase 2: User Story 1 - Frise Chronologique (P1 MVP)

### US1-BE-1: Events API Backend
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: AUTH-3

**Tasks**:
- [ ] US1-BE-1.1: Créer `backend/src/services/events.service.ts`
- [ ] US1-BE-1.2: Implémenter `getEventsByUser(userId)` trié par date desc
- [ ] US1-BE-1.3: Implémenter `createEvent(userId, data, photo?)`
- [ ] US1-BE-1.4: Implémenter `updateEvent(eventId, userId, data)`
- [ ] US1-BE-1.5: Implémenter `deleteEvent(eventId, userId)`
- [ ] US1-BE-1.6: Écrire tests unitaires

**Acceptance Criteria**:
- CRUD complet événements
- Un user ne peut voir/modifier que ses propres événements
- Tests passent

---

### US1-BE-2: Image Upload Service
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: US1-BE-1

**Tasks**:
- [ ] US1-BE-2.1: Installer Sharp pour traitement images
- [ ] US1-BE-2.2: Créer `backend/src/services/upload.service.ts`
- [ ] US1-BE-2.3: Implémenter validation format (JPEG, PNG)
- [ ] US1-BE-2.4: Implémenter redimensionnement (max 1200px, thumbnail 200px)
- [ ] US1-BE-2.5: Configurer stockage dans volume Docker `/app/uploads`
- [ ] US1-BE-2.6: Implémenter suppression image à la suppression d'event
- [ ] US1-BE-2.7: Servir images statiques via Express

**Acceptance Criteria**:
- Upload image < 5MB accepté
- Formats invalides rejetés
- Thumbnail généré automatiquement
- Images accessibles via URL

---

### US1-BE-3: Events API Routes
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: US1-BE-2

**Tasks**:
- [ ] US1-BE-3.1: Créer `backend/src/api/routes/events.routes.ts`
- [ ] US1-BE-3.2: Implémenter `GET /api/events`
- [ ] US1-BE-3.3: Implémenter `POST /api/events` (multipart/form-data)
- [ ] US1-BE-3.4: Implémenter `GET /api/events/:eventId`
- [ ] US1-BE-3.5: Implémenter `PATCH /api/events/:eventId`
- [ ] US1-BE-3.6: Implémenter `DELETE /api/events/:eventId`
- [ ] US1-BE-3.7: Configurer multer pour upload
- [ ] US1-BE-3.8: Écrire tests d'intégration

**Acceptance Criteria**:
- API conforme à OpenAPI spec
- Upload photo fonctionne
- Tests d'intégration passent

---

### US1-FE-1: Timeline Components
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: FE-AUTH-2

**Tasks**:
- [ ] US1-FE-1.1: Créer `frontend/src/components/timeline/Timeline.tsx`
- [ ] US1-FE-1.2: Créer `frontend/src/components/timeline/TimelineEvent.tsx`
- [ ] US1-FE-1.3: Design vertical scrollable avec dates à gauche
- [ ] US1-FE-1.4: Afficher miniature photo si présente
- [ ] US1-FE-1.5: Implémenter click pour voir détail
- [ ] US1-FE-1.6: Ajouter états vide et loading
- [ ] US1-FE-1.7: Tester accessibilité (role="list", aria-label)

**Acceptance Criteria**:
- Frise affiche événements chronologiquement
- Navigation clavier entre événements
- Lecteur d'écran annonce correctement

---

### US1-FE-2: Event Form Modal
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: US1-FE-1

**Tasks**:
- [ ] US1-FE-2.1: Créer `frontend/src/components/timeline/EventFormModal.tsx`
- [ ] US1-FE-2.2: Utiliser Radix Dialog pour accessibilité
- [ ] US1-FE-2.3: Champs: date (picker accessible), titre (100 chars), photo (optionnelle)
- [ ] US1-FE-2.4: Implémenter preview photo avant upload
- [ ] US1-FE-2.5: Validation et messages d'erreur clairs
- [ ] US1-FE-2.6: Mode création et édition
- [ ] US1-FE-2.7: Focus trap dans modal

**Acceptance Criteria**:
- Modal accessible (Escape ferme, focus trap)
- Formulaire valide avant soumission
- Photo preview fonctionnel

---

### US1-FE-3: Timeline Page Integration
**Priority**: P1
**User Story**: US1 - Frise chronologique
**Dependencies**: US1-BE-3, US1-FE-2

**Tasks**:
- [ ] US1-FE-3.1: Créer `frontend/src/pages/TimelinePage.tsx`
- [ ] US1-FE-3.2: Créer `frontend/src/services/events.service.ts`
- [ ] US1-FE-3.3: Intégrer Timeline avec données API
- [ ] US1-FE-3.4: Bouton FAB "+" pour ajouter (pictogramme)
- [ ] US1-FE-3.5: Implémenter suppression avec confirmation
- [ ] US1-FE-3.6: Message encourageant si frise vide
- [ ] US1-FE-3.7: Tests e2e Playwright pour US1

**Acceptance Criteria**:
- Scénarios US1 acceptance passent
- Ajout événement < 2 minutes (SC-001)
- Tests e2e passent

---

## Phase 3: User Story 2 - Compétences & Avatar (P1 MVP)

### US2-BE-1: Skills Hierarchy API
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: AUTH-3

**Tasks**:
- [ ] US2-BE-1.1: Créer `backend/src/services/skills.service.ts`
- [ ] US2-BE-1.2: Implémenter `getSkillsHierarchy()` - domaines > catégories > compétences
- [ ] US2-BE-1.3: Optimiser avec include pour éviter N+1
- [ ] US2-BE-1.4: Créer `backend/src/api/routes/skills.routes.ts`
- [ ] US2-BE-1.5: Implémenter `GET /api/domains` avec hiérarchie complète
- [ ] US2-BE-1.6: Tests unitaires et intégration

**Acceptance Criteria**:
- Hiérarchie complète retournée en une requête
- Compétences inactives exclues pour users (incluses pour admin)

---

### US2-BE-2: User Skills Service
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: US2-BE-1

**Tasks**:
- [ ] US2-BE-2.1: Créer `backend/src/services/userSkills.service.ts`
- [ ] US2-BE-2.2: Implémenter `getUserSkillsSummary(userId)`
- [ ] US2-BE-2.3: Implémenter `addSkillToUser(userId, skillId, status)`
- [ ] US2-BE-2.4: Implémenter `updateUserSkillStatus(userId, skillId, status)`
- [ ] US2-BE-2.5: Implémenter `removeSkillFromUser(userId, skillId)`
- [ ] US2-BE-2.6: Implémenter calcul automatique avatar level
- [ ] US2-BE-2.7: Tests unitaires

**Acceptance Criteria**:
- Récapitulatif par statut (acquired, inProgress, pending, rejected)
- Avatar level mis à jour automatiquement après validation

---

### US2-BE-3: User Skills API Routes
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: US2-BE-2

**Tasks**:
- [ ] US2-BE-3.1: Créer `backend/src/api/routes/userSkills.routes.ts`
- [ ] US2-BE-3.2: Implémenter `GET /api/my-skills`
- [ ] US2-BE-3.3: Implémenter `POST /api/my-skills/:skillId`
- [ ] US2-BE-3.4: Implémenter `PATCH /api/my-skills/:skillId`
- [ ] US2-BE-3.5: Implémenter `DELETE /api/my-skills/:skillId`
- [ ] US2-BE-3.6: Validation: user ne peut que IN_PROGRESS ou PENDING_VALIDATION
- [ ] US2-BE-3.7: Tests d'intégration

**Acceptance Criteria**:
- API conforme à OpenAPI spec
- Transitions de statut respectées

---

### US2-FE-1: Skills Hierarchy Component
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: FE-AUTH-2

**Tasks**:
- [ ] US2-FE-1.1: Créer `frontend/src/components/skills/SkillsHierarchy.tsx`
- [ ] US2-FE-1.2: Créer `frontend/src/components/skills/DomainAccordion.tsx`
- [ ] US2-FE-1.3: Créer `frontend/src/components/skills/SkillCard.tsx`
- [ ] US2-FE-1.4: Afficher pictogramme + texte court pour chaque compétence
- [ ] US2-FE-1.5: Indiquer statut si compétence déjà ajoutée
- [ ] US2-FE-1.6: Navigation clavier dans accordéons
- [ ] US2-FE-1.7: Tests accessibilité axe-core

**Acceptance Criteria**:
- Hiérarchie navigable au clavier
- Compétences affichées avec pictogrammes
- Statut visible (badge couleur)

---

### US2-FE-2: Avatar Component
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: US2-FE-1

**Tasks**:
- [ ] US2-FE-2.1: Créer assets SVG pour 5 niveaux avatar dans `frontend/src/assets/avatars/`
- [ ] US2-FE-2.2: Créer `frontend/src/components/skills/Avatar.tsx`
- [ ] US2-FE-2.3: Implémenter affichage conditionnel accessoires par niveau
- [ ] US2-FE-2.4: Animation transition niveau
- [ ] US2-FE-2.5: Description accessible du niveau (aria-label)
- [ ] US2-FE-2.6: Afficher progression (ex: "Niveau 3/5")

**Acceptance Criteria**:
- Avatar visuellement différent à chaque niveau
- Animation fluide au changement de niveau
- Accessible aux lecteurs d'écran

---

### US2-FE-3: Skills Summary Component
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: US2-FE-1

**Tasks**:
- [ ] US2-FE-3.1: Créer `frontend/src/components/skills/SkillsSummary.tsx`
- [ ] US2-FE-3.2: Afficher compteurs: acquises, en cours, en attente
- [ ] US2-FE-3.3: Design avec badges colorés accessibles
- [ ] US2-FE-3.4: Liste des compétences par catégorie
- [ ] US2-FE-3.5: Filtres par statut (optionnel)

**Acceptance Criteria**:
- Récapitulatif clair des statuts
- Cohérent avec FR-008b

---

### US2-FE-4: Skills Page Integration
**Priority**: P1
**User Story**: US2 - Compétences & Avatar
**Dependencies**: US2-BE-3, US2-FE-2, US2-FE-3

**Tasks**:
- [ ] US2-FE-4.1: Créer `frontend/src/pages/SkillsPage.tsx`
- [ ] US2-FE-4.2: Créer `frontend/src/services/skills.service.ts`
- [ ] US2-FE-4.3: Layout: Avatar en haut, récapitulatif, puis hiérarchie
- [ ] US2-FE-4.4: Modal d'ajout/demande validation pour compétence
- [ ] US2-FE-4.5: Feedback visuel immédiat après action
- [ ] US2-FE-4.6: Message explicatif si référentiel vide
- [ ] US2-FE-4.7: Tests e2e Playwright pour US2

**Acceptance Criteria**:
- Scénarios US2 acceptance passent
- Avatar évolue après validation (SC-003)
- Tests e2e passent

---

## Phase 4: User Story 5 - Accessibilité (P1 transversal)

### US5-1: Accessibility Foundation
**Priority**: P1
**User Story**: US5 - Accessibilité
**Dependencies**: SETUP-3

**Tasks**:
- [ ] US5-1.1: Configurer `<html lang="fr">`
- [ ] US5-1.2: Créer composant SkipLink
- [ ] US5-1.3: Configurer focus-visible styles globaux
- [ ] US5-1.4: Vérifier contrastes palette TailwindCSS (ratio 4.5:1)
- [ ] US5-1.5: Créer composants de base accessibles (Button, Input, Select)
- [ ] US5-1.6: Configurer landmarks (header, nav, main, footer)

**Acceptance Criteria**:
- Skip link fonctionnel
- Focus visible sur tous éléments interactifs
- Landmarks corrects

---

### US5-2: Screen Reader Testing
**Priority**: P1
**User Story**: US5 - Accessibilité
**Dependencies**: US1-FE-3, US2-FE-4

**Tasks**:
- [ ] US5-2.1: Tester navigation complète avec NVDA/VoiceOver
- [ ] US5-2.2: Vérifier annonces aria-live pour changements dynamiques
- [ ] US5-2.3: Corriger problèmes identifiés
- [ ] US5-2.4: Documenter comportement attendu lecteur d'écran

**Acceptance Criteria**:
- Navigation complète possible avec lecteur d'écran
- Changements annoncés (validations, ajouts, erreurs)

---

### US5-3: Automated Accessibility Testing
**Priority**: P1
**User Story**: US5 - Accessibilité
**Dependencies**: US1-FE-3, US2-FE-4

**Tasks**:
- [ ] US5-3.1: Configurer jest-axe pour tests unitaires
- [ ] US5-3.2: Configurer @axe-core/playwright pour tests e2e
- [ ] US5-3.3: Ajouter tests axe à tous les composants principaux
- [ ] US5-3.4: Configurer CI pour échouer si violations WCAG 2.1 AA
- [ ] US5-3.5: Vérifier score Lighthouse Accessibility > 90

**Acceptance Criteria**:
- 0 violation axe-core WCAG 2.1 AA
- Score Lighthouse > 90
- Tests automatisés dans CI

---

## Phase 5: User Story 4 - Back-Office Administration (P2)

### US4-BE-1: Users Management API
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: AUTH-3

**Tasks**:
- [ ] US4-BE-1.1: Créer `backend/src/services/users.service.ts`
- [ ] US4-BE-1.2: Implémenter `getAllUsers(filters)` avec filtres role/isActive
- [ ] US4-BE-1.3: Implémenter `createUser(data)` (admin only)
- [ ] US4-BE-1.4: Implémenter `updateUser(userId, data)`
- [ ] US4-BE-1.5: Implémenter `getUserPortfolio(userId)` - lecture seule
- [ ] US4-BE-1.6: Créer routes dans `backend/src/api/routes/users.routes.ts`
- [ ] US4-BE-1.7: Tests d'intégration

**Acceptance Criteria**:
- CRUD users admin only
- Portfolio lecture seule disponible

---

### US4-BE-2: Skills Management API (Admin)
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: US2-BE-1

**Tasks**:
- [ ] US4-BE-2.1: Ajouter CRUD domaines dans skills.service.ts
- [ ] US4-BE-2.2: Ajouter CRUD catégories
- [ ] US4-BE-2.3: Ajouter CRUD compétences
- [ ] US4-BE-2.4: Routes admin: POST/PATCH/DELETE pour domains, categories, skills
- [ ] US4-BE-2.5: Validation admin middleware sur toutes les routes
- [ ] US4-BE-2.6: Tests d'intégration

**Acceptance Criteria**:
- Admin peut créer/modifier/supprimer hiérarchie compétences
- Non-admin rejeté avec 403

---

### US4-BE-3: Validations API
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: US2-BE-2

**Tasks**:
- [ ] US4-BE-3.1: Créer `backend/src/services/validations.service.ts`
- [ ] US4-BE-3.2: Implémenter `getPendingValidations()`
- [ ] US4-BE-3.3: Implémenter `approveSkill(userSkillId, adminId)`
- [ ] US4-BE-3.4: Implémenter `rejectSkill(userSkillId, adminId, reason)`
- [ ] US4-BE-3.5: Mettre à jour avatarLevel dans transaction
- [ ] US4-BE-3.6: Créer routes dans `backend/src/api/routes/validations.routes.ts`
- [ ] US4-BE-3.7: Tests d'intégration

**Acceptance Criteria**:
- Liste validations en attente
- Validation met à jour status + avatarLevel
- Refus enregistre raison

---

### US4-FE-1: Admin Layout & Navigation
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: FE-AUTH-2

**Tasks**:
- [ ] US4-FE-1.1: Créer `frontend/src/components/admin/AdminLayout.tsx`
- [ ] US4-FE-1.2: Sidebar avec sections: Utilisateurs, Compétences, Validations
- [ ] US4-FE-1.3: Protéger routes admin (role === ADMIN)
- [ ] US4-FE-1.4: Navigation accessible

**Acceptance Criteria**:
- Layout admin distinct
- Redirect si non-admin

---

### US4-FE-2: Users Management Page
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: US4-BE-1, US4-FE-1

**Tasks**:
- [ ] US4-FE-2.1: Créer `frontend/src/pages/admin/UsersPage.tsx`
- [ ] US4-FE-2.2: Liste utilisateurs avec filtres (rôle, statut)
- [ ] US4-FE-2.3: Modal création utilisateur
- [ ] US4-FE-2.4: Modal édition utilisateur
- [ ] US4-FE-2.5: Bouton voir portfolio (lecture seule)
- [ ] US4-FE-2.6: Confirmation désactivation compte

**Acceptance Criteria**:
- Scénarios US4.6-4.8 passent
- Portfolio visible en lecture seule

---

### US4-FE-3: Skills Management Page
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: US4-BE-2, US4-FE-1

**Tasks**:
- [ ] US4-FE-3.1: Créer `frontend/src/pages/admin/SkillsManagementPage.tsx`
- [ ] US4-FE-3.2: Interface arborescente domaines > catégories > compétences
- [ ] US4-FE-3.3: CRUD inline ou modal pour chaque niveau
- [ ] US4-FE-3.4: Drag & drop pour réordonner (optionnel)
- [ ] US4-FE-3.5: Confirmation suppression avec impact

**Acceptance Criteria**:
- Scénarios US4.1-4.3 passent
- Création compétence < 3 minutes (SC-007)

---

### US4-FE-4: Validations Page
**Priority**: P2
**User Story**: US4 - Back-office
**Dependencies**: US4-BE-3, US4-FE-1

**Tasks**:
- [ ] US4-FE-4.1: Créer `frontend/src/pages/admin/ValidationsPage.tsx`
- [ ] US4-FE-4.2: Liste des demandes en attente groupées par utilisateur
- [ ] US4-FE-4.3: Actions valider/refuser avec raison obligatoire pour refus
- [ ] US4-FE-4.4: Notification visuelle succès
- [ ] US4-FE-4.5: Tests e2e Playwright pour US4

**Acceptance Criteria**:
- Scénarios US4.4-4.5 passent
- Tests e2e passent

---

## Phase 6: User Story 3 - Génération PDF (P2)

### US3-BE-1: Document Service
**Priority**: P2
**User Story**: US3 - Génération PDF
**Dependencies**: US1-BE-1, US2-BE-2

**Tasks**:
- [ ] US3-BE-1.1: Installer Puppeteer
- [ ] US3-BE-1.2: Créer `backend/src/services/document.service.ts`
- [ ] US3-BE-1.3: Implémenter `getDocumentPreview(userId)` - données JSON
- [ ] US3-BE-1.4: Créer template HTML pour PDF
- [ ] US3-BE-1.5: Implémenter `generatePdf(userId)` avec Puppeteer
- [ ] US3-BE-1.6: Inclure frise chronologique et compétences acquises
- [ ] US3-BE-1.7: Tests unitaires

**Acceptance Criteria**:
- PDF généré < 30s (SC-004)
- Contenu lisible et valorisant

---

### US3-BE-2: Document API Routes
**Priority**: P2
**User Story**: US3 - Génération PDF
**Dependencies**: US3-BE-1

**Tasks**:
- [ ] US3-BE-2.1: Créer `backend/src/api/routes/documents.routes.ts`
- [ ] US3-BE-2.2: Implémenter `GET /api/documents/preview`
- [ ] US3-BE-2.3: Implémenter `POST /api/documents/generate`
- [ ] US3-BE-2.4: Configurer headers Content-Disposition pour téléchargement
- [ ] US3-BE-2.5: Tests d'intégration

**Acceptance Criteria**:
- API conforme à OpenAPI spec
- Téléchargement PDF fonctionnel

---

### US3-FE-1: Document Page
**Priority**: P2
**User Story**: US3 - Génération PDF
**Dependencies**: US3-BE-2

**Tasks**:
- [ ] US3-FE-1.1: Créer `frontend/src/pages/DocumentPage.tsx`
- [ ] US3-FE-1.2: Créer `frontend/src/services/document.service.ts`
- [ ] US3-FE-1.3: Afficher aperçu du document (preview)
- [ ] US3-FE-1.4: Bouton téléchargement avec pictogramme
- [ ] US3-FE-1.5: État loading pendant génération
- [ ] US3-FE-1.6: Message si aucun contenu à générer
- [ ] US3-FE-1.7: Tests e2e Playwright pour US3

**Acceptance Criteria**:
- Scénarios US3 acceptance passent
- Tests e2e passent

---

## Phase 7: Polish & Testing

### POLISH-1: Final UI Polish
**Priority**: P2
**Dependencies**: All US complete

**Tasks**:
- [ ] POLISH-1.1: Vérifier cohérence visuelle toutes pages
- [ ] POLISH-1.2: Optimiser responsive mobile/tablette
- [ ] POLISH-1.3: Ajouter animations/transitions subtiles
- [ ] POLISH-1.4: Vérifier tous les edge cases spec
- [ ] POLISH-1.5: Ajouter feedback visuel actions (toast notifications)

---

### POLISH-2: Performance Optimization
**Priority**: P2
**Dependencies**: All US complete

**Tasks**:
- [ ] POLISH-2.1: Analyser bundle size frontend
- [ ] POLISH-2.2: Implémenter lazy loading pages
- [ ] POLISH-2.3: Optimiser requêtes API (pagination si nécessaire)
- [ ] POLISH-2.4: Configurer cache headers
- [ ] POLISH-2.5: Vérifier performance goals (< 2s initial, < 500ms interactions)

---

### POLISH-3: Final Testing
**Priority**: P2
**Dependencies**: POLISH-1, POLISH-2

**Tasks**:
- [ ] POLISH-3.1: Run full test suite (unit + integration + e2e)
- [ ] POLISH-3.2: Test manuel complet avec utilisateur cible
- [ ] POLISH-3.3: Audit Lighthouse (Performance, Accessibility, Best Practices)
- [ ] POLISH-3.4: Test avec différents navigateurs
- [ ] POLISH-3.5: Documenter bugs connus / limitations

**Acceptance Criteria**:
- Tous les tests passent
- Lighthouse Accessibility > 90
- Tous les SC-00X atteints

---

## Summary

| Phase | Tasks | Priority | Dependencies |
|-------|-------|----------|--------------|
| Phase 0: Setup | SETUP-1 to SETUP-3 | P0 | None |
| Phase 1: Auth | AUTH-1 to FE-AUTH-2 | P0 | Phase 0 |
| Phase 2: US1 Frise | US1-BE-1 to US1-FE-3 | P1 | Phase 1 |
| Phase 3: US2 Compétences | US2-BE-1 to US2-FE-4 | P1 | Phase 1 |
| Phase 4: US5 Accessibilité | US5-1 to US5-3 | P1 | Phase 2, 3 |
| Phase 5: US4 Back-office | US4-BE-1 to US4-FE-4 | P2 | Phase 1, 2, 3 |
| Phase 6: US3 Document | US3-BE-1 to US3-FE-1 | P2 | Phase 2, 3 |
| Phase 7: Polish | POLISH-1 to POLISH-3 | P2 | All phases |

**Total Tasks**: ~65 tasks organized in 7 phases

**MVP (P1)**: Phases 0-4 (Setup, Auth, Frise, Compétences, Accessibilité)
**Full Release (P2)**: Phases 5-7 (Back-office, Document, Polish)
