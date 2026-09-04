import { Component, ReactNode } from 'react';
import { useTr } from '@/i18n/LangContext';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

/** 错误兜底 UI：函数组件以便使用 i18n hook */
function ErrorFallback({ error }: { error: Error | null }) {
  const tr = useTr();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{tr({ zh: '出错了', en: 'Something went wrong' })}</h1>
      <p className="text-sm text-gray-500 mb-4">{error?.message}</p>
      <button onClick={() => window.location.reload()} className="btn-primary text-sm">
        {tr({ zh: '刷新页面', en: 'Reload page' })}
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
