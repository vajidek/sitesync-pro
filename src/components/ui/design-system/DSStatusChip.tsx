import React from 'react';
import { STATUS_TOKEN_MAP, StatusType } from './tokens';

export interface DSStatusChipProps {
  status: StatusType | string;
  customLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const DSStatusChip: React.FC<DSStatusChipProps> = ({
  status,
  customLabel,
  size = 'sm',
  showDot = true,
  className = '',
}) => {
  const normalizedStatus = (status || '').toUpperCase() as StatusType;
  const token = STATUS_TOKEN_MAP[normalizedStatus] || {
    label: customLabel || status || 'Unknown',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-700',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-300',
    dotColor: 'bg-slate-400',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1 font-bold',
    sm: 'px-2.5 py-0.5 text-[10px] gap-1.5 font-bold',
    md: 'px-3 py-1 text-xs gap-2 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-sans tracking-wide whitespace-nowrap transition-colors ${token.bgLight} ${token.textLight} ${token.bgDark} ${token.textDark} ${sizeStyles[size]} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${token.dotColor}`}
        />
      )}
      <span>{customLabel || token.label}</span>
    </span>
  );
};

export interface DSBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const DSBadge: React.FC<DSBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-transparent',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.2 text-[9px] font-bold rounded',
    sm: 'px-2 py-0.5 text-[10px] font-bold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  };

  return (
    <span className={`inline-flex items-center justify-center font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
