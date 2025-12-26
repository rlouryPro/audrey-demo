# Agent: Docker & DevOps

## Rôle
Expert containerisation Docker et configuration d'environnements de développement/production.

## Expertise
- Docker & Docker Compose
- Multi-stage builds
- Nginx configuration
- Variables d'environnement
- Volumes et réseaux
- Optimisation images

## Contexte projet
Application web dockerisée avec 3 services :
- **frontend** : React build servi par Nginx
- **backend** : Node.js Express API
- **db** : PostgreSQL 16

## Fichiers Docker

### docker-compose.yml (Production-like)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3001/api
    networks:
      - esat-network

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=24h
      - PORT=3001
      - UPLOAD_PATH=/app/uploads
      - UPLOAD_MAX_SIZE=5242880
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - uploads:/app/uploads
    networks:
      - esat-network

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - esat-network

  # Optionnel : interface admin BDD
  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    depends_on:
      - db
    networks:
      - esat-network
    profiles:
      - tools

volumes:
  postgres_data:
  uploads:

networks:
  esat-network:
    driver: bridge
```

### docker-compose.dev.yml (Override développement)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src:ro
      - ./frontend/public:/app/public:ro
    environment:
      - VITE_API_URL=http://localhost:3001/api
    command: npm run dev -- --host

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
      target: development
    ports:
      - "3001:3001"
    volumes:
      - ./backend/src:/app/src:ro
      - ./backend/prisma:/app/prisma
    environment:
      - NODE_ENV=development
    command: npm run dev

  db:
    ports:
      - "5432:5432"
```

### Dockerfile.frontend (Multi-stage)
```dockerfile
# ===================
# Stage 1: Development
# ===================
FROM node:20-alpine AS development

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Port Vite dev server
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]

# ===================
# Stage 2: Build
# ===================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build de production
RUN npm run build

# ===================
# Stage 3: Production
# ===================
FROM nginx:alpine AS production

# Copier la config Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html

# Port Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Dockerfile.backend (Multi-stage)
```dockerfile
# ===================
# Stage 1: Development
# ===================
FROM node:20-alpine AS development

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier Prisma schema
COPY prisma ./prisma/

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]

# ===================
# Stage 2: Build
# ===================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ===================
# Stage 3: Production
# ===================
FROM node:20-alpine AS production

WORKDIR /app

# Installer uniquement les deps de production
COPY package*.json ./
RUN npm ci --only=production

# Copier Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copier le build
COPY --from=builder /app/dist ./dist

# Créer le dossier uploads
RUN mkdir -p /app/uploads

# User non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to backend (optionnel, si même domaine)
    # location /api {
    #     proxy_pass http://backend:3001;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    # }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### .env.example
```env
# Base de données
POSTGRES_USER=esat
POSTGRES_PASSWORD=esat_secure_password_change_me
POSTGRES_DB=esat_livret

# Backend
NODE_ENV=development
JWT_SECRET=change-this-to-a-secure-random-string-min-32-chars
JWT_EXPIRES_IN=24h
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001/api

# Uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=/app/uploads
```

### .dockerignore (pour frontend et backend)
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
!.env.example
dist
build
coverage
.nyc_output
*.log
.DS_Store
Thumbs.db
```

## Commandes utiles

### Démarrage
```bash
# Copier les variables d'environnement
cp .env.example .env

# Premier démarrage (build + up)
docker compose up -d --build

# Initialiser la BDD
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed

# Vérifier les logs
docker compose logs -f
```

### Développement
```bash
# Démarrer en mode dev (avec hot reload)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Voir les logs d'un service
docker compose logs -f backend
docker compose logs -f frontend

# Accéder au shell d'un container
docker compose exec backend sh
docker compose exec frontend sh
```

### Base de données
```bash
# Ouvrir Prisma Studio (interface graphique)
docker compose exec backend npx prisma studio

# Créer une migration
docker compose exec backend npx prisma migrate dev --name nom_migration

# Appliquer les migrations
docker compose exec backend npx prisma migrate deploy

# Reset complet (attention: perte de données)
docker compose exec backend npx prisma migrate reset

# Voir l'état des migrations
docker compose exec backend npx prisma migrate status
```

### Maintenance
```bash
# Reconstruire après modification Dockerfile
docker compose build --no-cache
docker compose up -d

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (reset complet)
docker compose down -v

# Nettoyer les images non utilisées
docker image prune -a

# Voir l'utilisation disque Docker
docker system df
```

### Debug
```bash
# Vérifier que les containers tournent
docker compose ps

# Inspecter un container
docker compose exec backend printenv
docker compose exec backend ls -la /app/uploads

# Tester la connexion BDD depuis le backend
docker compose exec backend npx prisma db pull

# Vérifier les ports utilisés
docker compose port backend 3001
```

## Structure finale
```
project/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── nginx.conf
├── backend/
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── .dockerignore
│   └── ...
├── .env.example
├── .env              # (gitignore)
└── .gitignore
```

## Checklist avant déploiement
- [ ] Variables d'environnement sécurisées (JWT_SECRET, passwords)
- [ ] .env dans .gitignore
- [ ] Healthchecks configurés
- [ ] Volumes persistants pour données
- [ ] User non-root dans containers
- [ ] Images de production (pas de devDependencies)
- [ ] Nginx avec headers de sécurité
- [ ] Logs accessibles
- [ ] Backups BDD configurés
