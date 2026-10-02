import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export interface DSFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const DSField: React.FC<DSFieldProps> = ({
  label,
  required = false,
  helpText,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      </div>

      <div>{children}</div>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helpText ? (
        <p className="text-[11px] text-slate-400 font-medium">{helpText}</p>
      ) : null}
    </div>
  );
};

export interface DSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DSInput = React.forwardRef<HTMLInputElement, DSInputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
    );
  }
);
DSInput.displayName = 'DSInput';

export interface DSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string | number }[];
  error?: boolean;
}

export const DSSelect = React.forwardRef<HTMLSelectElement, DSSelectProps>(
  ({ options, error, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
DSSelect.displayName = 'DSSelect';

export interface DSTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const DSTextarea = React.forwardRef<HTMLTextAreaElement, DSTextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
            : 'border-slate-200 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
    );
  }
);
DSTextarea.displayName = 'DSTextarea';

export interface DSAutosaveIndicatorProps {
  status: 'saved' | 'saving' | 'draft' | 'error';
  lastSavedAt?: string;
  className?: string;
}

export const DSAutosaveIndicator: React.FC<DSAutosaveIndicatorProps> = ({
  status,
  lastSavedAt,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center space-x-1.5 text-[10px] font-mono font-semibold ${className}`}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
          <span className="text-indigo-600 dark:text-indigo-400">Autosaving changes...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-slate-500">
            {lastSavedAt ? `Saved at ${lastSavedAt}` : 'All changes saved'}
          </span>
        </>
      )}
      {status === 'draft' && (
        <span className="text-amber-600 dark:text-amber-400">Unsaved Draft</span>
      )}
      {status === 'error' && (
        <span className="text-rose-600 dark:text-rose-400">Autosave Failed</span>
      )}
    </div>
  );
};
