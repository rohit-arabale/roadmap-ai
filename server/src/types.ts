export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearnerProfile {
  id: string;
  name: string;
  interests: string[];
  skillLevel: SkillLevel;
  knownSkills: string[];
  completedCourses: string[];
  goal: string;
  weeklyHours: number;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'project' | 'resource';
  url?: string;
  difficulty: SkillLevel;
  skills: string[];
  relevanceScore: number;
  reasons: string[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'project' | 'milestone';
  status: 'completed' | 'in-progress' | 'pending';
  prerequisites?: string[];
  estimatedTime?: number;
  resources?: Resource[];
  reasons?: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'book' | 'tool';
  url: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  nodeIds: string[];
  status: RoadmapNode['status'];
}

export interface LearningPath {
  id: string;
  goal: string;
  profileId: string;
  nodes: RoadmapNode[];
  milestones: Milestone[];
  estimatedWeeks: number;
  createdAt: string;
}

export interface SkillScore {
  topic: string;
  score: number;
  totalQuestions: number;
  assessedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  code?: string | null;
}

export type FeedbackRating = 'up' | 'down';

export type ApiResponse<T> = { success: true; data: T; message?: string } | { success: false; error: string; message?: string };
