import { Router, Request, Response, NextFunction } from 'express';
import { userSkillsService } from '../../services/userSkills.service';
import { z } from 'zod';

const router = Router();

const AddSkillSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'PENDING_VALIDATION']),
});

const UpdateSkillSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'PENDING_VALIDATION']),
});

// GET /api/my-skills
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const summary = await userSkillsService.getUserSkillsSummary(userId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// POST /api/my-skills/:skillId
router.post('/:skillId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { skillId } = req.params;
    const { status } = AddSkillSchema.parse(req.body);

    const userSkill = await userSkillsService.addSkillToUser(userId, skillId, status);
    res.status(201).json(userSkill);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('deja ajoutee')) {
        return res.status(409).json({ message: error.message });
      }
      if (error.message.includes('non trouvee')) {
        return res.status(404).json({ message: error.message });
      }
    }
    next(error);
  }
});

// PATCH /api/my-skills/:skillId
router.patch('/:skillId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { skillId } = req.params;
    const { status } = UpdateSkillSchema.parse(req.body);

    const userSkill = await userSkillsService.updateUserSkillStatus(userId, skillId, status);
    res.json(userSkill);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('non trouvee')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Impossible')) {
        return res.status(400).json({ message: error.message });
      }
    }
    next(error);
  }
});

// DELETE /api/my-skills/:skillId
router.delete('/:skillId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { skillId } = req.params;

    await userSkillsService.removeSkillFromUser(userId, skillId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('non trouvee')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Impossible')) {
        return res.status(400).json({ message: error.message });
      }
    }
    next(error);
  }
});

export default router;
