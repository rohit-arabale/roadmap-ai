import { api } from '@/lib/api';

export interface PathStaleness {
  stale: boolean;
  reason: string | null;
}

export async function getPathStaleness(): Promise<PathStaleness> {
  return api.get<PathStaleness>('/api/paths/staleness');
}
