import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { eventsService } from '../../services/events.service';
import { CreateEventSchema, UpdateEventSchema } from '../../schemas/event.schema';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporte. Utilisez JPEG, PNG ou WebP.'));
    }
  },
});

// GET /api/events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const events = await eventsService.findByUser(userId);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// POST /api/events
router.post('/', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = CreateEventSchema.parse(req.body);
    const event = await eventsService.create(userId, data, req.file);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:eventId
router.get('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const event = await eventsService.findById(eventId);
    if (!event || event.userId !== userId) {
      return res.status(404).json({ message: 'Evenement non trouve' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:eventId
router.patch('/:eventId', upload.single('photo'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const existing = await eventsService.findById(eventId);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Evenement non trouve' });
    }

    const data = UpdateEventSchema.parse(req.body);
    const event = await eventsService.update(eventId, data, req.file);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:eventId
router.delete('/:eventId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const existing = await eventsService.findById(eventId);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Evenement non trouve' });
    }

    await eventsService.delete(eventId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
