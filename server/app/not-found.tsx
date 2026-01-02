export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page Not Found</p>
        <a
          href="/"
          className="text-blue-500 hover:text-blue-400 underline"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}