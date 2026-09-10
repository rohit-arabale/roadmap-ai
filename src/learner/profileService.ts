import type { LearnerProfile } from '@/types';
import { api } from '@/lib/api';

export async function loadProfile(): Promise<LearnerProfile | null> {
  return api.get<LearnerProfile | null>('/api/profile');
}

export async function saveProfile(profile: Omit<LearnerProfile, 'id' | 'updatedAt'> & Partial<Pick<LearnerProfile, 'id'>>): Promise<LearnerProfile> {
  return api.put<LearnerProfile>('/api/profile', profile);
}

export async function clearProfile(): Promise<void> {
  await api.del('/api/profile');
}

// sync helpers for pending goal (still local)
export function loadPendingGoal(): string | null {
  const raw = localStorage.getItem('roadmap-ai-pending-goal');
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'string' && parsed.trim() !== '') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function savePendingGoal(goal: string): void {
  localStorage.setItem('roadmap-ai-pending-goal', JSON.stringify(goal.trim()));
}

export function clearPendingGoal(): void {
  localStorage.removeItem('roadmap-ai-pending-goal');
}
