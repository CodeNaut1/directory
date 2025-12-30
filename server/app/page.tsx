export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Bitcoin in Africa Directory
        </h1>
        <p className="text-2xl text-gray-300 mb-4">Backend API Server</p>
        <p className="text-lg text-gray-500">API endpoints are available under /api</p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <a
            href="/api"
            className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-blue-500 hover:bg-gray-900"
          >
            <h2 className="mb-3 text-xl font-semibold text-gray-100">
              API Docs{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="text-sm text-gray-400">
              Explore the available API endpoints
            </p>
          </a>

          <a
            href="http://localhost:5173"
            className="group rounded-lg border border-gray-700 px-5 py-4 transition-colors hover:border-blue-500 hover:bg-gray-900"
          >
            <h2 className="mb-3 text-xl font-semibold text-gray-100">
              Frontend{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="text-sm text-gray-400">
              Visit the client application
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}