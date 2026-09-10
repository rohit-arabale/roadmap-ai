import type { LearningPath, RoadmapNode } from '@/types';
import { api } from '@/lib/api';

export async function loadPath(): Promise<LearningPath | null> {
  return api.get<LearningPath | null>('/api/paths');
}

export async function generatePath(): Promise<LearningPath> {
  return api.post<LearningPath>('/api/paths/generate');
}

export async function updateNodeStatus(
  pathId: string,
  nodeId: string,
  status: RoadmapNode['status'],
): Promise<LearningPath> {
  return api.patch<LearningPath>(`/api/paths/${pathId}/nodes/${nodeId}`, { status });
}
