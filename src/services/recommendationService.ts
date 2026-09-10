import type { Recommendation } from '@/types';
import { api } from '@/lib/api';

export async function recommend(): Promise<Recommendation[]> {
  return api.get<Recommendation[]>('/api/recommendations');
}
