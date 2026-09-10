import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  ExternalLink,
  Flag,
  Lightbulb,
  ListChecks,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from 'lucide-react';
import type { LearnerProfile, LearningPath, RoadmapNode } from '@/types';
import { loadProfile } from '@/learner/profileService';
import { generatePath, loadPath, updateNodeStatus } from '@/services/pathService';
import { loadFeedback, saveFeedback, type FeedbackRating } from '@/services/feedbackService';
import { getPathStaleness, type PathStaleness } from '@/services/stalenessService';

const STATUS_CYCLE: Record<RoadmapNode['status'], RoadmapNode['status']> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
};

const STATUS_LABELS: Record<RoadmapNode['status'], string> = {
  pending: 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
};

const STATUS_BADGE_CLASSES: Record<RoadmapNode['status'], string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-100',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-brand-50 text-brand-700 border-brand-200',
};

const STATUS_DOT_CLASSES: Record<RoadmapNode['status'], string> = {
  pending: 'bg-gray-300',
  'in-progress': 'bg-amber-500',
  completed: 'bg-brand-600',
};

const TYPE_ICONS: Record<RoadmapNode['type'], typeof BookOpen> = {
  skill: BookOpen,
  project: Wrench,
  milestone: Flag,
};

function formatHours(hours?: number): string {
  if (hours === undefined) return 'No estimate';
  return `${hours}h`;
}

interface NodeCardProps {
  node: RoadmapNode;
  prereqTitles: string[];
  feedback: Record<string, FeedbackRating>;
  onToggleStatus: (nodeId: string, status: RoadmapNode['status']) => void;
  onRate: (nodeId: string, rating: FeedbackRating | null) => void;
}

