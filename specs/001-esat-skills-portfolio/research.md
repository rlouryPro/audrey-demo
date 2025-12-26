# Research: Livret Numérique de Parcours ESAT

**Date**: 2025-12-25
**Feature**: 001-esat-skills-portfolio

## Résumé des décisions techniques

Ce document consolide les recherches effectuées pour les choix technologiques de l'application.

---

## 1. Stack Frontend

### Decision: React 18 + TypeScript + TailwindCSS

**Rationale**:
- **React 18** : Écosystème mature, large communauté, excellent support accessibilité (aria-*)
- **TypeScript** : Typage fort pour réduire les bugs, meilleure maintenabilité
- **TailwindCSS** : Classes utilitaires facilitant l'accessibilité (focus-visible, contrastes), design system cohérent sans CSS custom complexe

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| Vue.js 3 | Communauté plus petite, moins de composants accessibles prêts à l'emploi |
| Angular | Courbe d'apprentissage plus raide, over-engineering pour ce projet |
| Vanilla JS | Pas de typage, maintenance plus difficile |

**Packages accessibilité recommandés**:
- `@radix-ui/react-*` : Composants headless accessibles
- `react-aria` : Hooks Adobe pour accessibilité
- `axe-core` : Tests automatisés WCAG

---

## 2. Stack Backend

### Decision: Node.js 20 LTS + Express.js + Prisma

**Rationale**:
- **Node.js 20 LTS** : Support long terme, performance excellente, même langage que frontend
- **Express.js** : Framework minimaliste, flexible, mature
- **Prisma ORM** : Typage TypeScript natif, migrations automatiques, excellent DX

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| NestJS | Over-engineering pour une application de cette taille |
| Fastify | Moins de middleware ecosystem que Express |
| Python/FastAPI | Changement de langage, complexité Docker accrue |
| TypeORM | DX inférieur à Prisma, moins de typage |

**Structure API**:
- REST classique (pas GraphQL - simplicité)
- JWT pour authentification stateless
- Validation avec `zod` ou `joi`

---

## 3. Base de données

### Decision: PostgreSQL 16

**Rationale**:
- Base relationnelle robuste pour données structurées (utilisateurs, compétences, événements)
- Support JSON natif si besoin de flexibilité
- Excellent support Docker
- Gratuit et open-source

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| MySQL | Moins de fonctionnalités avancées |
| SQLite | Pas adapté multi-utilisateurs concurrent |
| MongoDB | Over-kill, données très relationnelles |

---

## 4. Génération PDF

### Decision: Puppeteer (HTML to PDF)

**Rationale**:
- Permet de réutiliser les composants React pour le rendu
- Qualité d'impression excellente
- Flexibilité totale sur le design
- Support images intégré

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| PDFKit | API bas niveau, difficile pour layouts complexes |
| jsPDF | Rendu moins fidèle, limitations sur les fonts |
| WeasyPrint | Python, ajout de dépendance |
| react-pdf | Syntaxe spécifique, pas de réutilisation HTML |

**Implémentation**:
- Service backend dédié
- Template HTML/CSS pour le document
- Chromium headless dans Docker

---

## 5. Gestion des images

### Decision: Stockage local (Docker volume) + Sharp pour redimensionnement

**Rationale**:
- **Stockage local** : Simplicité pour démo, pas de dépendance cloud
- **Sharp** : Librairie Node.js ultra-performante pour traitement images
- Volume Docker persistant pour les uploads

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| MinIO (S3) | Over-engineering pour démo locale |
| Cloudinary | Dépendance externe, coût |
| Base64 en BDD | Performance catastrophique |

**Contraintes implémentées**:
- Taille max : 5 MB par image
- Formats acceptés : JPEG, PNG
- Redimensionnement automatique : 800px max width
- Génération miniatures : 200px pour timeline

---

## 6. Authentification

### Decision: JWT + bcrypt + cookies HttpOnly

**Rationale**:
- **JWT** : Stateless, facile à valider, contient les infos de rôle
- **bcrypt** : Standard pour hashing mots de passe
- **Cookies HttpOnly** : Protection XSS, meilleur que localStorage

**Flow**:
1. Login avec identifiant/mot de passe
2. Backend génère JWT (expire 24h)
3. JWT stocké en cookie HttpOnly
4. Refresh token pour renouvellement silencieux

**Sécurité**:
- CORS configuré strictement
- Rate limiting sur login
- Validation rôle sur chaque requête protégée

---

## 7. Accessibilité (WCAG 2.1 AA)

### Decision: Composants Radix UI + tests axe-core

**Rationale**:
- **Radix UI** : Composants headless 100% accessibles (dialogs, menus, etc.)
- **axe-core** : Tests automatisés dans CI/CD
- **Focus management** : Navigation clavier complète

**Checklist implémentation**:
- [ ] Contraste minimum 4.5:1 pour textes
- [ ] Focus visible sur tous éléments interactifs
- [ ] Labels sur tous les champs de formulaire
- [ ] Alt text sur toutes les images
- [ ] Navigation clavier complète
- [ ] Annonces ARIA pour changements dynamiques
- [ ] Textes courts (max 3 mots navigation)
- [ ] Pictogrammes avec labels

---

## 8. Docker & Déploiement

### Decision: Docker Compose multi-services

**Architecture**:
```yaml
services:
  frontend:    # Nginx + React build
  backend:     # Node.js Express
  db:          # PostgreSQL
  # chromium intégré au backend pour PDF
```

**Rationale**:
- `docker-compose up` démarre tout l'environnement
- Isolation des services
- Reproductibilité garantie
- Volumes pour persistance (db, uploads)

**Environnements**:
- `docker-compose.yml` : Production-like
- `docker-compose.dev.yml` : Hot reload, ports exposés

---

## 9. Avatar évolutif

### Decision: SVG composables avec 5 niveaux

**Rationale**:
- **SVG** : Léger, scalable, manipulable via CSS/JS
- **Composable** : Base + accessoires selon niveau
- **5 niveaux** : Progression visible et motivante

**Implémentation**:
| Niveau | Compétences acquises | Évolution visuelle |
|--------|---------------------|-------------------|
| 1 | 0-2 | Avatar de base |
| 2 | 3-5 | + Accessoire 1 (chapeau) |
| 3 | 6-10 | + Accessoire 2 (badge) |
| 4 | 11-15 | + Couleur spéciale |
| 5 | 16+ | Avatar complet + effet brillance |

**Assets**:
- 1 SVG de base
- 4 overlays d'accessoires
- Animation CSS pour transitions

---

## 10. Frise chronologique

### Decision: Composant React custom avec scroll horizontal

**Rationale**:
- Pas de librairie externe (simplicité, accessibilité contrôlée)
- Scroll horizontal natif avec touch support
- Responsive : vertical sur mobile

**Alternatives considérées**:
| Alternative | Rejetée car |
|-------------|-------------|
| vis-timeline | Trop complexe, accessibilité limitée |
| react-chrono | Styling difficile à customiser |
| D3.js | Over-engineering |

**Implémentation**:
- Flexbox horizontal
- Points cliquables (événements)
- Modal pour ajout/édition
- Lazy loading images

---

## Résumé des dépendances principales

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@axe-core/react": "^4.x",
    "playwright": "^1.x",
    "jest": "^29.x"
  }
}
```

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.x",
    "@prisma/client": "^5.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "sharp": "^0.33.x",
    "puppeteer": "^22.x",
    "zod": "^3.x",
    "cors": "^2.x",
    "helmet": "^7.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "jest": "^29.x",
    "supertest": "^6.x"
  }
}
```
