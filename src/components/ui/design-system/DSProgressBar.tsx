import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface DSProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DSProgressBar: React.FC<DSProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'indigo',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono text-[10px]">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full ${sizes[size]} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`h-full transition-all duration-300 rounded-full ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface DSStepIndicatorProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export const DSStepIndicator: React.FC<DSStepIndicatorProps> = ({
  steps,
  currentStepIndex,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs ring-4 ring-indigo-100 dark:ring-indigo-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="hidden sm:block">
                <h5 className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {step.title}
                </h5>
                {step.description && <p className="text-[10px] text-slate-400">{step.description}</p>}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 transition-colors ${
                  idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