function NodeCard({ node, prereqTitles, feedback, onToggleStatus, onRate }: NodeCardProps) {
  const [showReasons, setShowReasons] = useState(false);
  const Icon = TYPE_ICONS[node.type];
  const rating = feedback[node.id] ?? null;

  return (
    <article className="card-surface card-surface-hover p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-gray-900">{node.title}</h3>
            <button
              type="button"
              onClick={() => onToggleStatus(node.id, node.status)}
              aria-label={`Mark ${node.title} as ${STATUS_LABELS[STATUS_CYCLE[node.status]]}`}
              className={`flex-shrink-0 px-3 py-1 text-xs font-semibold border rounded-full ${STATUS_BADGE_CLASSES[node.status]} focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`}
            >
              {STATUS_LABELS[node.status]}
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {node.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatHours(node.estimatedTime)}
            </span>
            {prereqTitles.length > 0 && (
              <span>Requires: {prereqTitles.join(', ')}</span>
            )}
          </div>

          {node.resources !== undefined && node.resources.length > 0 && (
            <ul className="mt-3 space-y-1">
              {node.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    {resource.title}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {node.reasons !== undefined && node.reasons.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowReasons((prev) => !prev)}
                aria-expanded={showReasons}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
              >
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                Why this is recommended
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showReasons ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {showReasons && (
                <ul className="mt-2 ml-4 list-disc space-y-1 text-xs text-gray-600">
                  {node.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-500">Useful for you?</span>
            <button
              type="button"
              onClick={() => onRate(node.id, rating === 'up' ? null : 'up')}
              aria-label={`Mark ${node.title} as useful`}
              aria-pressed={rating === 'up'}
              className={`flex items-center justify-center h-7 w-7 rounded-full border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                rating === 'up'
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onRate(node.id, rating === 'down' ? null : 'down')}
              aria-label={`Mark ${node.title} as not useful`}
              aria-pressed={rating === 'down'}
              className={`flex items-center justify-center h-7 w-7 rounded-full border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                rating === 'down'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Roadmap() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackRating>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [staleness, setStaleness] = useState<PathStaleness>({ stale: false, reason: null });

  const refresh = useCallback(async () => {
    try {
      const [p, pa, fb] = await Promise.all([
        loadProfile().catch(() => null),
        loadPath().catch(() => null),
        loadFeedback().catch(() => ({} as Record<string, FeedbackRating>)),
      ]);
      setProfile(p);
      setPath(pa);
      setFeedback(fb);
      if (pa) {
        const s = await getPathStaleness().catch(() => ({ stale: false, reason: null }));
        setStaleness(s);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const handleGenerate = async () => {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const nextPath = await generatePath();
      setPath(nextPath);
      const s = await getPathStaleness().catch(() => ({ stale: false, reason: null }));
      setStaleness(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate your learning path');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (nodeId: string, status: RoadmapNode['status']) => {
    if (!path) return;
    try {
      const updated = await updateNodeStatus(path.id, nodeId, STATUS_CYCLE[status]);
      setPath(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleRate = async (nodeId: string, rating: FeedbackRating | null) => {
    try {
      await saveFeedback(nodeId, rating);
      const fb = await loadFeedback();
      setFeedback(fb);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feedback');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <ListChecks className="mx-auto h-12 w-12 text-brand-600" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">No profile yet</h1>
          <p className="mt-3 text-gray-600">
            Create your learner profile first so we can build a path that fits your level,
            interests, and weekly time.
          </p>
          <Link
            to="/"
            className="btn-primary mt-8"
          >
            Start with your goal
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your learning path</h1>
          <p className="mt-4 text-gray-600">
            Hi {profile.name}, we will turn this goal into an ordered roadmap with
            prerequisites, milestones, and time estimates based on{' '}
            {profile.weeklyHours} hours per week.
          </p>
          <p className="mt-6 p-4 text-left text-sm italic text-gray-800 bg-white border border-gray-100 rounded-2xl shadow-soft">
            &ldquo;{profile.goal}&rdquo;
          </p>
          {error !== null && (
            <p role="alert" className="mt-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary mt-8"
          >
            {generating ? 'Generating...' : 'Generate my path'}
            {!generating && <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    );
  }

  const completedCount = path.nodes.filter((node) => node.status === 'completed').length;
  const progressPercent =
    path.nodes.length === 0 ? 0 : Math.round((completedCount / path.nodes.length) * 100);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Your learning path</h1>
        <p className="mt-2 text-gray-600">{path.goal}</p>

        {staleness.stale && staleness.reason !== null && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <p className="text-sm text-amber-800">{staleness.reason}</p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-full disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {generating ? 'Regenerating...' : 'Regenerate now'}
            </button>
          </div>
        )}

        <div className="p-6 mt-6 bg-white border border-gray-100 rounded-2xl shadow-soft">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-700">Overall progress</span>
            <span className="text-sm font-bold text-brand-700">{progressPercent}%</span>
          </div>
          <div className="h-2 mt-3 bg-gray-200 rounded-full" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-2 bg-brand-600 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {completedCount} of {path.nodes.length} steps done · about{' '}
            {path.estimatedWeeks} week{path.estimatedWeeks === 1 ? '' : 's'} at{' '}
            {profile.weeklyHours}h per week
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {path.milestones.map((milestone) => {
            const milestoneNodes = milestone.nodeIds
              .map((id) => path.nodes.find((node) => node.id === id))
              .filter((node): node is RoadmapNode => node !== undefined);

            return (
              <section key={milestone.id}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${STATUS_DOT_CLASSES[milestone.status]}`} aria-hidden="true" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{milestone.title}</h2>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    <span className={`inline-block px-3 py-1 mt-2 text-xs font-semibold border rounded-full ${STATUS_BADGE_CLASSES[milestone.status]}`}>
                      {STATUS_LABELS[milestone.status]}
                    </span>
                  </div>
                </div>

                <ol className="mt-4 ml-1 space-y-4 border-l-2 border-gray-100 pl-6">
                  {milestoneNodes.map((node) => {
                    const prereqTitles = (node.prerequisites ?? [])
                      .map((id) => path.nodes.find((n) => n.id === id)?.title)
                      .filter((title): title is string => title !== undefined);

                    return (
                      <li key={node.id} className="relative">
                        <span
                          className={`absolute top-5 -left-[31px] h-3 w-3 rounded-full border-2 border-white ${STATUS_DOT_CLASSES[node.status]}`}
                          aria-hidden="true"
                        />
                        <NodeCard
                          node={node}
                          prereqTitles={prereqTitles}
                          feedback={feedback}
                          onToggleStatus={handleToggleStatus}
                          onRate={handleRate}
                        />
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        {error !== null && (
          <p role="alert" className="mt-8 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </p>
        )}

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-secondary"
          >
            {generating ? 'Generating...' : 'Regenerate path'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Regenerating replaces your current path and resets step statuses.
          </p>
        </div>
      </div>
    </div>
  );
}
