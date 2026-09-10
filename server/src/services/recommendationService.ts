import type { LearnerProfile, Recommendation, FeedbackRating } from '../types.js';
import { courseCatalog } from '../data/courseCatalog.js';

const MAX_RESULTS = 12;
const MAX_SCORE = 100;
const FEEDBACK_BOOST = 8;

const GOAL_STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'become', 'in', 'of', 'for', 'and', 'or', 'as',
  'with', 'on', 'at', 'my', 'me', 'i', 'is', 'be', 'want', 'wanting',
]);

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'] as const;

type CatalogItem = (typeof courseCatalog)[number];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
}

function normalizeInterest(interest: string): string[] {
  return tokenize(interest);
}

function itemTokens(item: CatalogItem): Set<string> {
  return new Set([
    ...tokenize(item.title),
    ...tokenize(item.description),
    ...item.skills.flatMap((skill) => tokenize(skill)),
  ]);
}

function difficultyDistance(a: LearnerProfile['skillLevel'], b: CatalogItem['difficulty']): number {
  return Math.abs(DIFFICULTY_ORDER.indexOf(a) - DIFFICULTY_ORDER.indexOf(b));
}

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface ScoredItem {
  item: CatalogItem;
  relevanceScore: number;
  reasons: string[];
}

function scoreInterestOverlap(tokens: Set<string>, interests: string[]): { points: number; reasons: string[]; matched: string[] } {
  const matched = interests.filter((interest) => normalizeInterest(interest).some((t) => tokens.has(t)));
  if (matched.length === 0) return { points: 0, reasons: [], matched };
  const reasons = matched.map((interest) => `Matches your interest in ${titleCase(interest.trim())}`);
  return { points: Math.min(matched.length * 15, 45), reasons, matched };
}

function scoreGoalMatch(item: CatalogItem, goalKeywords: string[]): { points: number; reasons: string[] } {
  const tokens = itemTokens(item);
  const matched = goalKeywords.filter((keyword) => tokens.has(keyword));
  if (matched.length === 0) return { points: 0, reasons: [] };
  return {
    points: Math.min(matched.length * 10, 30),
    reasons: [`Aligns with your goal of ${item.type === 'project' ? 'building' : 'learning'} something related to "${matched.join('", "')}"`],
  };
}

function scoreSkillGap(item: CatalogItem, knownSkills: Set<string>): { points: number; reasons: string[] } {
  const newSkills = item.skills.filter((s) => !knownSkills.has(s.toLowerCase()));
  if (newSkills.length === 0) return { points: 0, reasons: [] };
  const ratio = newSkills.length / item.skills.length;
  return {
    points: Math.round(ratio * 20),
    reasons: [`Fills your skill gap in ${newSkills.join(', ')}`],
  };
}

function scoreDifficultyFit(profile: LearnerProfile, item: CatalogItem): { points: number; reasons: string[] } {
  const distance = difficultyDistance(profile.skillLevel, item.difficulty);
  if (distance === 0) return { points: 25, reasons: [`Matches your ${profile.skillLevel} level`] };
  if (distance === 1) {
    return { points: 10, reasons: [`A reachable step ${DIFFICULTY_ORDER.indexOf(item.difficulty) > DIFFICULTY_ORDER.indexOf(profile.skillLevel) ? 'above' : 'below'} your ${profile.skillLevel} level`] };
  }
  return { points: 0, reasons: [] };
}

function interleaveByType(scored: ScoredItem[]): ScoredItem[] {
  const byType: Record<CatalogItem['type'], ScoredItem[]> = { course: [], project: [], resource: [] };
  for (const entry of scored) byType[entry.item.type].push(entry);
  const queues = Object.values(byType).sort((a, b) => (b[0]?.relevanceScore ?? 0) - (a[0]?.relevanceScore ?? 0));
  const result: ScoredItem[] = [];
  while (result.length < MAX_RESULTS && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && result.length < MAX_RESULTS) result.push(next);
    }
  }
  return result;
}

export function recommend(profile: LearnerProfile, feedback: Record<string, FeedbackRating>): Recommendation[] {
  const knownSkills = new Set(profile.knownSkills.map((s) => s.toLowerCase()));
  const completedIds = new Set(profile.completedCourses.map((id) => id.toLowerCase()));
  const goalKeywords = tokenize(profile.goal).filter((t) => !GOAL_STOPWORDS.has(t));
  const interests = profile.interests;
  const downvotedIds = new Set(Object.entries(feedback).filter(([, rating]) => rating === 'down').map(([id]) => id.toLowerCase()));
  const upvotedSkills = new Set(
    courseCatalog.filter((item) => feedback[item.id] === 'up').flatMap((item) => item.skills.map((s) => s.toLowerCase())),
  );

  const scored: ScoredItem[] = [];

  for (const item of courseCatalog) {
    if (completedIds.has(item.id.toLowerCase())) continue;
    if (item.skills.every((s) => knownSkills.has(s.toLowerCase()))) continue;
    if (downvotedIds.has(item.id.toLowerCase())) continue;

    const tokens = itemTokens(item);
    const reasons: string[] = [];
    let relevanceScore = 0;

    const interestResult = scoreInterestOverlap(tokens, interests);
    relevanceScore += interestResult.points;
    reasons.push(...interestResult.reasons);

    const goalResult = scoreGoalMatch(item, goalKeywords);
    relevanceScore += goalResult.points;
    reasons.push(...goalResult.reasons);

    const gapResult = scoreSkillGap(item, knownSkills);
    relevanceScore += gapResult.points;
    reasons.push(...gapResult.reasons);

    const difficultyResult = scoreDifficultyFit(profile, item);
    relevanceScore += difficultyResult.points;
    reasons.push(...difficultyResult.reasons);

    const upvotedSkillMatch = item.skills.find((s) => upvotedSkills.has(s.toLowerCase()));
    if (upvotedSkillMatch !== undefined) {
      relevanceScore += FEEDBACK_BOOST;
      reasons.push(`You gave a thumbs up to content involving ${upvotedSkillMatch}`);
    }

    scored.push({ item, relevanceScore: Math.min(relevanceScore, MAX_SCORE), reasons });
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore || a.item.title.localeCompare(b.item.title));
  return interleaveByType(scored).map(({ item, relevanceScore, reasons }) => ({ ...item, relevanceScore, reasons }));
}
