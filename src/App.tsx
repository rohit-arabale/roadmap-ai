import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorFallback from '@/components/shared/ErrorFallback';
import ChatBot from '@/chatbot/ChatBot';

const Home = lazy(() => import('@/pages/Home'));
const Progress = lazy(() => import('@/pages/Progress'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const Resume = lazy(() => import('@/pages/Resume'));
const Roadmap = lazy(() => import('@/pages/Roadmap'));
const ProfileSetup = lazy(() => import('@/learner/ProfileSetup'));

const LoadingPage = () => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-stone-50">
    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    <p className="mt-4 text-sm text-stone-600">Loading...</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/profile" element={<ProfileSetup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </ErrorBoundary>
    </Router>
  );
}
