import React from 'react';
import { Bell, CheckCheck, ShieldAlert, Cpu, HeartPulse, DollarSign, Wrench } from 'lucide-react';
import { DSDrawer, DSBadge, DSButton, DSEmptyState } from '../ui/design-system';
import { useShell } from './ShellContext';

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  SYSTEM: <Cpu className="w-4 h-4 text-cyan-500" />,
  WORKFLOW: <Wrench className="w-4 h-4 text-blue-500" />,
  SAFETY: <HeartPulse className="w-4 h-4 text-rose-500" />,
  FINANCE: <DollarSign className="w-4 h-4 text-emerald-500" />,
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useShell();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DSDrawer isOpen={isOpen} onClose={onClose} title="Enterprise Event & System Alerts" position="right">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-white">Live Event Log</span>
            {unreadCount > 0 && <DSBadge variant="danger" size="xs">{unreadCount} Unread</DSBadge>}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <DSEmptyState
            title="No Notifications"
            description="You are caught up on all system notifications and alerts."
            icon={<Bell className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start space-x-3 ${
                  !n.isRead
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/60'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs shrink-0 mt-0.5">
                  {CATEGORY_ICONS[n.category] || <ShieldAlert className="w-4 h-4 text-amber-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className={`text-xs ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'} truncate`}>
                      {n.title}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DSDrawer>
  );
};
