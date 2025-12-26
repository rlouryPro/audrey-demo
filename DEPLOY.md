# Guide de Deploiement Gratuit

Ce guide explique comment deployer l'application gratuitement sur Internet.

## Architecture

- **Frontend**: Vercel (gratuit)
- **Backend**: Render.com (gratuit)
- **Base de donnees**: PostgreSQL sur Render (gratuit)

## Etape 1: Creer un depot GitHub

1. Allez sur https://github.com/new
2. Creez un nouveau depot (public ou prive)
3. Ne cochez pas "Initialize with README"

Dans le terminal, executez:
```bash
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/VOTRE_USERNAME/audrey-demo.git
git push -u origin master
```

## Etape 2: Deployer le Backend sur Render

1. Allez sur https://render.com et creez un compte (gratuit avec GitHub)

2. Cliquez sur "New" > "Blueprint"

3. Connectez votre depot GitHub

4. Render detectera automatiquement le fichier `render.yaml` et creera:
   - Une base de donnees PostgreSQL
   - Le service backend

5. Attendez que le deploiement soit termine (5-10 minutes)

6. Notez l'URL du backend (ex: `https://esat-backend.onrender.com`)

7. **Important**: Apres le premier deploiement, executez le seed:
   - Allez dans le dashboard Render > votre service backend
   - Onglet "Shell"
   - Executez: `npx prisma migrate deploy && npx prisma db seed`

## Etape 3: Deployer le Frontend sur Vercel

1. Allez sur https://vercel.com et connectez-vous avec GitHub

2. Cliquez sur "Add New Project"

3. Importez votre depot GitHub

4. Configurez le projet:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Ajoutez la variable d'environnement:
   - Cliquez sur "Environment Variables"
   - Ajoutez: `VITE_API_URL` = `https://esat-backend.onrender.com/api`
   (Remplacez par votre vraie URL Render)

6. Cliquez sur "Deploy"

7. Notez l'URL du frontend (ex: `https://audrey-demo.vercel.app`)

## Etape 4: Mettre a jour l'URL Frontend sur Render

1. Retournez sur Render.com

2. Allez dans votre service backend > "Environment"

3. Modifiez `FRONTEND_URL` avec l'URL Vercel de votre frontend

4. Cliquez sur "Save Changes" (le service va redemarrer)

## Verification

1. Ouvrez l'URL de votre frontend
2. Connectez-vous avec:
   - Admin: `admin` / `admin123`
   - Utilisateur: `marie` / `user123`

## Notes Importantes

### Limites du plan gratuit Render:
- Le service "dort" apres 15 minutes d'inactivite
- Premier acces peut prendre 30-60 secondes (cold start)
- 750 heures/mois de fonctionnement

### Limites du plan gratuit Vercel:
- 100 GB de bande passante/mois
- Deploiements illimites

### Pour garder le backend actif:
Vous pouvez utiliser un service comme UptimeRobot (gratuit) pour "pinguer"
votre backend toutes les 14 minutes:
1. Allez sur https://uptimerobot.com
2. Creez un moniteur HTTP pour `https://votre-backend.onrender.com/health`
3. Intervalle: 14 minutes

## URLs de Test

- Frontend: https://votre-app.vercel.app
- Backend Health: https://votre-backend.onrender.com/health

## Comptes de demonstration

| Utilisateur | Mot de passe | Role |
|-------------|--------------|------|
| admin       | admin123     | Admin |
| marie       | user123      | Utilisateur |
| pierre      | user123      | Utilisateur |
