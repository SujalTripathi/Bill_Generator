import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import {
  createProfile,
  getProfile,
  updateProfile,
  uploadLogo,
} from '../controllers/business.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect);

router.post('/', createProfile);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/logo', upload.single('logo'), uploadLogo);

export default router;
