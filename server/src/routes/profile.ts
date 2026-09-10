import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';
import { profileInputSchema } from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      res.json({ success: true, data: null });
      return;
    }
    const interests = Array.isArray(profile.interests) ? (profile.interests as string[]) : [];
    const knownSkills = Array.isArray(profile.knownSkills) ? (profile.knownSkills as string[]) : [];
    const completedCourses = Array.isArray(profile.completedCourses) ? (profile.completedCourses as string[]) : [];
    res.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        interests,
        skillLevel: profile.skillLevel,
        knownSkills,
        completedCourses,
        goal: profile.goal,
        weeklyHours: profile.weeklyHours,
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const parsed = profileInputSchema.parse(req.body);
    const now = new Date();

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        id: crypto.randomUUID(),
        name: parsed.name,
        interests: parsed.interests,
        skillLevel: parsed.skillLevel,
        knownSkills: parsed.knownSkills,
        completedCourses: parsed.completedCourses,
        goal: parsed.goal,
        weeklyHours: parsed.weeklyHours,
        updatedAt: now,
      },
      update: {
        name: parsed.name,
        interests: parsed.interests,
        skillLevel: parsed.skillLevel,
        knownSkills: parsed.knownSkills,
        completedCourses: parsed.completedCourses,
        goal: parsed.goal,
        weeklyHours: parsed.weeklyHours,
        updatedAt: now,
      },
    });

    res.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        interests: profile.interests as string[],
        skillLevel: profile.skillLevel,
        knownSkills: profile.knownSkills as string[],
        completedCourses: profile.completedCourses as string[],
        goal: profile.goal,
        weeklyHours: profile.weeklyHours,
        updatedAt: profile.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await prisma.$transaction([
      prisma.path.deleteMany({ where: { userId } }),
      prisma.feedback.deleteMany({ where: { userId } }),
      prisma.skillScore.deleteMany({ where: { userId } }),
      prisma.profile.deleteMany({ where: { userId } }),
    ]);
    res.json({ success: true, data: null, message: 'Profile and related data deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
