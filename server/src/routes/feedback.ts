import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';

const MAX_ITEM_ID_LEN = 100;

function sanitizeId(id: string): string {
  return id.replace(/[<>]/g, '').trim().slice(0, MAX_ITEM_ID_LEN);
}

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const rows = await prisma.feedback.findMany({ where: { userId } });
    const map: Record<string, 'up' | 'down'> = {};
    for (const r of rows) map[r.itemId] = r.rating as 'up' | 'down';
    res.json({ success: true, data: map });
  } catch (err) {
    next(err);
  }
});

router.put('/:itemId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const rawId = req.params.itemId ?? '';
    const itemId = sanitizeId(rawId);
    if (!itemId || itemId.length < 1) {
      res.status(400).json({ success: false, error: 'Invalid itemId' });
      return;
    }
    const { rating } = req.body as { rating?: 'up' | 'down' | null };

    if (rating === null || rating === undefined) {
      await prisma.feedback.deleteMany({ where: { userId, itemId } });
      res.json({ success: true, data: null, message: 'Feedback cleared' });
      return;
    }

    if (rating !== 'up' && rating !== 'down') {
      res.status(400).json({ success: false, error: 'rating must be "up", "down" or null' });
      return;
    }

    await prisma.feedback.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId, rating },
      update: { rating },
    });

    res.json({ success: true, data: { itemId, rating } });
  } catch (err) {
    next(err);
  }
});

export default router;
