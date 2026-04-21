import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getWaterToday, addWater } from './water.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/today', asyncHandler(getWaterToday));
router.post('/', asyncHandler(addWater));

export default router;
