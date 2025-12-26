import { Router, Request, Response, NextFunction } from 'express';
import { skillsService } from '../../services/skills.service';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { z } from 'zod';

const router = Router();

// Schemas
const CreateDomainSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().optional(),
});

const UpdateDomainSchema = CreateDomainSchema.partial();

const CreateCategorySchema = z.object({
  domainId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().optional(),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().optional(),
});

const CreateSkillSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  iconName: z.string().min(1).max(50),
  displayOrder: z.number().int().optional(),
});

const UpdateSkillSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  iconName: z.string().min(1).max(50).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/domains - Get skills hierarchy
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const hierarchy = await skillsService.getHierarchy(isAdmin);
    res.json(hierarchy);
  } catch (error) {
    next(error);
  }
});

// POST /api/domains - Create domain (admin)
router.post('/', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateDomainSchema.parse(req.body);
    const domain = await skillsService.createDomain(data);
    res.status(201).json(domain);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/domains/:domainId
router.patch('/:domainId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domainId } = req.params;
    const data = UpdateDomainSchema.parse(req.body);
    const domain = await skillsService.updateDomain(domainId, data);
    res.json(domain);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/domains/:domainId
router.delete('/:domainId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domainId } = req.params;
    await skillsService.deleteDomain(domainId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/domains/categories - Create category (admin)
router.post('/categories', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateCategorySchema.parse(req.body);
    const category = await skillsService.createCategory(data);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/domains/categories/:categoryId
router.patch('/categories/:categoryId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    const data = UpdateCategorySchema.parse(req.body);
    const category = await skillsService.updateCategory(categoryId, data);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/domains/categories/:categoryId
router.delete('/categories/:categoryId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId } = req.params;
    await skillsService.deleteCategory(categoryId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /api/domains/skills - Create skill (admin)
router.post('/skills', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateSkillSchema.parse(req.body);
    const skill = await skillsService.createSkill(data);
    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/domains/skills/:skillId
router.patch('/skills/:skillId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillId } = req.params;
    const data = UpdateSkillSchema.parse(req.body);
    const skill = await skillsService.updateSkill(skillId, data);
    res.json(skill);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/domains/skills/:skillId
router.delete('/skills/:skillId', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillId } = req.params;
    await skillsService.deleteSkill(skillId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
