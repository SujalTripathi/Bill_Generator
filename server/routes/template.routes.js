import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createTemplate,
  getTemplates,
  applyTemplate,
  deleteTemplate,
} from '../controllers/template.controller.js';

const router = Router();

router.use(protect);

router.post('/', createTemplate);
router.get('/', getTemplates);
router.post('/:id/apply', applyTemplate);
router.delete('/:id', deleteTemplate);

export default router;
