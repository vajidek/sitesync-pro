import React from 'react';
import { Loader2 } from 'lucide-react';

export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const DSButton: React.FC<DSButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-xs focus:ring-indigo-500',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-transparent focus:ring-slate-400',
    outline: 'bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-indigo-500',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border-transparent shadow-xs focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-xs focus:ring-emerald-500',
  };

  const sizeStyles = {
    xs: 'px-2 py-1 text-[10px] rounded-md gap-1 font-semibold',
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 font-semibold',
    md: 'px-4 py-2 text-xs rounded-xl gap-2 font-bold',
    lg: 'px-5 py-2.5 text-sm rounded-xl gap-2.5 font-bold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 focus:outline-hidden focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
