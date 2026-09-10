import { api } from '@/lib/api';

export type FeedbackRating = 'up' | 'down';

export async function loadFeedback(): Promise<Record<string, FeedbackRating>> {
  return api.get<Record<string, FeedbackRating>>('/api/feedback');
}

export async function saveFeedback(itemId: string, rating: FeedbackRating | null): Promise<void> {
  await api.put(`/api/feedback/${encodeURIComponent(itemId)}`, { rating });
}
