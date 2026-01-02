'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">Error</h1>
        <p className="text-xl text-gray-400 mb-8">Something went wrong!</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}