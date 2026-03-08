import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Customer name is required')],
  validate,
  createCustomer
);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
