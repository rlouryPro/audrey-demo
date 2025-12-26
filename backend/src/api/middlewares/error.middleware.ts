import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Donnees invalides',
      errors: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Cette valeur existe deja' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ressource non trouvee' });
    }
  }

  // Generic error
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur'
      : error.message
  });
}
