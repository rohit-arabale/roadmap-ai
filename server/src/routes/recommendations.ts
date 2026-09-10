import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';
import { recommend } from '../services/recommendationService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const profileRow = await prisma.profile.findUnique({ where: { userId } });
    if (!profileRow) {
      res.status(404).json({ success: false, error: 'Profile not found. Create profile first.' });
      return;
    }

    const profile = {
      id: profileRow.id,
      name: profileRow.name,
      interests: profileRow.interests as string[],
      skillLevel: profileRow.skillLevel as 'beginner' | 'intermediate' | 'advanced',
      knownSkills: profileRow.knownSkills as string[],
      completedCourses: profileRow.completedCourses as string[],
      goal: profileRow.goal,
      weeklyHours: profileRow.weeklyHours,
      updatedAt: profileRow.updatedAt.toISOString(),
    };

    const feedbackRows = await prisma.feedback.findMany({ where: { userId } });
    const feedback: Record<string, 'up' | 'down'> = {};
    for (const row of feedbackRows) feedback[row.itemId] = row.rating as 'up' | 'down';

    const recommendations = recommend(profile, feedback);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
});

export default router;
