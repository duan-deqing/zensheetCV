import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">出错了</h1>
          <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
