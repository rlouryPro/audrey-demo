import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth.service';
import { LoginSchema } from '../../schemas/auth.schema';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' as const : 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginSchema.parse(req.body);
    const result = await authService.login(data.username, data.password);

    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.json({ user: result.user });
  } catch (error) {
    if (error instanceof Error && error.message.includes('incorrect')) {
      return res.status(401).json({ message: error.message });
    }
    if (error instanceof Error && error.message.includes('desactive')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'strict' as const,
  });
  res.json({ message: 'Deconnecte' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
