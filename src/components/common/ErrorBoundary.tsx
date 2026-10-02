import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SiteSync Pro UI ErrorBoundary Caught]', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleResetAndRecover = () => {
    try {
      localStorage.removeItem('sitesync_access_token');
      localStorage.removeItem('sitesync_refresh_token');
      localStorage.removeItem('sitesync_role');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 m-4 shadow-2xl">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight">System Component Exception</h2>
              <p className="text-xs text-slate-400">
                A rendering issue was intercepted by the SiteSync Pro Enterprise Error Boundary.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.message || 'Unknown render exception'}
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer min-h-[38px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Component</span>
              </button>
              <button
                onClick={this.handleResetAndRecover}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer min-h-[38px]"
              >
                <span>Reset & Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
