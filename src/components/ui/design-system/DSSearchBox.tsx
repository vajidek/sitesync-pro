import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, MoreVertical } from 'lucide-react';

export interface DSSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const DSSearchBox: React.FC<DSSearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export interface FilterItem {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

export interface DSFilterBarProps {
  filters: FilterItem[];
  onFilterChange: (id: string, value: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export const DSFilterBar: React.FC<DSFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  className = '',
}) => {
  const hasActiveFilters = filters.some((f) => f.value && f.value !== 'ALL');

  return (
    <div className={`flex flex-wrap items-center gap-2 py-1 ${className}`}>
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold mr-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>Filters:</span>
      </div>

      {filters.map((filter) => (
        <select
          key={filter.id}
          value={filter.value}
          onChange={(e) => onFilterChange(filter.id, e.target.value)}
          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All {filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && onClearAll && (
        <button
          onClick={onClearAll}
          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-500 hover:underline"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface DSActionMenuProps {
  items: MenuItem[];
  align?: 'left' | 'right';
  triggerIcon?: React.ReactNode;
  className?: string;
}

export const DSActionMenu: React.FC<DSActionMenuProps> = ({
  items,
  align = 'right',
  triggerIcon,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
      >
        {triggerIcon || <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
