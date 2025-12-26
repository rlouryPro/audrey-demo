import { Router, Request, Response, NextFunction } from 'express';
import { userSkillsService } from '../../services/userSkills.service';
import { z } from 'zod';

const router = Router();

const RejectSchema = z.object({
  reason: z.string().min(1, 'Motif requis').max(500),
});

// GET /api/validations - Get pending validations (admin)
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const validations = await userSkillsService.getPendingValidations();
    res.json(validations);
  } catch (error) {
    next(error);
  }
});

// POST /api/validations/:userSkillId/approve
router.post('/:userSkillId/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { userSkillId } = req.params;

    const result = await userSkillsService.approveSkill(userSkillId, adminId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/validations/:userSkillId/reject
router.post('/:userSkillId/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { userSkillId } = req.params;
    const { reason } = RejectSchema.parse(req.body);

    const result = await userSkillsService.rejectSkill(userSkillId, adminId, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
