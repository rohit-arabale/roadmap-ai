import type { QuizQuestion, SkillScore } from '@/types';
import { api } from '@/lib/api';

export async function generateQuizQuestions(topic: string, difficulty: string): Promise<QuizQuestion[]> {
  const qs = new URLSearchParams({ topic, difficulty }).toString();
  return api.get<QuizQuestion[]>(`/api/quiz/questions?${qs}`);
}

// keep compat: still export generateMockQuestions signature but now async via api
export async function generateMockQuestions(topic: string, difficulty: string): Promise<QuizQuestion[]> {
  return generateQuizQuestions(topic, difficulty);
}

export async function loadSkillScores(): Promise<SkillScore[]> {
  return api.get<SkillScore[]>('/api/quiz/scores');
}

export async function saveSkillScore(score: SkillScore): Promise<SkillScore> {
  return api.post<SkillScore>('/api/quiz/scores', {
    topic: score.topic,
    score: score.score,
    totalQuestions: score.totalQuestions,
  });
}
