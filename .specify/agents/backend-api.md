# Agent: Backend API Node.js

## Rôle
Expert développement backend Node.js/Express avec Prisma ORM pour API REST sécurisée.

## Expertise
- Node.js 20 LTS avec TypeScript 5.x
- Express.js 4.x
- Prisma ORM avec PostgreSQL
- JWT authentification
- Validation avec Zod
- Tests avec Jest et Supertest

## Contexte projet
API REST pour application ESAT avec :
- Authentification JWT (cookies HttpOnly)
- 2 rôles : USER et ADMIN
- CRUD événements (frise chronologique)
- Gestion hiérarchique compétences (domaines > catégories > compétences)
- Workflow validation compétences
- Génération PDF
- Upload images avec redimensionnement

## Guidelines de développement

### Structure du projet
```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── skills.routes.ts
│   │   │   ├── validations.routes.ts
│   │   │   └── documents.routes.ts
│   │   ├── controllers/
│   │   │   └── [même structure]
│   │   └── middlewares/
│   │       ├── auth.middleware.ts
│   │       ├── admin.middleware.ts
│   │       ├── validate.middleware.ts
│   │       └── error.middleware.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── event.service.ts
│   │   ├── skill.service.ts
│   │   ├── validation.service.ts
│   │   ├── document.service.ts
│   │   └── image.service.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── avatar.ts
│   ├── schemas/           # Zod schemas
│   ├── types/             # TypeScript types
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── tests/
```

### Pattern Controller
```typescript
// controllers/events.controller.ts
import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';
import { CreateEventSchema } from '../schemas/event.schema';

export const eventsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // Set by auth middleware
      const events = await eventService.findByUser(userId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = CreateEventSchema.parse(req.body);
      const photoFile = req.file; // Multer

      const event = await eventService.create(userId, data, photoFile);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;

      // Vérifier propriété
      const existing = await eventService.findById(eventId);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }

      const data = UpdateEventSchema.parse(req.body);
      const event = await eventService.update(eventId, data, req.file);
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { eventId } = req.params;

      const existing = await eventService.findById(eventId);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Événement non trouvé' });
      }

      await eventService.delete(eventId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
```

### Pattern Service
```typescript
// services/event.service.ts
import { prisma } from '../lib/prisma';
import { imageService } from './image.service';

export const eventService = {
  async findByUser(userId: string) {
    return prisma.event.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  },

  async findById(id: string) {
    return prisma.event.findUnique({ where: { id } });
  },

  async create(
    userId: string,
    data: { date: Date; title: string },
    photoFile?: Express.Multer.File
  ) {
    let photoUrl: string | undefined;

    if (photoFile) {
      photoUrl = await imageService.saveAndResize(photoFile, {
        maxWidth: 800,
        thumbnail: true
      });
    }

    return prisma.event.create({
      data: {
        userId,
        date: data.date,
        title: data.title,
        photoUrl
      }
    });
  },

  async update(id: string, data: Partial<{ date: Date; title: string }>, photoFile?: Express.Multer.File) {
    const updateData: any = { ...data };

    if (photoFile) {
      // Supprimer ancienne photo
      const existing = await this.findById(id);
      if (existing?.photoUrl) {
        await imageService.delete(existing.photoUrl);
      }
      updateData.photoUrl = await imageService.saveAndResize(photoFile);
    }

    return prisma.event.update({
      where: { id },
      data: updateData
    });
  },

  async delete(id: string) {
    const event = await this.findById(id);
    if (event?.photoUrl) {
      await imageService.delete(event.photoUrl);
    }
    return prisma.event.delete({ where: { id } });
  }
};
```

### Middleware d'authentification
```typescript
// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: 'USER' | 'ADMIN' };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Compte invalide' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  next();
}
```

### Validation avec Zod
```typescript
// schemas/event.schema.ts
import { z } from 'zod';

export const CreateEventSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  title: z.string().min(1).max(100)
});

export const UpdateEventSchema = CreateEventSchema.partial();

// Dans le middleware
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Données invalides',
          errors: error.errors
        });
      }
      next(error);
    }
  };
}
```

### Gestion des erreurs
```typescript
// middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Cette valeur existe déjà' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ressource non trouvée' });
    }
  }

  // Erreur générique
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur'
      : error.message
  });
}
```

### Configuration Express
```typescript
// index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './api/middlewares/error.middleware';

const app = express();

// Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing
app.use(express.json());
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/events', authMiddleware, eventsRoutes);
app.use('/api/domains', authMiddleware, domainsRoutes);
app.use('/api/my-skills', authMiddleware, mySkillsRoutes);
app.use('/api/validations', authMiddleware, adminMiddleware, validationsRoutes);
app.use('/api/documents', authMiddleware, documentsRoutes);

// Error handler (toujours en dernier)
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
```

## Tests
```typescript
// tests/events.test.ts
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

describe('Events API', () => {
  let authCookie: string;
  let userId: string;

  beforeAll(async () => {
    // Setup test user and get auth cookie
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'test123' });
    authCookie = res.headers['set-cookie'][0];
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/events', () => {
    it('returns user events', async () => {
      const res = await request(app)
        .get('/api/events')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('requires authentication', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/events', () => {
    it('creates an event', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'Test event' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test event');
    });

    it('validates title length', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Cookie', authCookie)
        .send({ date: '2025-01-15', title: 'a'.repeat(101) });

      expect(res.status).toBe(400);
    });
  });
});
```

## Checklist avant PR
- [ ] Validation Zod sur toutes les entrées
- [ ] Middleware auth sur routes protégées
- [ ] Middleware admin sur routes admin
- [ ] Gestion erreurs Prisma
- [ ] Tests unitaires services
- [ ] Tests intégration routes
- [ ] Pas de données sensibles dans les logs
- [ ] Vérification propriété des ressources
