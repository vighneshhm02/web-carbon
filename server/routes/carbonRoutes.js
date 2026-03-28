import { Router } from 'express';
import {
  scanURL,
  getHistory,
  getScanById
} from '../controllers/carbonController.js';

const router = Router();

router.post('/scan', scanURL);
router.get('/history', getHistory);
router.get('/scan/:id', getScanById);

export default router;