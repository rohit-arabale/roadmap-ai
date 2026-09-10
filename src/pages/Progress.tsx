import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
  ArrowRight,
  BarChart3,
  Check,
  Circle,
  Clock,
  Flag,
  ListChecks,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LearnerProfile, LearningPath, RoadmapNode, SkillScore } from '@/types';
import { loadProfile } from '@/learner/profileService';
import { loadPath } from '@/services/pathService';
import { loadSkillScores } from '@/services/quizService';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const STATUS_BADGE_CLASSES: Record<RoadmapNode['status'], string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-100',
  'in-progress': 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-brand-50 text-brand-700 border-brand-200',
};

const STATUS_DOT_CLASSES: Record<RoadmapNode['status'], string> = {
  pending: 'bg-gray-300 border-white',
  'in-progress': 'bg-amber-500 border-white',
  completed: 'bg-brand-600 border-white',
};

function scorePercent(score: SkillScore): number {
  if (score.totalQuestions <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score.score / score.totalQuestions) * 100)));
}

function topicLabel(topic: string): string {
  return topic
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Progress() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, pa, scores] = await Promise.all([
          loadProfile().catch(() => null),
          loadPath().catch(() => null),
          loadSkillScores().catch(() => []),
        ]);
        setProfile(p);
        setPath(pa);
        setSkillScores(scores);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completionPercent = path === null || path.nodes.length === 0
    ? 0
    : Math.round(
        (path.nodes.filter((node) => node.status === 'completed').length / path.nodes.length) * 100,
      );
  const milestonesDone = path?.milestones.filter(
    (milestone) => milestone.status === 'completed',
  ).length ?? 0;
  const hoursRemaining = path?.nodes
    .filter((node) => node.status !== 'completed')
    .reduce((total, node) => total + (node.estimatedTime ?? 0), 0) ?? 0;

  const radarData = useMemo(() => {
    return {
      labels: skillScores.map((skill) => topicLabel(skill.topic)),
      datasets: [
        {
          label: 'Skill score',
          data: skillScores.map((skill) => scorePercent(skill)),
          backgroundColor: 'rgba(13, 148, 136, 0.2)',
          borderColor: 'rgb(13, 148, 136)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(13, 148, 136)',
        },
      ],
    };
  }, [skillScores]);

  const nextActions = useMemo(() => {
    if (!path) return [];
    return path.nodes.filter((node) => {
      if (node.status !== 'pending') return false;
      return (node.prerequisites ?? []).every((prereqId) => {
        const prereq = path.nodes.find((candidate) => candidate.id === prereqId);
        return prereq === undefined || prereq.status === 'completed';
      });
    }).slice(0, 3);
  }, [path]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <p className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-brand-600" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">No profile yet</h1>
          <p className="mt-3 text-gray-600">
            Create your learner profile first so your progress has something to build on.
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
          <ListChecks className="mx-auto h-12 w-12 text-brand-600" aria-hidden="true" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">No learning path yet</h1>
          <p className="mt-3 text-gray-600">
            Hi {profile.name}, generate a path for your goal and your progress will show up here.
          </p>
          <Link
            to="/roadmap"
            className="btn-primary mt-8"
          >
            Build my path
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Your progress</h1>
        <p className="mt-2 text-gray-600">{path.goal}</p>

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3">
          <div className="card-surface card-surface-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-600">Path completion</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{completionPercent}%</p>
          </div>
          <div className="card-surface card-surface-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Flag className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-600">Milestones done</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {milestonesDone}
              <span className="text-lg font-medium text-gray-500"> / {path.milestones.length}</span>
            </p>
          </div>
          <div className="card-surface card-surface-hover p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-600">Estimated hours left</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{hoursRemaining}h</p>
          </div>
        </div>

        <section className="p-6 mt-8 bg-white border border-gray-100 rounded-2xl shadow-soft">
          <h2 className="text-xl font-bold text-gray-900">Skill development</h2>
          {skillScores.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-600">No skill assessments yet.</p>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Take a skills quiz
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="h-80 mt-4">
              <Radar
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: { stepSize: 25 },
                    },
                  },
                }}
              />
            </div>
          )}
        </section>

        <section className="p-6 mt-8 bg-white border border-gray-100 rounded-2xl shadow-soft">
          <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
          {path.milestones.length === 0 ? (
            <p className="mt-4 text-gray-600">This path has no milestones.</p>
          ) : (
            <ol className="mt-6 flex flex-wrap items-start gap-y-6">
              {path.milestones.map((milestone, index) => (
                <li key={milestone.id} className={`flex items-start ${index > 0 ? 'flex-1 min-w-[10rem]' : ''}`}>
                  {index > 0 && (
                    <span className="mt-3 h-0.5 w-6 flex-shrink-0 bg-gray-200" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${STATUS_DOT_CLASSES[milestone.status]}`}
                      aria-hidden="true"
                    >
                      {milestone.status === 'completed' && (
                        <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      )}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{milestone.title}</p>
                    <span
                      className={`inline-block px-3 py-1 mt-2 text-xs font-semibold border rounded-full ${STATUS_BADGE_CLASSES[milestone.status]}`}
                    >
                      {milestone.status === 'completed'
                        ? 'Completed'
                        : milestone.status === 'in-progress'
                          ? 'In progress'
                          : 'Not started'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="p-6 mt-8 bg-white border border-gray-100 rounded-2xl shadow-soft">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-900">Next recommended actions</h2>
          </div>
          {nextActions.length === 0 ? (
            <p className="mt-4 text-gray-600">
              Nothing unlocked right now. Finish an in-progress step or check your roadmap.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {nextActions.map((node) => (
                <li key={node.id}>
                  <Link
                    to="/roadmap"
                    className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl shadow-soft bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    <Circle className="mt-1 h-3 w-3 flex-shrink-0 text-brand-600" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-900">{node.title}</span>
                      <span className="block mt-1 text-sm text-gray-600">{node.description}</span>
                      <span className="mt-2 inline-flex items-center gap-x-3 text-xs text-gray-500">
                        <span className="capitalize">{node.type}</span>
                        {node.estimatedTime !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {node.estimatedTime}h
                          </span>
                        )}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-brand-700" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
