import { Router } from 'express';
import { courseCatalog } from '../data/courseCatalog.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ success: true, data: courseCatalog });
});

export default router;
