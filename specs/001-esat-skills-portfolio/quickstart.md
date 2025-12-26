# Quickstart: Livret Numérique ESAT

Guide de démarrage rapide pour l'environnement de développement.

## Prérequis

- **Docker** >= 24.0
- **Docker Compose** >= 2.20
- **Node.js** >= 20 LTS (pour développement local sans Docker)
- **Git**

## Démarrage rapide (Docker)

```bash
# 1. Cloner le repository
git clone <repo-url>
cd audrey-demo

# 2. Copier les variables d'environnement
cp .env.example .env

# 3. Lancer tous les services
docker compose up -d

# 4. Initialiser la base de données (première fois)
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed

# 5. Accéder à l'application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Adminer (BDD): http://localhost:8080
```

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL=postgresql://esat:esat_password@db:5432/esat_livret
POSTGRES_USER=esat
POSTGRES_PASSWORD=esat_password
POSTGRES_DB=esat_livret

# Backend
NODE_ENV=development
JWT_SECRET=change-me-in-production-min-32-chars
JWT_EXPIRES_IN=24h
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001/api

# Uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=/app/uploads
```

## Structure des commandes Docker

```bash
# Démarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Arrêter tous les services
docker compose down

# Reconstruire après modification Dockerfile
docker compose build
docker compose up -d

# Accéder au shell d'un container
docker compose exec backend sh
docker compose exec frontend sh

# Exécuter une commande Prisma
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate dev --name <nom>

# Reset complet de la BDD
docker compose exec backend npx prisma migrate reset
```

## Développement local (sans Docker complet)

Si vous préférez développer sans Docker pour le hot-reload :

```bash
# 1. Lancer uniquement la BDD
docker compose up -d db

# 2. Backend (terminal 1)
cd backend
npm install
cp .env.example .env
# Modifier DATABASE_URL pour pointer vers localhost:5432
npm run dev

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

## Comptes de test

Après le seed initial :

| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | ADMIN |
| marie | user123 | USER |
| pierre | user123 | USER |

## Endpoints principaux

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Connexion |
| `GET /api/auth/me` | Utilisateur courant |
| `GET /api/events` | Mes événements (frise) |
| `GET /api/domains` | Référentiel compétences |
| `GET /api/my-skills` | Mes compétences |
| `GET /api/validations` | Validations en attente (admin) |
| `POST /api/documents/generate` | Générer PDF |

Documentation complète : `specs/001-esat-skills-portfolio/contracts/openapi.yaml`

## Tests

```bash
# Tests backend
docker compose exec backend npm test

# Tests e2e (nécessite app démarrée)
docker compose exec frontend npm run test:e2e

# Tests accessibilité
docker compose exec frontend npm run test:a11y
```

## Problèmes courants

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
# Ou modifier les ports dans docker-compose.yml
```

### Erreur Prisma "Database does not exist"
```bash
docker compose exec backend npx prisma migrate dev
```

### Images non affichées
Vérifier que le volume `uploads` est bien monté :
```bash
docker compose exec backend ls -la /app/uploads
```

### Hot reload ne fonctionne pas
En mode développement local, vérifier que les volumes sont bien montés dans `docker-compose.dev.yml`.

## Architecture des services

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Frontend │    │ Backend  │    │    DB    │              │
│  │  :3000   │───▶│  :3001   │───▶│  :5432   │              │
│  │  (Nginx) │    │ (Express)│    │(Postgres)│              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                        │                                     │
│                        ▼                                     │
│                  ┌──────────┐                                │
│                  │ Uploads  │                                │
│                  │ (Volume) │                                │
│                  └──────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

## Prochaines étapes

1. Lancer l'environnement avec `docker compose up -d`
2. Se connecter avec le compte admin
3. Créer quelques compétences dans le back-office
4. Tester le parcours utilisateur
5. Générer un document PDF
