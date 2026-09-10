import { z } from 'zod';

function sanitize(str: string): string {
  return str.replace(/[<>]/g, '').trim();
}

const sanitizedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform(sanitize)
    .refine((s) => s.length >= min, { message: `String must contain at least ${min} character(s)` });

export const skillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const profileInputSchema = z.object({
  name: sanitizedString(1, 100),
  interests: z.array(z.string().trim().min(1).max(50).transform(sanitize)).min(1).max(20),
  skillLevel: skillLevelSchema,
  knownSkills: z.array(z.string().trim().min(1).max(50).transform(sanitize)).max(50).default([]),
  completedCourses: z.array(z.string().trim().min(1).max(50).transform(sanitize)).max(50).default([]),
  goal: sanitizedString(1, 500),
  weeklyHours: z.number().int().min(1).max(80),
});

export const feedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
});

export const nodeStatusSchema = z.enum(['pending', 'in-progress', 'completed']);

export const skillScoreInputSchema = z
  .object({
    topic: z.string().trim().min(1).max(50).transform(sanitize),
    score: z.number().int().min(0),
    totalQuestions: z.number().int().min(1),
  })
  .refine((d) => d.score <= d.totalQuestions, {
    message: 'score must be <= totalQuestions',
    path: ['score'],
  });

export const chatInputSchema = z.object({
  message: z.string().trim().min(1).max(4000).transform(sanitize),
});
