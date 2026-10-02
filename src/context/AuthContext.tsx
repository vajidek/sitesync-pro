import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserPermissions } from '../types';
import { ROLE_CONFIG } from '../data/mockData';

const DEFAULT_PERMISSIONS: UserPermissions = {
  canViewFinancials: true,
  canApprovePO: true,
  canApprovePR: true,
  canEditProjectBudget: true,
  canManageUsers: true,
  canExportReports: true,
  canCreateWorkOrders: true,
  canManageInventory: true,
  canManageFleet: true,
  canSignOffQAQC: true,
  canManageHSE: true,
};

const getRoleDefaultUserProfile = (role: UserRole): UserProfile => ({
  id: `usr-${role.toLowerCase()}`,
  name: `${ROLE_CONFIG[role]?.label || role} User`,
  email: `${role.toLowerCase()}@sitesyncpro.com`,
  role,
  avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
  department: 'Operations & Site Engineering',
  phone: '+971 50 123 4567',
  assignedProjectId: 'prj_01',
  assignedProjectName: 'Peruvannamuzhi WTP Project',
  permissions: DEFAULT_PERMISSIONS,
});

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

const STORAGE_KEY_ROLE = 'sitesync_active_role';
const STORAGE_KEY_ACCESS = 'sitesync_jwt_access_token';
const STORAGE_KEY_REFRESH = 'sitesync_jwt_refresh_token';

// Centralized helper to get active auth token from any recognized storage key
export const getActiveStoredToken = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY_ACCESS) ||
    localStorage.getItem('sitesync_access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
};

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
    const access = getActiveStoredToken();
    const refresh =
      localStorage.getItem(STORAGE_KEY_REFRESH) ||
      localStorage.getItem('sitesync_refresh_token') ||
      localStorage.getItem('refreshToken');
    return access && refresh ? { accessToken: access, refreshToken: refresh } : access ? { accessToken: access, refreshToken: '' } : null;
  });

  const [activeRole, setActiveRole] = useState<UserRole | null>(() => {
    const access = getActiveStoredToken();
    const saved = localStorage.getItem(STORAGE_KEY_ROLE) || localStorage.getItem('sitesync_role');
    if (access && saved) {
      return saved as UserRole;
    }
    return access ? 'ADMIN' : null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const access = getActiveStoredToken();
    const saved = localStorage.getItem(STORAGE_KEY_ROLE) || localStorage.getItem('sitesync_role');
    if (access) {
      return getRoleDefaultUserProfile((saved as UserRole) || 'ADMIN');
    }
    return null;
  });

  const [dbPermissions, setDbPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const access = getActiveStoredToken();
    return Boolean(access);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [idleTimeoutMinutes, setIdleTimeoutMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('sitesync_idle_timeout_mins');
    return saved ? parseInt(saved, 10) : 30;
  });

  const setIdleTimeoutMinutes = (mins: number) => {
    setIdleTimeoutMinutesState(mins);
    localStorage.setItem('sitesync_idle_timeout_mins', mins.toString());
  };

  // Helper to completely purge authentication state
  const clearAuthState = () => {
    const rememberedUserId = localStorage.getItem('sitesync_remember_userid');
    const idleMins = localStorage.getItem('sitesync_idle_timeout_mins');
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    if (rememberedUserId) {
      localStorage.setItem('sitesync_remember_userid', rememberedUserId);
    }
    if (idleMins) {
      localStorage.setItem('sitesync_idle_timeout_mins', idleMins);
    }

    setTokens(null);
    setUser(null);
    setActiveRole(null);
    setDbPermissions([]);
    setIsAuthenticated(false);
  };

  // Sync token state to LocalStorage with all common alias keys
  useEffect(() => {
    if (tokens) {
      localStorage.setItem(STORAGE_KEY_ACCESS, tokens.accessToken);
      localStorage.setItem('sitesync_access_token', tokens.accessToken);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken);
      localStorage.setItem('sitesync_refresh_token', tokens.refreshToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACCESS);
      localStorage.removeItem('sitesync_access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem(STORAGE_KEY_REFRESH);
      localStorage.removeItem('sitesync_refresh_token');
      localStorage.removeItem('refreshToken');
    }
  }, [tokens]);

  // Sync active role state to LocalStorage
  useEffect(() => {
    if (activeRole) {
      localStorage.setItem(STORAGE_KEY_ROLE, activeRole);
      localStorage.setItem('sitesync_role', activeRole);
    } else {
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem('sitesync_role');
    }
  }, [activeRole]);

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

  // Attempt backend profile check on load if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!tokens?.accessToken) {
        setIsAuthenticated(false);
        setUser(null);
        setActiveRole(null);
        return;
      }
      if (tokens.accessToken.startsWith('OFFLINE_DEMO_TOKEN')) {
        setIsLoading(false);
        setIsAuthenticated(true);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        const json = await safeJsonResponse(res);
        if (json.success && json.data) {
          const apiUser = json.data;
          setActiveRole(apiUser.role);
          setDbPermissions(apiUser.permissions || []);
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
            avatarUrl: apiUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            department: apiUser.department || 'Operations',
            phone: apiUser.phone || '+971 50 123 4567',
            assignedProjectId: apiUser.assignedProjectId,
            assignedProjectName: apiUser.assignedProjectName,
            permissions: DEFAULT_PERMISSIONS,
          });
          setIsAuthenticated(true);
        } else if (tokens.refreshToken) {
          // Token expired, try refreshing
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });
          const refreshJson = await safeJsonResponse(refreshRes);
          if (refreshJson.success && refreshJson.data) {
            setTokens({
              accessToken: refreshJson.data.accessToken,
              refreshToken: refreshJson.data.refreshToken,
            });
          } else {
            clearAuthState();
          }
        } else {
          clearAuthState();
        }
      } catch (err) {
        console.warn('Backend API connection fallback to offline mode:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [tokens?.accessToken]);

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call real login endpoint with role & standard password
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${role.toLowerCase()}@sitesyncpro.com`,
          password: 'Password123!',
          role,
        }),
      });
      const json = await safeJsonResponse(res);
      if (json.success && json.data) {
        setTokens({
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        });
        setActiveRole(role);
        setDbPermissions(json.data.user.permissions || []);
        setUser({
          id: json.data.user.id,
          name: json.data.user.name,
          email: json.data.user.email,
          role: json.data.user.role,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          department: json.data.user.department,
          phone: json.data.user.phone,
          assignedProjectId: json.data.user.assignedProjectId,
          assignedProjectName: json.data.user.assignedProjectName,
          permissions: DEFAULT_PERMISSIONS,
        });
        setIsAuthenticated(true);
      } else {
        // Fallback to offline role profile with offline demo token
        const offlineToken = `OFFLINE_DEMO_TOKEN_${role}`;
        setTokens({ accessToken: offlineToken, refreshToken: offlineToken });
        setActiveRole(role);
        setUser(getRoleDefaultUserProfile(role));
        setIsAuthenticated(true);
      }
    } catch {
      const offlineToken = `OFFLINE_DEMO_TOKEN_${role}`;
      setTokens({ accessToken: offlineToken, refreshToken: offlineToken });
      setActiveRole(role);
      setUser(getRoleDefaultUserProfile(role));
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userIdOrEmail: string, role?: UserRole, password = 'Password123!'): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    return loginWithUserId(userIdOrEmail, password, true);
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
          department: uData.department || 'Operations',
          phone: uData.phone || '+971 50 123 4567',
          assignedProjectId: uData.assignedProjectId,
          assignedProjectName: uData.assignedProjectName,
          permissions: DEFAULT_PERMISSIONS,
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
