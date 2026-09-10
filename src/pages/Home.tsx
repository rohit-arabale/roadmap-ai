import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Map, Compass, BarChart3, ClipboardList, Sparkles, Target } from 'lucide-react';
import type { LearnerProfile } from '@/types';
import { loadProfile, savePendingGoal } from '@/learner/profileService';

interface FeatureCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
}

const features: FeatureCard[] = [
  {
    icon: Map,
    title: 'AI Path Generation',
    description: 'Turn your goal into a step-by-step roadmap with milestones and time estimates.',
    to: '/roadmap',
  },
  {
    icon: Compass,
    title: 'Personalized Recommendations',
    description: 'Courses, projects, and resources matched to your level and interests.',
    to: '/roadmap',
  },
  {
    icon: BarChart3,
    title: 'Progress Dashboard',
    description: 'Track completed skills, streaks, XP, and badges as you move forward.',
    to: '/progress',
  },
  {
    icon: ClipboardList,
    title: 'Quiz Assessments',
    description: 'Verify what you know with quizzes that adapt your path to your real skill.',
    to: '/quiz',
  },
];

const stats = [
  { value: '4', label: 'Guided tools in one place' },
  { value: 'AI', label: 'Powered roadmap generation' },
  { value: '100%', label: 'Personalized to your goal' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <GoalIntakeHero />
      <StatsStrip />
      <FeatureGrid />
    </div>
  );
}

function GoalIntakeHero() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [profile, setProfile] = useState<LearnerProfile | null>(null);

  useEffect(() => {
    loadProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  function submitGoal() {
    savePendingGoal(goal.trim());
    navigate('/profile');
  }

  return (
    <section className="relative overflow-hidden border-b border-brand-100 bg-mesh-hero">
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-300/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex justify-center">
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI-generated career roadmaps
          </span>
        </div>

        <h1 className="mt-6 text-center font-display text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Tell us where you want to go.
          <br />
          <span className="text-gradient-brand">We build the path.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-600">
          Describe your learning goal in plain language and Roadmap.ai turns it into a personalized, AI-generated roadmap.
        </p>

        <form
          className="mx-auto mt-10 max-w-2xl"
          onSubmit={(event) => {
            event.preventDefault();
            submitGoal();
          }}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-soft-lg transition-colors focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
            <div className="flex items-start gap-2 px-3 pt-2">
              <Target className="mt-2.5 h-4 w-4 flex-shrink-0 text-brand-400" aria-hidden="true" />
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                rows={3}
                placeholder="I want to become a frontend developer in 6 months"
                aria-label="Describe your learning goal"
                className="w-full resize-none bg-transparent py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="mt-1 flex flex-col items-stretch gap-3 px-1 pb-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden px-3 text-xs text-gray-400 sm:block">Be as specific as you like — timeline, level, and interests all help.</p>
              <button type="submit" disabled={!goal.trim()} className="btn-primary w-full sm:w-auto">
                Build my path
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {profile && (
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={() => navigate('/roadmap')} className="btn-secondary">
                Continue as {profile.name}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-gray-100 px-4 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 py-4 text-center sm:py-0">
            <span className="font-display text-2xl font-bold text-brand-600 sm:text-3xl">{stat.value}</span>
            <span className="text-sm text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="bg-gray-50/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="section-eyebrow">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need, <span className="text-gradient-brand">one platform</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">
            From your first goal to a finished resume, Roadmap.ai keeps every step organized and personal to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                to={feature.to}
                className="card-surface card-surface-hover group flex flex-col p-6"
                style={{ transitionDelay: `${index * 20}ms` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-gradient group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
