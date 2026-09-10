import type { ErrorFallbackProps } from '@/types';

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return (
    <div role="alert" aria-live="assertive" className="flex flex-col items-center justify-center min-h-full p-8 bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-red-600">Oops! Something went wrong.</h1>
      <p className="mb-4 text-xl text-gray-700">{message}</p>
      <button
        type="button"
        className="px-6 py-3 text-white transition duration-300 ease-in-out transform bg-blue-500 rounded-lg hover:bg-blue-600 hover:scale-105"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}
