import { Router, Request, Response, NextFunction } from 'express';
import { usersService } from '../../services/users.service';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { z } from 'zod';

const router = Router();

const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(['USER', 'ADMIN']),
});

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

// GET /api/users - List users (admin)
router.get('/', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.query.role as 'USER' | 'ADMIN' | undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const users = await usersService.findAll({ role, isActive });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create user (admin)
router.post('/', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateUserSchema.parse(req.body);
    const user = await usersService.create(data);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:userId
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Non-admins can only see their own profile
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Acces non autorise' });
    }

    const user = await usersService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:userId
router.patch('/:userId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const data = UpdateUserSchema.parse(req.body);
    const user = await usersService.update(userId, data);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:userId/portfolio
router.get('/:userId/portfolio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Non-admins can only see their own portfolio
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Acces non autorise' });
    }

    const portfolio = await usersService.getPortfolio(userId);
    if (!portfolio) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

export default router;
