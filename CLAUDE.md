# audrey-demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-25

## Active Technologies
- TypeScript 5.6, Node.js 22+ (002-ui-nav-collapsible)
- PostgreSQL 16 (via Prisma ORM) (002-ui-nav-collapsible)

- TypeScript 5.x (Frontend & Backend) (001-esat-skills-portfolio)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (Frontend & Backend): Follow standard conventions

## Recent Changes
- 002-ui-nav-collapsible: Added TypeScript 5.6, Node.js 22+

- 001-esat-skills-portfolio: Added TypeScript 5.x (Frontend & Backend)

<!-- MANUAL ADDITIONS START -->

## Projet: Livret Numérique ESAT

Application web accessible pour travailleurs ESAT avec frise chronologique, gestion de compétences avec avatar évolutif, et génération PDF. Full Docker.

## Stack Technique

- **Frontend**: React 18, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js 20, Express, Prisma ORM, JWT
- **Database**: PostgreSQL 16
- **Tests**: Jest, Playwright, Supertest, axe-core
- **Deploy**: Docker Compose (frontend, backend, db)

## Guidelines Frontend React

### Structure composant
```tsx
interface Props {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

const Button: React.FC<Props> = ({ label, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel || label}
    className="focus-visible:ring-2 focus-visible:ring-offset-2 px-4 py-2 rounded-lg"
  >
    {label}
  </button>
);
```

### Accessibilité obligatoire (WCAG 2.1 AA)
- Focus visible: `focus-visible:ring-2` sur tous éléments interactifs
- Labels: tous les champs ont un label visible ou aria-label
- Alt text: toutes les images ont un alt descriptif
- Pictogrammes + texte: toujours combiner icône + texte court (max 3 mots)
- Contraste: minimum 4.5:1 pour textes
- Navigation clavier: Tab, Enter, Escape fonctionnent partout

### Pattern accessible
```tsx
<button className="flex items-center gap-2 focus-visible:ring-2">
  <PlusIcon aria-hidden className="w-6 h-6" />
  <span>Ajouter</span>
</button>
```

## Guidelines Backend API

### Structure controller
```typescript
export const controller = {
  async action(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = Schema.parse(req.body);
      const result = await service.action(userId, data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
```

### Middleware auth
```typescript
// Routes protégées
router.use(authMiddleware);
// Routes admin
router.use(adminMiddleware);
```

### Validation Zod
```typescript
const CreateEventSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  title: z.string().min(1).max(100)
});
```

## Guidelines Database Prisma

### Entités principales
- User (id, username, passwordHash, firstName, lastName, role, avatarLevel, isActive)
- Event (id, userId, date, title, photoUrl)
- Domain > Category > Skill (hiérarchie)
- UserSkill (userId, skillId, status: IN_PROGRESS|PENDING_VALIDATION|ACQUIRED|REJECTED)

### Calcul niveau avatar
```typescript
function calculateAvatarLevel(acquiredCount: number): number {
  if (acquiredCount >= 16) return 5;
  if (acquiredCount >= 11) return 4;
  if (acquiredCount >= 6) return 3;
  if (acquiredCount >= 3) return 2;
  return 1;
}
```

## Guidelines Docker

### Commandes essentielles
```bash
docker compose up -d                    # Démarrer
docker compose logs -f backend          # Logs
docker compose exec backend sh          # Shell
docker compose exec backend npx prisma studio  # BDD GUI
docker compose exec backend npx prisma migrate dev  # Migration
```

### Services
- frontend: :3000 (Nginx + React)
- backend: :3001 (Express API)
- db: :5432 (PostgreSQL)

## Guidelines Tests

### Test accessibilité
```typescript
import { axe } from 'jest-axe';

test('Component is accessible', async () => {
  const { container } = render(<Component />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Test API
```typescript
const res = await request(app)
  .post('/api/events')
  .set('Cookie', authCookie)
  .send({ date: '2025-01-15', title: 'Test' });
expect(res.status).toBe(201);
```

## Checklist PR

- [ ] Focus visible sur éléments interactifs
- [ ] Labels sur tous les champs
- [ ] Alt text sur images
- [ ] Validation Zod sur entrées API
- [ ] Tests unitaires ajoutés
- [ ] Pas de `any` TypeScript
- [ ] axe-core sans violations

<!-- MANUAL ADDITIONS END -->
