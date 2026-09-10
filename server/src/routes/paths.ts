import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';
import { recommend } from '../services/recommendationService.js';
import { generatePath, updateNodeStatusInPath } from '../services/pathService.js';
import { nodeStatusSchema } from '../utils/validation.js';
import type { LearningPath } from '../types.js';

const router = Router();

function rowToPath(row: { id: string; goal: string; profileId: string; nodes: unknown; milestones: unknown; estimatedWeeks: number; createdAt: Date }): LearningPath {
  return {
    id: row.id,
    goal: row.goal,
    profileId: row.profileId,
    nodes: row.nodes as LearningPath['nodes'],
    milestones: row.milestones as LearningPath['milestones'],
    estimatedWeeks: row.estimatedWeeks,
    createdAt: (row.createdAt as Date).toISOString(),
  };
}

router.get('/staleness', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const pathRow = await prisma.path.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (!pathRow) {
      res.json({ success: true, data: { stale: false, reason: null } });
      return;
    }

    const path = rowToPath(pathRow);
    const profileRow = await prisma.profile.findUnique({ where: { userId } });
    const scores = await prisma.skillScore.findMany({ where: { userId } });

    const candidates: Array<{ at: string; label: string }> = [];

    if (profileRow && profileRow.id === path.profileId) {
      candidates.push({ at: profileRow.updatedAt.toISOString(), label: 'your profile changed' });
    }

    if (scores.length > 0) {
      const latest = scores.reduce((a, b) => (a.assessedAt > b.assessedAt ? a : b));
      candidates.push({ at: latest.assessedAt.toISOString(), label: 'you completed new skill assessments' });
    }

    const pathTime = new Date(path.createdAt).getTime();
    const newer = candidates.filter((c) => new Date(c.at).getTime() > pathTime);
    if (newer.length === 0) {
      res.json({ success: true, data: { stale: false, reason: null } });
      return;
    }

    res.json({
      success: true,
      data: {
        stale: true,
        reason: `Your path may be out of date because ${newer.map((c) => c.label).join(' and ')}. Regenerate it to adapt your recommendations.`,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const row = await prisma.path.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (!row) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({ success: true, data: rowToPath(row) });
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req, res, next) => {
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
    for (const r of feedbackRows) feedback[r.itemId] = r.rating as 'up' | 'down';

    const recommendations = recommend(profile, feedback);
    if (recommendations.length === 0) {
      res.status(422).json({ success: false, error: 'No recommendations available for current profile. Try broadening interests or adding a different goal.' });
      return;
    }
    const path = generatePath(profile, recommendations);

    const created = await prisma.$transaction(async (tx) => {
      const c = await tx.path.create({
        data: {
          id: path.id,
          userId,
          goal: path.goal,
          profileId: path.profileId,
          nodes: path.nodes as unknown as object,
          milestones: path.milestones as unknown as object,
          estimatedWeeks: path.estimatedWeeks,
          createdAt: new Date(path.createdAt),
        },
      });
      await tx.path.deleteMany({ where: { userId, id: { not: path.id } } });
      return c;
    });

    res.status(201).json({ success: true, data: rowToPath(created) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:pathId/nodes/:nodeId', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { pathId, nodeId } = req.params;
    const status = nodeStatusSchema.parse(req.body.status ?? req.body);

    const row = await prisma.path.findFirst({ where: { id: pathId, userId } });
    if (!row) {
      res.status(404).json({ success: false, error: `Path "${pathId}" not found` });
      return;
    }

    let path: LearningPath;
    try {
      path = rowToPath(row) as LearningPath;
    } catch {
      res.status(500).json({ success: false, error: 'Stored path is corrupted' });
      return;
    }

    let updated: LearningPath;
    try {
      updated = updateNodeStatusInPath(path, nodeId, status as LearningPath['nodes'][number]['status']);
    } catch (e) {
      const err = e as Error;
      (err as Error & { status: number }).status = 404;
      throw err;
    }

    const saved = await prisma.path.update({
      where: { id: pathId },
      data: {
        nodes: updated.nodes as unknown as object,
        milestones: updated.milestones as unknown as object,
      },
    });

    res.json({ success: true, data: rowToPath(saved) });
  } catch (err) {
    next(err);
  }
});

export default router;
