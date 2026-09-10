import { Router } from 'express';
import { prisma } from '../db.js';
import { getUserId } from '../middleware/userId.js';
import { chatInputSchema } from '../utils/validation.js';
import { config } from '../config.js';

const router = Router();

// Simple in-memory rate limiter: 20 requests per minute per user
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const buckets = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}, RATE_LIMIT_WINDOW_MS).unref();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = buckets.get(userId);
  if (!entry || now > entry.resetAt) {
    buckets.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function buildContextSection(profile: unknown, path: unknown): string {
  if (!profile && !path) return 'The learner has no profile or learning path saved yet. Help them articulate their goals first.';
  let section = '';
  if (profile) section += `Learner profile:\n${JSON.stringify(profile, null, 2)}\n`;
  if (path) section += `\nCurrent learning path:\n${JSON.stringify(path, null, 2)}\n`;
  if (section.length > 8000) section = section.slice(0, 8000) + '\n...[truncated]';
  return section;
}

function truncateMessage(msg: string, max = 4000): string {
  return msg.length > max ? msg.slice(0, max) : msg;
}

router.post('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!checkRateLimit(userId)) {
      res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again in a minute.' });
      return;
    }

    const { message } = chatInputSchema.parse(req.body);
    const safeMessage = truncateMessage(message);

    if (!config.geminiApiKey) {
      res.status(503).json({
        success: false,
        error: 'AI not configured. Set GEMINI_API_KEY in server/.env (Gemini 3.1 Flash Lite). Your friend can add it later; chat will then work without code changes.',
      });
      return;
    }

    const [profileRow, pathRow] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.path.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const profile = profileRow
      ? {
          id: profileRow.id,
          name: profileRow.name,
          interests: profileRow.interests,
          skillLevel: profileRow.skillLevel,
          knownSkills: profileRow.knownSkills,
          completedCourses: profileRow.completedCourses,
          goal: profileRow.goal,
          weeklyHours: profileRow.weeklyHours,
          updatedAt: profileRow.updatedAt.toISOString(),
        }
      : null;

    const path = pathRow
      ? {
          id: pathRow.id,
          goal: pathRow.goal,
          profileId: pathRow.profileId,
          nodes: pathRow.nodes,
          milestones: pathRow.milestones,
          estimatedWeeks: pathRow.estimatedWeeks,
          createdAt: pathRow.createdAt.toISOString(),
        }
      : null;

    const systemPrompt = [
      'You are Roadmap.ai, a personalized learning path assistant.',
      '',
      buildContextSection(profile, path),
      '',
      'Your job:',
      '- Help learners articulate their learning and career goals through conversation.',
      '- Explain why each recommendation fits, referencing specifics from the learner profile and learning path above (their skills, level, goal, weekly hours, completed courses).',
      '- Answer learning questions concisely.',
      '',
      'Rules:',
      '- Ground every answer in the learner context above when it exists.',
      '- Use markdown formatting for structure.',
      '- Keep responses short and actionable.',
    ].join('\n');

    const url = `${config.geminiBaseUrl}/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nLearner message: ${safeMessage}` }] }],
        }),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeout);
      if ((e as Error).name === 'AbortError') {
        res.status(504).json({ success: false, error: 'Gemini request timed out after 15s' });
        return;
      }
      throw e;
    }
    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      const safeBody = body.length > 500 ? body.slice(0, 500) : body;
      res.status(502).json({ success: false, error: `Gemini API failed: ${response.status} ${safeBody}` });
      return;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ success: false, error: `Gemini returned no text` });
      return;
    }

    res.json({ success: true, data: { reply: text } });
  } catch (err) {
    next(err);
  }
});

export default router;
