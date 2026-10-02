import React from 'react';
import { AlertCircle, RefreshCw, FolderOpen } from 'lucide-react';
import { DSButton } from './DSButton';

export interface DSAvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

export const DSAvatar: React.FC<DSAvatarProps> = ({
  name = 'User',
  src,
  size = 'md',
  isOnline,
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeStyles = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeStyles[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border border-indigo-500 shadow-xs uppercase font-mono`}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};

export interface DSEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const DSEmptyState: React.FC<DSEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center max-w-md mx-auto my-4 space-y-3 ${className}`}>
      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-xs">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export interface DSLoadingSkeletonProps {
  variant?: 'card' | 'table' | 'text' | 'avatar';
  count?: number;
  className?: string;
}

export const DSLoadingSkeleton: React.FC<DSLoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-full" />
      ))}
    </div>
  );
};

export interface DSErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const DSErrorState: React.FC<DSErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-center max-w-md mx-auto my-4 space-y-3 ${className}`}>
      <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
      <h3 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">{title}</h3>
      <p className="text-xs text-rose-700 dark:text-rose-300">{message}</p>
      {onRetry && (
        <DSButton
          variant="danger"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </DSButton>
      )}
    </div>
  );
};
