import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';
import { getQuestions } from '../services/quizService.js';
import { skillScoreInputSchema } from '../utils/validation.js';
import { z } from 'zod';

function sanitize(str: string): string {
  return str.replace(/[<>]/g, '').trim().slice(0, 50);
}

const router = Router();

router.get('/questions', (req, res, next) => {
  try {
    const schema = z.object({
      topic: z.string().min(1).max(50).transform(sanitize),
      difficulty: z.string().min(1).max(20).transform(sanitize),
    });
    const { topic, difficulty } = schema.parse(req.query);
    const questions = getQuestions(topic, difficulty);
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
});

router.get('/scores', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const rows = await prisma.skillScore.findMany({ where: { userId }, orderBy: { assessedAt: 'desc' } });
    const data = rows.map((r) => ({
      topic: r.topic,
      score: r.score,
      totalQuestions: r.totalQuestions,
      assessedAt: r.assessedAt.toISOString(),
    }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/scores', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const parsed = skillScoreInputSchema.parse(req.body);
    const now = new Date();

    const saved = await prisma.skillScore.upsert({
      where: { userId_topic: { userId, topic: parsed.topic } },
      create: {
        userId,
        topic: parsed.topic,
        score: parsed.score,
        totalQuestions: parsed.totalQuestions,
        assessedAt: now,
      },
      update: {
        score: parsed.score,
        totalQuestions: parsed.totalQuestions,
        assessedAt: now,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        topic: saved.topic,
        score: saved.score,
        totalQuestions: saved.totalQuestions,
        assessedAt: saved.assessedAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
