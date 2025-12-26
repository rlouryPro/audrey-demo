import { Router, Request, Response, NextFunction } from 'express';
import { documentService } from '../../services/document.service';

const router = Router();

// GET /api/documents/preview
router.get('/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const preview = await documentService.getPreview(userId);

    if (!preview) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.json(preview);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/generate
router.get('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const html = await documentService.generateHtml(userId);

    // For now, return HTML directly
    // In production, use Puppeteer to generate PDF
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="livret-parcours-${new Date().toISOString().slice(0, 10)}.html"`);
    res.send(html);
  } catch (error) {
    next(error);
  }
});

export default router;
