import React, { useEffect, useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Package, 
  CheckSquare, 
  Bell, 
  Plus, 
  RefreshCw, 
  ArrowUpRight,
  Activity,
  UserPlus,
  Sliders
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateSubtab: (subtab: 'users' | 'roles' | 'modules' | 'settings' | 'audit') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSubtab }) => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sitesync_access_token');
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await safeJson(res);
      if (json?.success) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = dashboardData?.kpi || {
    totalEmployees: 5,
    activeProjects: 2,
    totalUsers: 5,
    totalVehicles: 1,
    totalEquipment: 2,
    totalMaterials: 3,
    pendingApprovals: 14,
    totalNotifications: 28,
  };

  const recentAuditLogs = dashboardData?.recentAuditLogs || [
    { id: '1', action: 'USER_LOGIN', userEmail: 'admin@sitesyncpro.com', module: 'Authentication', details: 'Successful session initialization', createdAt: new Date().toISOString() },
    { id: '2', action: 'ROLE_UPDATED', userEmail: 'admin@sitesyncpro.com', module: 'Administration', details: 'Updated Project Manager permission matrix', createdAt: new Date().toISOString() },
    { id: '3', action: 'STOCK_RESTOCKED', userEmail: 'store@sitesyncpro.com', module: 'Store Logistics', details: 'Issued batch A1 carbon steel pipes', createdAt: new Date().toISOString() },
  ];

  const userRolesBreakdown = dashboardData?.userRolesBreakdown || [
    { role: 'System Administrator', count: 1 },
    { role: 'Project Manager', count: 1 },
    { role: 'Site Incharge', count: 1 },
    { role: 'Store Keeper', count: 1 },
    { role: 'Machinery Operator', count: 1 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600/30 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/40 uppercase tracking-wide">
                Enterprise Administration
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4 Core Security Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight">System Control Center</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage global users, database permissions, ERP module registry, organizational settings, and security audit logs across all site locations.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              onClick={() => onNavigateSubtab('users')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Employees</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.totalEmployees}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% Active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.activeProjects}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Live Execution</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.totalUsers}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">JWT Secured</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.pendingApprovals}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Action Needed</span>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <span>Quick Administrative Actions</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateSubtab('users')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group text-center"
          >
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">User Management</span>
            <span className="text-[10px] text-slate-500 mt-0.5">CRUD & Passwords</span>
          </button>

          <button
            onClick={() => onNavigateSubtab('roles')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition group text-center"
          >
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Role Permissions Matrix</span>
            <span className="text-[10px] text-slate-500 mt-0.5">8 System Roles</span>
          </button>

          <button
            onClick={() => onNavigateSubtab('modules')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition group text-center"
          >
            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">ERP Module Registry</span>
            <span className="text-[10px] text-slate-500 mt-0.5">7 Core Modules</span>
          </button>

          <button
            onClick={() => onNavigateSubtab('audit')}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition group text-center"
          >
            <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Security Audit Logs</span>
            <span className="text-[10px] text-slate-500 mt-0.5">System Activity</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: User Roles & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Roles Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Role Allocation Breakdown</span>
              </h3>
              <button
                onClick={() => onNavigateSubtab('roles')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>View Permission Matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {userRolesBreakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.role}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {item.count} User{item.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Enforced via database RBAC rules</span>
            <span className="font-mono text-[10px]">Prisma Schema Backed</span>
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Recent Security Audit Trail</span>
            </h3>
            <button
              onClick={() => onNavigateSubtab('audit')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAuditLogs.map((log: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-400">({log.module})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{log.details}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{log.userEmail}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
