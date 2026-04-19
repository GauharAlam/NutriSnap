import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 px-6">
          <div className="w-full max-w-md text-center space-y-6">
            {/* Error Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mx-auto">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-white">Something Went Wrong</h1>
              <p className="text-sm text-dark-300 leading-relaxed">
                An unexpected error occurred. Please try refreshing the page or going back to the dashboard.
              </p>
            </div>

            {/* Error Details (dev only) */}
            {this.state.error && (
              <div className="bg-glass-light rounded-2xl p-4 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="btn-gradient w-full"
              >
                <span>Try Again</span>
              </button>
              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = "/home";
                }}
                className="btn-ghost w-full py-3 text-sm"
              >
                Go to Dashboard
              </button>
            </div>

            <p className="text-[10px] text-dark-500">
              NutriSnap v2.1.0
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
