import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, AuthorizedWorkspace, UserProfile } from '../../types';
import { ROLE_CONFIG } from '../../data/mockData';
import { 
  Building2, 
  X, 
  Shield, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertCircle,
  Briefcase,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, canClose }) => {
  const { loginWithUserId, switchRole, logoutAllDevices, isAuthenticated, user } = useAuth();
  const allowDismiss = canClose !== undefined ? canClose : isAuthenticated;

  // Form State
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('sitesync_remember_userid') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem('sitesync_remember_userid'));
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Workflow Mode: 'login' (credentials) | 'select_workspace' (post-auth multi-role) | 'forgot' (assistance)
  const [mode, setMode] = useState<'login' | 'select_workspace' | 'forgot'>('login');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<AuthorizedWorkspace[]>([]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && allowDismiss && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allowDismiss, onClose]);

  if (!isOpen) return null;

  // Handle standard credential authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setLoginError('Please enter both User ID / Email and Password.');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    const result = await loginWithUserId(userId.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (result.success && result.user) {
      const workspaces = result.user.authorizedWorkspaces || [];
      // Multi-Role Resolution: If authenticated user possesses multiple legitimate workspaces, present selection
      if (workspaces.length > 1) {
        setPendingUser(result.user);
        setAvailableWorkspaces(workspaces);
        setMode('select_workspace');
      } else {
        // Single role: Proceed directly into assigned dashboard
        onClose();
      }
    } else {
      setLoginError(result.error || 'User ID or password is incorrect.');
    }
  };

  // Handle choosing a specific authorized workspace post-authentication
  const handleSelectWorkspace = async (workspace: AuthorizedWorkspace) => {
    setIsSubmitting(true);
    try {
      await switchRole(workspace.role);
      onClose();
    } catch (err: any) {
      setLoginError('Failed to initialize selected workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={() => {
        if (allowDismiss && mode !== 'select_workspace') onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#0B192C] text-white p-6 relative">
          {allowDismiss && mode !== 'select_workspace' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  SiteSync Pro
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'login' && 'Construction & Infrastructure Project Management Platform'}
                {mode === 'select_workspace' && 'Authorized Workspace Session Setup'}
                {mode === 'forgot' && 'Corporate Password Assistance'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* 1. Post-Authentication Multi-Role Workspace Selection */}
          {mode === 'select_workspace' && pendingUser && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 text-xs">
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  Welcome back, {pendingUser.name}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                  {pendingUser.department || 'Operations'} • Select your operational workspace for this session:
                </p>
              </div>

              <div className="space-y-2.5">
                {availableWorkspaces.map((ws) => (
                  <button
                    key={ws.role}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectWorkspace(ws)}
                    className="w-full p-4 rounded-xl text-left border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-700 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {ws.label}
                        </span>
                        {ws.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {ws.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {ws.description}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-600 text-slate-600 dark:text-slate-300 group-hover:text-white transition flex items-center justify-center shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Forgot Password Assistance */}
          {mode === 'forgot' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                  <Shield className="w-5 h-5" />
                  <span>Corporate Security Policy</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed">
                  If you have forgotten your password or your account is locked, please contact your System Administrator or HR Department.
                </p>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  Per SiteSync Pro Enterprise Security Compliance, self-service email resets are governed by corporate identity administration to prevent credential harvesting and account enumeration attacks.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Standard Login Form (No Pre-selected Roles) */}
          {mode === 'login' && (
            <>
              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    User ID or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      autoComplete="username"
                      placeholder="Enter your User ID or Email"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-medium">Remember User ID</span>
                  </label>

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={async () => {
                        await logoutAllDevices();
                        onClose();
                      }}
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout All Devices
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Footer Branding */}
          <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              SiteSync Pro Enterprise • Designed & Developed by Abdul Vajid EK
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
