/**
 * Site Sync Pro - Enterprise Design System Tokens
 * Phase 23 UI Foundation
 */

export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0284c7',
      600: '#0284c7',
      700: '#0369a1',
      900: '#0c4a6e',
    },
    indigo: {
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    }
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',      // 16px
    6: '1.5rem',   // 24px
    8: '2rem',      // 32px
    12: '3rem',    // 48px
  },
  radii: {
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }
} as const;

export type StatusType = 
  | 'DRAFT'
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'DELAYED'
  | 'CRITICAL'
  | 'SUCCESS'
  | 'HEALTHY'
  | 'OFFLINE'
  | 'DEGRADED';

export const STATUS_TOKEN_MAP: Record<StatusType, {
  label: string;
  bgLight: string;
  textLight: string;
  bgDark: string;
  textDark: string;
  dotColor: string;
}> = {
  DRAFT: {
    label: 'Draft',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-700',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-300',
    dotColor: 'bg-slate-400',
  },
  PENDING: {
    label: 'Pending',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    bgDark: 'dark:bg-amber-950/70',
    textDark: 'dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  SUBMITTED: {
    label: 'Submitted',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-800',
    bgDark: 'dark:bg-blue-950/70',
    textDark: 'dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  APPROVED: {
    label: 'Approved',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-800',
    bgDark: 'dark:bg-rose-950/70',
    textDark: 'dark:text-rose-300',
    dotColor: 'bg-rose-500',
  },
  COMPLETED: {
    label: 'Completed',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-600',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-400',
    dotColor: 'bg-slate-500',
  },
  OVERDUE: {
    label: 'Overdue',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-800',
    bgDark: 'dark:bg-rose-950/70',
    textDark: 'dark:text-rose-300',
    dotColor: 'bg-rose-600',
  },
  DELAYED: {
    label: 'Delayed',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    bgDark: 'dark:bg-amber-950/70',
    textDark: 'dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    bgLight: 'bg-rose-100',
    textLight: 'text-rose-900',
    bgDark: 'dark:bg-rose-950',
    textDark: 'dark:text-rose-200',
    dotColor: 'bg-rose-600',
  },
  SUCCESS: {
    label: 'Success',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  HEALTHY: {
    label: 'Healthy',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    bgDark: 'dark:bg-emerald-950/70',
    textDark: 'dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  OFFLINE: {
    label: 'Offline',
    bgLight: 'bg-slate-100',
    textLight: 'text-slate-600',
    bgDark: 'dark:bg-slate-800',
    textDark: 'dark:text-slate-400',
    dotColor: 'bg-slate-400',
  },
  DEGRADED: {
    label: 'Degraded',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    bgDark: 'dark:bg-amber-950/70',
    textDark: 'dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
};
