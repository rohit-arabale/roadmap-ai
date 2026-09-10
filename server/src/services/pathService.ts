import type { LearnerProfile, LearningPath, Milestone, Recommendation, RoadmapNode } from '../types.js';

const DIFFICULTY_RANK: Record<Recommendation['difficulty'], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

const DIFFICULTY_HOURS: Record<Recommendation['difficulty'], number> = {
  beginner: 6,
  intermediate: 10,
  advanced: 14,
};

const MILESTONE_META: Record<Recommendation['difficulty'], { title: string; description: string }> = {
  beginner: { title: 'Foundations', description: 'Core fundamentals to get moving.' },
  intermediate: { title: 'Building Depth', description: 'Deepen skills and connect concepts.' },
  advanced: { title: 'Advanced Work', description: 'Stretch work that ties everything together.' },
};

function toNodeType(type: Recommendation['type']): RoadmapNode['type'] {
  if (type === 'project') return 'project';
  return 'skill';
}

function toResources(rec: Recommendation): RoadmapNode['resources'] {
  if (!rec.url) return undefined;
  return [
    {
      id: `${rec.id}-resource`,
      title: rec.title,
      type: rec.type === 'course' ? 'course' : rec.type === 'project' ? 'tool' : 'article',
      url: rec.url,
      difficulty: rec.difficulty,
    },
  ];
}

export function generatePath(profile: LearnerProfile, recommendations: Recommendation[]): LearningPath {
  const ordered = [...recommendations].sort(
    (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || b.relevanceScore - a.relevanceScore,
  );

  const nodes: RoadmapNode[] = [];
  const lastNodeBySkill = new Map<string, string>();

  ordered.forEach((rec) => {
    const prereqs = new Set<string>();
    for (const skill of rec.skills) {
      const dep = lastNodeBySkill.get(skill);
      if (dep !== undefined) prereqs.add(dep);
    }
    if (prereqs.size === 0 && nodes.length > 0) prereqs.add(nodes[nodes.length - 1].id);

    const node: RoadmapNode = {
      id: rec.id,
      title: rec.title,
      description: rec.description,
      type: toNodeType(rec.type),
      status: 'pending',
      prerequisites: [...prereqs],
      estimatedTime: DIFFICULTY_HOURS[rec.difficulty],
      resources: toResources(rec),
      reasons: rec.reasons,
    };
    nodes.push(node);

    for (const skill of rec.skills) {
      lastNodeBySkill.set(skill, node.id);
    }
  });

  const milestones: Milestone[] = [];
  let current: Milestone | null = null;
  let currentDifficulty: Recommendation['difficulty'] | null = null;

  ordered.forEach((rec) => {
    if (current === null || currentDifficulty !== rec.difficulty) {
      currentDifficulty = rec.difficulty;
      current = {
        id: `milestone-${milestones.length}`,
        title: MILESTONE_META[rec.difficulty].title,
        description: MILESTONE_META[rec.difficulty].description,
        nodeIds: [],
        status: 'pending',
      };
      milestones.push(current);
    }
    current.nodeIds.push(rec.id);
  });

  const totalHours = nodes.reduce((sum, node) => sum + (node.estimatedTime ?? 0), 0);
  const weeklyHours = Math.max(profile.weeklyHours, 1);
  const estimatedWeeks = totalHours === 0 ? 0 : Math.max(1, Math.ceil(totalHours / weeklyHours));

  return {
    id: crypto.randomUUID(),
    goal: profile.goal,
    profileId: profile.id,
    nodes,
    milestones,
    estimatedWeeks,
    createdAt: new Date().toISOString(),
  };
}

export function updateNodeStatusInPath(path: LearningPath, nodeId: string, status: RoadmapNode['status']): LearningPath {
  const nodeIndex = path.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) throw new Error(`Node "${nodeId}" does not exist in path "${path.id}"`);

  const nextNodes = [...path.nodes];
  nextNodes[nodeIndex] = { ...nextNodes[nodeIndex], status };

  const nextMilestones = path.milestones.map((milestone) => {
    const statuses = milestone.nodeIds.map((id) => nextNodes.find((n) => n.id === id)?.status ?? 'pending');
    if (statuses.every((s) => s === 'completed')) return { ...milestone, status: 'completed' as const };
    if (statuses.some((s) => s !== 'pending')) return { ...milestone, status: 'in-progress' as const };
    return { ...milestone, status: 'pending' as const };
  });

  return { ...path, nodes: nextNodes, milestones: nextMilestones };
}
