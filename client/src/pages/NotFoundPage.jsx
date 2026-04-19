import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center -mx-4 px-6">
      {/* Background accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-neon-blue/8 to-neon-purple/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-md text-center space-y-6 animate-slide-up">
        {/* 404 Display */}
        <div className="relative">
          <h1 className="font-display text-8xl font-bold text-gradient select-none">404</h1>
          <div className="absolute inset-0 font-display text-8xl font-bold text-neon-blue/5 blur-xl select-none flex items-center justify-center">404</div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-dark-300 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link to="/home" className="btn-gradient w-full">
            <span>Back to Dashboard</span>
          </Link>
          <Link to="/landing" className="btn-ghost w-full py-3 text-sm">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
