import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-bg p-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-brand-text">
              حدث خطأ غير متوقع في واجهة التطبيق
            </h1>
            <p className="mt-2 text-sm text-brand-muted">
              تم إيقاف عرض هذا الجزء لحماية تجربة الاستخدام. يمكنك إعادة تحميل الصفحة أو العودة للرئيسية.
            </p>
            {this.state.error?.message && (
              <pre
                dir="ltr"
                className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-slate-100"
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>العودة إلى الصفحة الرئيسية</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
