import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  ChevronRight,
  Award,
  Clock,
  Brain,
  Zap,
  Flame,
  BarChart2,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { generateQuizQuestions, saveSkillScore, loadSkillScores } from '@/services/quizService';
import CodeBlock from '@/components/CodeBlock';
import type { QuizQuestion, SkillScore } from '@/types';

interface QuizTopic {
  id: string;
  name: string;
  icon: string;
}

interface DifficultyLevel {
  id: string;
  name: string;
  color: string;
}

type ScreenType = 'config' | 'quiz' | 'result';

const QUIZ_TOPICS: QuizTopic[] = [
  { id: 'html', name: 'HTML', icon: '📄' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'node', name: 'Node.js', icon: '🟢' },
];

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'beginner', name: 'Beginner', color: 'bg-green-500' },
  { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-500' },
  { id: 'advanced', name: 'Advanced', color: 'bg-red-500' },
];

const TOPIC_NAMES: Record<string, string> = Object.fromEntries(
  QUIZ_TOPICS.map(t => [t.id, t.name])
);

const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = ['#0D9488', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#10B981'];

export default function Quiz() {
  const [screen, setScreen] = useState<ScreenType>('config');
  const [topic, setTopic] = useState<string>('javascript');
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<boolean>(false);
  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answeredRef = useRef<boolean>(false);
  const streakRef = useRef<number>(0);
  const highestStreakRef = useRef<number>(0);

  const handleTimeout = useCallback((): void => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelectedAnswer('TIMEOUT');
    setShowExplanation(true);
    setStreak(0);
    streakRef.current = 0;
  }, []);

  useEffect(() => {
    if (screen !== 'quiz' || showExplanation || selectedAnswer) return;
    answeredRef.current = false;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += 1;
      const next = 30 - elapsed;
      setTimeLeft(next >= 0 ? next : 0);
      if (elapsed >= 30) {
        clearInterval(timer);
        if (!answeredRef.current) {
          answeredRef.current = true;
          handleTimeout();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, currentQuestionIndex, showExplanation, selectedAnswer, handleTimeout]);

  useEffect(() => () => {
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
  }, []);


  const clearQuestionState = useCallback((): void => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(30);
    answeredRef.current = false;
  }, []);

  const handleAnswerClick = useCallback((answer: string): void => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    const correct = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (correct) {
      setScore(s => s + 1);
      streakRef.current += 1;
      setStreak(streakRef.current);
      if (streakRef.current > highestStreakRef.current) {
        highestStreakRef.current = streakRef.current;
        setHighestStreak(streakRef.current);
      }
      if (timeLeft > 20) {
        setCelebration(true);
        if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = setTimeout(() => setCelebration(false), 1000);
      }
    } else {
      streakRef.current = 0;
      setStreak(0);
    }
  }, [questions, currentQuestionIndex, timeLeft]);

  const startQuiz = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    streakRef.current = 0;
    highestStreakRef.current = 0;
    setCurrentQuestionIndex(0);
    clearQuestionState();
    setCelebration(false);
    try {
      const mockQuestions = await generateQuizQuestions(topic, difficulty);
      if (mockQuestions.length > 0) {
        setQuestions(mockQuestions);
        setScreen('quiz');
      } else {
        setError('No questions were generated. Please try again or select a different topic.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`${errorMessage}. Please try again or select a different topic.`);
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty, clearQuestionState]);

  const nextQuestion = useCallback(async (): Promise<void> => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      clearQuestionState();
    } else {
      const totalQuestions = questions.length;
      try {
        await saveSkillScore({ topic, score, totalQuestions, assessedAt: new Date().toISOString() });
        const scores = await loadSkillScores();
        setSkillScores(scores);
      } catch (e) {
        console.error('Failed to save skill score', e);
        setError(e instanceof Error ? e.message : 'Failed to save score');
      }
      setScreen('result');
      if (score >= questions.length && questions.length > 0) {
        setCelebration(true);
        if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = setTimeout(() => setCelebration(false), 2000);
      }
    }
  }, [currentQuestionIndex, questions.length, clearQuestionState, score, topic]);

  const restartQuiz = useCallback((): void => {
    setScreen('config');
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    streakRef.current = 0;
    highestStreakRef.current = 0;
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSkillScores([]);
    setError(null);
    clearQuestionState();
    setCelebration(false);
  }, [clearQuestionState]);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      left: 30 + ((i * 17 + 3) % 40),
      top: 30 + ((i * 41 + 7) % 40),
      dx: (((i * 23 + 11) % 100) - 50) * 4,
      dy: (((i * 37 + 19) % 100) - 50) * 4,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" aria-hidden="true" />
          <p className="text-lg font-medium text-stone-700">
            Generating {difficulty} level {topic} questions...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-4 min-h-screen bg-stone-50">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-brand-600">
              Developer Quiz Challenge
            </span>
          </h1>
          <p className="text-stone-500">
            Test your knowledge and track your progress
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {screen === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="p-6 bg-white rounded-2xl border shadow-soft border-stone-100"
            >
              <h2 className="flex items-center mb-6 text-2xl font-bold">
                <Brain className="mr-2 text-brand-500" aria-hidden="true" /> Quiz Setup
              </h2>

              <div className="mb-6">
                <label className="block mb-3 font-medium">Topic</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5" role="radiogroup" aria-label="Select quiz topic">
                  {QUIZ_TOPICS.map(t => (
                    <motion.button
                      key={t.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTopic(t.id)}
                      role="radio"
                      aria-checked={topic === t.id}
                      className={`p-4 rounded-lg flex flex-col items-center transition-colors ${
                        topic === t.id
                          ? 'bg-brand-100 border-2 border-brand-300'
                          : 'bg-stone-50'
                      }`}
                    >
                      <span className="mb-2 text-2xl" aria-hidden="true">{t.icon}</span>
                      <span className="font-medium">{t.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block mb-3 font-medium">Difficulty</label>
                <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select difficulty level">
                  {DIFFICULTY_LEVELS.map(d => (
                    <motion.button
                      key={d.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty(d.id)}
                      role="radio"
                      aria-checked={difficulty === d.id}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        difficulty === d.id
                          ? `${d.color} text-white`
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {d.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center p-3 mb-4 text-red-600 bg-red-50 rounded-lg" role="alert">
                  <AlertCircle className="mr-2" size={18} aria-hidden="true" />
                  {error}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={startQuiz}
                disabled={isLoading}
                className="py-3 w-full font-medium text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start Quiz
              </motion.button>
            </motion.div>
          )}

          {screen === 'quiz' && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden bg-white rounded-2xl border shadow-soft border-stone-100"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col gap-2 justify-between items-center mb-6 md:flex-row">
                  <div className="flex gap-4 items-center p-2 w-full rounded-lg bg-stone-50 md:w-auto">
                    <div className="flex items-center text-stone-700">
                      <Award className="mr-1.5 text-brand-500" size={18} aria-hidden="true" />
                      <span className="font-medium">{score} pts</span>
                    </div>
                    <div className="h-5 border-r border-stone-300" aria-hidden="true" />
                    <div className="flex items-center text-stone-700">
                      <Flame className="mr-1.5 text-orange-500" size={18} aria-hidden="true" />
                      <span className="font-medium">{streak} streak</span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center p-2 w-full rounded-lg bg-stone-50 md:w-auto">
                    <div className="flex items-center text-stone-700">
                      <Clock className={`mr-1.5 ${timeLeft < 10 ? 'text-red-500' : 'text-brand-500'}`} size={18} aria-hidden="true" />
                      <span className={`font-medium ${timeLeft < 10 ? 'text-red-500' : ''}`}>{timeLeft}s</span>
                    </div>
                    <div className="h-5 border-r border-stone-300" aria-hidden="true" />
                    <div className="font-medium text-stone-700">
                      {currentQuestionIndex + 1}/{questions.length}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-xl font-medium text-stone-800">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.code && (
                    <div className="mb-5 rounded-lg overflow-hidden">
                      <CodeBlock
                        code={currentQuestion.code}
                        language={topic === 'javascript' ? 'javascript' : topic === 'html' ? 'html' : topic}
                        showLineNumbers={true}
                      />
                    </div>
                  )}

                  <div className="mb-4 space-y-3" role="radiogroup" aria-label="Answer options">
                    {currentQuestion.options.map((option, i) => {
                      let buttonStyle = 'bg-stone-50 border border-stone-200';

                      if (selectedAnswer) {
                        if (option === currentQuestion.correctAnswer) {
                          buttonStyle = 'bg-green-100 border border-green-300 text-green-800';
                        } else if (option === selectedAnswer) {
                          buttonStyle = 'bg-red-100 border border-red-300 text-red-800';
                        } else {
                          buttonStyle = 'bg-stone-50 border border-stone-200 opacity-70';
                        }
                      }

                      return (
                        <motion.button
                          key={`${currentQuestionIndex}-${i}`}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 30, delay: 0.05 * i }}
                          whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                          onClick={() => !selectedAnswer && handleAnswerClick(option)}
                          disabled={!!selectedAnswer}
                          role="radio"
                          aria-checked={selectedAnswer === option}
                          className={`w-full p-3.5 text-left rounded-lg transition-all ${buttonStyle} flex items-center`}
                        >
                          <span className="flex justify-center items-center mr-3 w-7 h-7 text-sm font-medium rounded-full bg-stone-200 text-stone-700" aria-hidden="true">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {showExplanation && currentQuestion.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 mb-4 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <h4 className="flex items-center mb-2 font-medium text-amber-800">
                        <Lightbulb className="mr-2 text-amber-500" size={18} aria-hidden="true" />
                        Explanation
                      </h4>
                      <p className="text-stone-700">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {showExplanation && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextQuestion}
                    className="flex justify-center items-center py-3 w-full font-medium text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>Next Question <ChevronRight size={18} className="ml-1" aria-hidden="true" /></>
                    ) : (
                      <>Finish Quiz <Award size={18} className="ml-1" aria-hidden="true" /></>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {screen === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="relative p-6 bg-white rounded-2xl border shadow-soft border-stone-100"
            >
              {celebration && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" aria-hidden="true">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-6xl"
                  >
                    🎉
                  </motion.div>
                  {particles.map((p, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: p.color,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                      }}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.5, 0],
                        x: p.dx,
                        y: p.dy,
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: 1.2, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              )}
              <h2 className="flex items-center mb-6 text-2xl font-bold">
                <BarChart2 className="mr-2 text-brand-500" aria-hidden="true" /> Quiz Results
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 text-center bg-brand-50 rounded-lg border border-brand-100"
                >
                  <div className="mb-1 text-3xl font-bold text-brand-700">{score}/{questions.length}</div>
                  <div className="text-sm text-stone-600">Correct Answers</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 text-center bg-amber-50 rounded-lg border border-amber-100"
                >
                  <div className="mb-1 text-3xl font-bold text-amber-700">
                    {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-stone-600">Score</div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-5 text-center bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="mb-1 text-3xl font-bold text-orange-700">{highestStreak}</div>
                  <div className="text-sm text-stone-600">Highest Streak</div>
                </motion.div>
              </div>

              <div className="mb-8">
                <h3 className="flex items-center mb-4 text-lg font-medium">
                  <Zap className="mr-2 text-yellow-500" size={18} aria-hidden="true" />
                  Performance Insights
                </h3>

                <div className="p-4 rounded-lg border bg-stone-50 border-stone-200">
                  {score === questions.length ? (
                    <p className="text-green-700">
                      Perfect score! You've mastered this {topic} {difficulty} quiz.
                    </p>
                  ) : score >= questions.length * 0.8 ? (
                    <p className="text-brand-700">
                      Great job! You have a strong understanding of {topic} at the {difficulty} level.
                    </p>
                  ) : score >= questions.length * 0.6 ? (
                    <p className="text-amber-700">
                      Good effort! With a bit more practice, you'll master {topic} at the {difficulty} level.
                    </p>
                  ) : (
                    <p className="text-orange-700">
                      Keep practicing! {topic} at the {difficulty} level needs more of your attention.
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="flex items-center mb-4 text-lg font-medium">
                  <BarChart2 className="mr-2 text-brand-500" size={18} aria-hidden="true" />
                  Skill Breakdown
                </h3>
                <div className="space-y-2">
                  {skillScores.map(s => {
                    const pct = s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0;
                    const isCurrent = s.topic === topic;
                    return (
                      <div
                        key={s.topic}
                        className={`flex justify-between items-center p-3 rounded-lg border ${
                          isCurrent ? 'bg-brand-50 border-brand-300' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <span className="font-medium text-stone-800">
                          {TOPIC_NAMES[s.topic] ?? s.topic}
                          {isCurrent && (
                            <span className="ml-2 text-xs font-medium text-brand-600">just assessed</span>
                          )}
                        </span>
                        <span className="text-sm text-stone-600">
                          {s.score}/{s.totalQuestions} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 p-4 rounded-lg border border-brand-200 bg-brand-50">
                <p className="mb-3 text-stone-700">
                  Your skill scores were saved. Regenerate your learning path so it adapts to your
                  latest results, or view your progress over time.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/roadmap"
                    className="flex flex-1 justify-center items-center py-3 font-medium text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Regenerate Learning Path
                    <ChevronRight size={18} className="ml-1" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/progress"
                    className="flex flex-1 justify-center items-center py-3 font-medium text-brand-700 bg-white border border-brand-300 rounded-lg shadow-soft"
                  >
                    View Skill Progress
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={restartQuiz}
                  className="flex flex-1 justify-center items-center py-3 font-medium text-white bg-brand-gradient rounded-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Try Another Quiz
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}