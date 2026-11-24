import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in NK App:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('nk_auth_user');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black mb-2">ऐप लोड करने में समस्या आई</h1>
          <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
            Please refresh the application or reset to return to the portal.
          </p>
          {this.state.error && (
            <div className="mb-6 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-rose-300 font-mono max-w-md overflow-x-auto text-left">
              {this.state.error.message || 'Unknown error'}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>रिफ्रेश करें (Reload App)</span>
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>पोर्टल पर जाएं (Reset to Portal)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
