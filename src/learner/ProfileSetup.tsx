import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { LearnerProfile, SkillLevel } from '@/types';
import { loadProfile, saveProfile, loadPendingGoal, clearPendingGoal } from '@/learner/profileService';

const INTEREST_OPTIONS = [
  'Web Development',
  'AI/ML',
  'Data Science',
  'Mobile Development',
  'DevOps',
  'Cybersecurity',
];

const SKILL_LEVELS: Array<{ value: SkillLevel; label: string; description: string }> = [
  { value: 'beginner', label: 'Beginner', description: 'Just getting started' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with fundamentals' },
  { value: 'advanced', label: 'Advanced', description: 'Deep experience in some areas' },
];

const STEPS = ['About you', 'Interests', 'Skills and courses', 'Goal'];

interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ label, placeholder, tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed === '') return;
    if (!tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-grow px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={input.trim() === ''}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-brand-800 bg-brand-50 border border-brand-200 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="ml-1 text-brand-600"
                aria-label={`Remove ${tag}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileSetup() {
  const [existingProfile, setExistingProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [knownSkills, setKnownSkills] = useState<string[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await loadProfile();
        if (cancelled) return;
        setExistingProfile(profile);
        if (profile) {
          setName(profile.name);
          setSkillLevel(profile.skillLevel);
          setInterests(profile.interests);
          setKnownSkills(profile.knownSkills);
          setCompletedCourses(profile.completedCourses);
          setGoal(profile.goal);
          setWeeklyHours(profile.weeklyHours);
        }
        const pending = loadPendingGoal();
        if (pending) {
          setGoal(pending);
          clearPendingGoal();
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed === '' || interests.includes(trimmed)) return;
    setInterests([...interests, trimmed]);
    setCustomInterest('');
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const stepValid = [
    name.trim() !== '',
    interests.length > 0,
    true,
    goal.trim() !== '',
  ][step];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const savedProfile = await saveProfile({
        name: name.trim(),
        interests,
        skillLevel,
        knownSkills,
        completedCourses,
        goal: goal.trim(),
        weeklyHours,
      });
      setExistingProfile(savedProfile);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Your learning profile</h1>
        <p className="mt-2 text-gray-600">
          Tell us about yourself so we can build a path that actually fits you.
        </p>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg" role="alert">
            {error}
          </div>
        )}

        {saved ? (
          <div className="mt-8 p-8 bg-white border border-gray-100 rounded-2xl shadow-soft">
            <div className="text-4xl" aria-hidden="true">&#10003;</div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Profile saved{existingProfile ? ' and updated' : ''}
            </h2>
            <p className="mt-2 text-gray-600">
              Your profile is ready. Head over to the roadmap to generate your personalized learning path.
            </p>
            <Link
              to="/roadmap"
              className="inline-block px-6 py-3 mt-6 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
            >
              Generate my roadmap
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-8" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-full h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-gray-200'}`}
                    title={label}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-medium text-brand-700">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>

            <div className="mt-6 p-8 bg-white border border-gray-100 rounded-2xl shadow-soft">
              {step === 0 && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    What should we call you?
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 mt-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
                  />

                  <fieldset className="mt-6">
                    <legend className="text-sm font-medium text-gray-700">Experience level</legend>
                    <div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-3">
                      {SKILL_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setSkillLevel(level.value)}
                          aria-pressed={skillLevel === level.value}
                          className={`p-4 text-left border rounded-lg ${
                            skillLevel === level.value
                              ? 'border-brand-600 bg-brand-50'
                              : 'border-gray-100 bg-white'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-gray-900">{level.label}</span>
                          <span className="block mt-1 text-xs text-gray-600">{level.description}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {step === 1 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Pick at least one area you want to grow in.</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {INTEREST_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleInterest(option)}
                        aria-pressed={interests.includes(option)}
                        className={`px-4 py-2 text-sm border rounded-full ${
                          interests.includes(option)
                            ? 'text-white bg-brand-600 border-brand-600'
                            : 'text-gray-700 bg-white border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <label htmlFor="custom-interest" className="block mt-6 text-sm font-medium text-gray-700">
                    Something else?
                  </label>
                  <div className="flex gap-2 mt-2">
                    <input
                      id="custom-interest"
                      type="text"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomInterest();
                        }
                      }}
                      placeholder="e.g. Game Development"
                      className="flex-grow px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      disabled={customInterest.trim() === ''}
                      className="px-4 py-2 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <TagInput
                    label="Skills you already know"
                    placeholder="e.g. JavaScript"
                    tags={knownSkills}
                    onChange={setKnownSkills}
                  />
                  <TagInput
                    label="Completed courses"
                    placeholder="e.g. CS50"
                    tags={completedCourses}
                    onChange={setCompletedCourses}
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                    What is your goal?
                  </label>
                  <textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={4}
                    placeholder="Describe it in your own words, e.g. I want to become a full stack developer and land my first job."
                    className="w-full px-3 py-2 mt-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none resize-none"
                  />

                  <label htmlFor="weekly-hours" className="block mt-6 text-sm font-medium text-gray-700">
                    Hours per week: <span className="font-bold text-brand-700">{weeklyHours}</span>
                  </label>
                  <input
                    id="weekly-hours"
                    type="range"
                    min={1}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full mt-3 accent-brand-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1h</span>
                    <span>40h</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg disabled:text-gray-400 disabled:border-transparent"
              >
                Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!stepValid}
                  className="px-6 py-3 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!stepValid || saving}
                  className="px-6 py-3 text-sm font-semibold text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none"
                >
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
