import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserPermissions } from '../types';
import { ROLE_CONFIG } from '../data/mockData';
import { clearStoredAuthTokens, getStoredAccessToken, getStoredRefreshToken, setStoredAuthTokens } from '../lib/authStorage';

const EMPTY_PERMISSIONS: UserPermissions = {
  canViewFinancials: false,
  canApprovePO: false,
  canApprovePR: false,
  canEditProjectBudget: false,
  canManageUsers: false,
  canExportReports: false,
  canCreateWorkOrders: false,
  canManageInventory: false,
  canManageFleet: false,
  canSignOffQAQC: false,
  canManageHSE: false,
};

function resolveUiPermissions(apiPermissions: unknown): UserPermissions {
  if (!apiPermissions || typeof apiPermissions !== 'object' || Array.isArray(apiPermissions)) {
    return { ...EMPTY_PERMISSIONS };
  }
  return { ...EMPTY_PERMISSIONS, ...(apiPermissions as Partial<UserPermissions>) };
}

function isDemoClientMode(): boolean {
  return import.meta.env.DEV || String(import.meta.env.VITE_APP_ENVIRONMENT || '').toUpperCase() === 'DEMO';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  idleTimeoutMinutes: number;
  setIdleTimeoutMinutes: (mins: number) => void;
  switchRole: (role: UserRole) => Promise<void>;
  login: (userIdOrEmail: string, role?: UserRole, password?: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  loginWithUserId: (userId: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  clearForcePasswordChangeFlag: () => void;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasApiPermission: (permCode: string) => boolean;
  dbPermissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Canonical token access; legacy aliases are migrated once by authStorage.
export const getActiveStoredToken = (): string => getStoredAccessToken();

const safeJsonResponse = async (r: Response) => {
  try {
    const t = await r.text();
    return t ? JSON.parse(t) : {};
  } catch {
    return {};
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const access = getStoredAccessToken();
    const refresh = getStoredRefreshToken();
    return access && refresh ? { accessToken: access, refreshToken: refresh } : access ? { accessToken: access, refreshToken: '' } : null;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dbPermissions, setDbPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getActiveStoredToken()));
  const [error, setError] = useState<string | null>(null);

  const [idleTimeoutMinutes, setIdleTimeoutMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('sitesync_idle_timeout_mins');
    return saved ? parseInt(saved, 10) : 30;
  });

  const setIdleTimeoutMinutes = (mins: number) => {
    setIdleTimeoutMinutesState(mins);
    localStorage.setItem('sitesync_idle_timeout_mins', mins.toString());
  };

  // Purge authentication state without touching unrelated ERP browser storage.
  const clearAuthState = () => {
    clearStoredAuthTokens();
    sessionStorage.removeItem('sitesync_session');
    setTokens(null);
    setUser(null);
    setActiveRole(null);
    setDbPermissions([]);
    setIsAuthenticated(false);
  };

  // Persist only the canonical transport token pair.
  useEffect(() => {
    if (tokens) {
      setStoredAuthTokens(tokens.accessToken, tokens.refreshToken);
    } else {
      clearStoredAuthTokens();
    }
  }, [tokens]);

  // Idle timeout activity listener for session security
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivityTime = Date.now();
    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const maxIdleMs = idleTimeoutMinutes * 60 * 1000;
      if (Date.now() - lastActivityTime > maxIdleMs) {
        console.warn(`[Enterprise Security] Session timed out after ${idleTimeoutMinutes} minutes of inactivity.`);
        logout();
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, idleTimeoutMinutes]);

  // Never trust persisted browser role state. Revalidate the access token with the server.
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const accessToken = tokens?.accessToken;
      if (!accessToken) {
        setIsAuthenticated(false);
        setUser(null);
        setActiveRole(null);
        setDbPermissions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await safeJsonResponse(res);

        if (res.ok && json.success && json.data) {
          const apiUser = json.data;
          setActiveRole(apiUser.role);
          setDbPermissions(Array.isArray(apiUser.permissions) ? apiUser.permissions : []);
          setUser({
            id: apiUser.id,
            username: apiUser.username,
            employeeId: apiUser.employeeId,
            name: apiUser.name,
            email: apiUser.email,
            role: apiUser.role,
            accountStatus: apiUser.accountStatus || 'ACTIVE',
            forcePasswordChange: Boolean(apiUser.forcePasswordChange),
            passwordLastChangedAt: apiUser.passwordLastChangedAt,
            lastLoginAt: apiUser.lastLoginAt,
            lastLogoutAt: apiUser.lastLogoutAt,
            avatarUrl: apiUser.avatarUrl || undefined,
            department: apiUser.department || '',
            phone: apiUser.phone || undefined,
            assignedProjectId: apiUser.assignedProjectId,
            assignedProjectName: apiUser.assignedProjectName,
            permissions: resolveUiPermissions(apiUser.uiPermissions ?? apiUser.permissions),
            authorizedWorkspaces: apiUser.authorizedWorkspaces,
          });
          setIsAuthenticated(true);
          return;
        }

        if (tokens.refreshToken) {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });
          const refreshJson = await safeJsonResponse(refreshRes);
          if (refreshRes.ok && refreshJson.success && refreshJson.data?.accessToken) {
            setTokens({
              accessToken: refreshJson.data.accessToken,
              refreshToken: refreshJson.data.refreshToken || tokens.refreshToken,
            });
            return;
          }
        }

        clearAuthState();
      } catch (err) {
        console.warn('Session validation failed; keeping user signed out until the server is reachable.', err);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [tokens?.accessToken]);
  const switchRole = async (role: UserRole) => {
    if (!isDemoClientMode()) {
      setError('Role switching is available only in DEMO/development. Production roles are server-assigned.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `${role.toLowerCase()}@sitesyncpro.com`, password: 'Password123!', role }),
      });
      const json = await safeJsonResponse(res);
      if (!res.ok || !json.success || !json.data?.accessToken || !json.data?.user) {
        throw new Error(json.error || 'DEMO role switch was rejected by the authentication service.');
      }
      const u = json.data.user;
      setTokens({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken || '' });
      setActiveRole(u.role);
      setDbPermissions(Array.isArray(u.permissions) ? u.permissions : []);
      setUser({
        id: u.id,
        username: u.username,
        employeeId: u.employeeId,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || '',
        phone: u.phone || undefined,
        assignedProjectId: u.assignedProjectId,
        assignedProjectName: u.assignedProjectName,
        permissions: resolveUiPermissions(u.uiPermissions ?? u.permissions),
        authorizedWorkspaces: u.authorizedWorkspaces,
      });
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to switch DEMO role.');
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (userIdOrEmail: string, role?: UserRole, password?: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const effectivePassword = password || (isDemoClientMode() ? 'Password123!' : '');
    if (!effectivePassword) {
      const message = 'Password is required.';
      setError(message);
      return { success: false, error: message };
    }
    return loginWithUserId(userIdOrEmail, effectivePassword, true);
  };

  const loginWithUserId = async (userId: string, password: string, rememberMe = false): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    setIsLoading(true);
    setError(null);

    if (rememberMe) {
      localStorage.setItem('sitesync_remember_userid', userId);
    } else {
      localStorage.removeItem('sitesync_remember_userid');
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, rememberMe }),
      });
      const json = await safeJsonResponse(res);
      if (json.success && json.data) {
        const uData = json.data.user;
        const profile: UserProfile = {
          id: uData.id,
          username: uData.username || userId,
          employeeId: uData.employeeId,
          name: uData.name,
          email: uData.email,
          role: uData.role,
          accountStatus: uData.accountStatus || 'ACTIVE',
          forcePasswordChange: Boolean(uData.forcePasswordChange),
          passwordLastChangedAt: uData.passwordLastChangedAt,
          lastLoginAt: uData.lastLoginAt,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          department: uData.department || '',
          phone: uData.phone || undefined,
          assignedProjectId: uData.assignedProjectId,
          assignedProjectName: uData.assignedProjectName,
          permissions: resolveUiPermissions(uData.uiPermissions ?? uData.permissions),
          authorizedWorkspaces: uData.authorizedWorkspaces,
        };

        setTokens({
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        });
        setActiveRole(uData.role);
        setDbPermissions(uData.permissions || []);
        setUser(profile);
        setIsAuthenticated(true);
        return { success: true, user: profile };
      } else {
        const errStr = json.error || 'Invalid User ID or Password';
        setError(errStr);
        return { success: false, error: errStr };
      }
    } catch (err: any) {
      const errStr = err.message || 'Login request error';
      setError(errStr);
      return { success: false, error: errStr };
    } finally {
      setIsLoading(false);
    }
  };

  const clearForcePasswordChangeFlag = () => {
    if (user) {
      setUser({ ...user, forcePasswordChange: false });
    }
  };

  const logout = async () => {
    if (tokens?.accessToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch (err) {
        console.warn('Logout API warning:', err);
      }
    }
    clearAuthState();
  };

  const logoutAllDevices = async () => {
    if (tokens?.accessToken) {
      try {
        await fetch('/api/auth/logout-all', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
      } catch (err) {
        console.warn('Logout all API error:', err);
      }
    }
    clearAuthState();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!tokens?.accessToken) {
      return { success: false, message: 'Unauthenticated. Token missing.' };
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await safeJsonResponse(res);
      if (json.success) {
        setTokens(null);
        setIsAuthenticated(false);
        return { success: true, message: json.message || 'Password updated. Please log in.' };
      }
      return { success: false, message: json.error || 'Password change failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    return Boolean(user.permissions[permission]);
  };

  const hasApiPermission = (permCode: string): boolean => {
    return dbPermissions.includes(permCode) || activeRole === 'ADMIN';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated,
        tokens,
        isLoading,
        error,
        idleTimeoutMinutes,
        setIdleTimeoutMinutes,
        switchRole,
        login,
        loginWithUserId,
        logout,
        logoutAllDevices,
        changePassword,
        clearForcePasswordChangeFlag,
        hasPermission,
        hasApiPermission,
        dbPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
