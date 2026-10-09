import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XCircle
};

const STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/20',
  warning: 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-amber-950/20',
  info: 'bg-blue-950/90 border-blue-500/30 text-blue-100 shadow-blue-950/20',
  error: 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-rose-950/20'
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  error: 'text-rose-400'
};

export default function ToastNotification() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        const styleClass = STYLES[toast.type] || STYLES.info;
        const iconColor = ICON_COLORS[toast.type] || ICON_COLORS.info;

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in pointer-events-auto ${styleClass}`}
          >
            <div className={`flex-shrink-0 ${iconColor}`}>
              <Icon size={20} />
            </div>
            
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
