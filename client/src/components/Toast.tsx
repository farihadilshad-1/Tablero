import { useApp } from '@/context/AppContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
        const color =
          toast.type === 'success'
            ? 'text-success-400 border-success-500/30'
            : toast.type === 'error'
              ? 'text-error-400 border-error-500/30'
              : 'text-brass-300 border-brass-500/30';
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border bg-charcoal-900 px-4 py-3 shadow-card-hover animate-slide-up ${color}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-charcoal-100 flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-charcoal-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
