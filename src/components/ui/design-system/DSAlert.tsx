import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface DSAlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export const DSAlert: React.FC<DSAlertProps> = ({
  type = 'info',
  title,
  children,
  onDismiss,
  action,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type];

  return (
    <div className={`p-4 rounded-xl border ${current.bg} flex items-start justify-between gap-3 text-xs ${className}`}>
      <div className="flex items-start space-x-3">
        {current.icon}
        <div className="space-y-1">
          {title && <h4 className="font-bold text-xs uppercase tracking-wider">{title}</h4>}
          <div className="text-xs font-normal leading-relaxed">{children}</div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {action}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export interface DSNotificationCardProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  onMarkRead?: (id: string) => void;
  className?: string;
}

export const DSNotificationCard: React.FC<DSNotificationCardProps> = ({
  id,
  title,
  message,
  timestamp,
  isRead = false,
  type = 'INFO',
  onMarkRead,
  className = '',
}) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
        isRead
          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75'
          : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
            isRead ? 'bg-transparent' : 'bg-indigo-600'
          }`}
        />
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 dark:text-white text-xs">{title}</span>
            <span className="text-[10px] text-slate-400 font-mono">{timestamp}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      {!isRead && onMarkRead && (
        <button
          onClick={() => onMarkRead(id)}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 hover:underline shrink-0"
        >
          Mark read
        </button>
      )}
    </div>
  );
};
