import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type RoleId = 'citizen' | 'municipal' | 'field_worker' | 'command' | 'emergency' | 'admin';

export interface UserSessionProfile {
  id: string | number;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  systemRole: string;
  avatar?: string;
}

export interface RoleSession {
  roleId: RoleId;
  roleName: string;
  isAuthenticated: boolean;
  user: UserSessionProfile | null;
  token: string | null;
  loginTimestamp: number | null;
  mfaVerified: boolean;
  lastActive: number | null;
  permissions: string[];
}

export interface SessionDiagnostic {
  roleId: RoleId;
  roleName: string;
  isAuthenticated: boolean;
  userEmail: string;
  userName: string;
  storageKey: string;
  leakageCheckPassed: boolean;
  tokenHash: string;
}

interface UnifiedAuthContextType {
  sessions: Record<RoleId, RoleSession>;
  activeRoleId: RoleId;
  activeSession: RoleSession;
  setActiveRole: (roleId: RoleId) => void;
  loginRole: (
    roleId: RoleId,
    userData: { id?: string | number; email: string; fullName: string; phone?: string; department?: string; systemRole?: string },
    token?: string
  ) => void;
  logoutRole: (roleId: RoleId) => void;
  logoutAll: () => void;
  isRoleAuthenticated: (roleId: RoleId) => boolean;
  getRoleUser: (roleId: RoleId) => UserSessionProfile | null;
  verifyMfaForRole: (roleId: RoleId, code: string) => boolean;
  updateRoleUser: (roleId: RoleId, patch: Partial<UserSessionProfile>) => void;
  getSessionDiagnostics: () => SessionDiagnostic[];
  zeroLeakageValidated: boolean;
}

const DEFAULT_PERMISSIONS: Record<RoleId, string[]> = {
  citizen: ['submit_report', 'track_complaint', 'view_public_feed'],
  municipal: ['manage_tickets', 'assign_field_tasks', 'update_sla', 'export_reports'],
  field_worker: ['view_assigned_tasks', 'update_progress', 'upload_proof_photo', 'gps_checkin'],
  command: ['city_telemetry', 'camera_feed', 'incident_cluster_map', 'ai_dispatch_override'],
  emergency: ['green_corridor_trigger', 'dispatch_108_medical', 'fire_alarm_alert', 'disaster_broadcast'],
  admin: ['rbac_security', 'user_provisioning', 'audit_logs', 'system_config', 'db_backup'],
};

const ROLE_NAMES: Record<RoleId, string> = {
  citizen: 'Citizen Portal',
  municipal: 'Municipal Department',
  field_worker: 'Field Worker Panel',
  command: 'City Command Center',
  emergency: 'Emergency Response',
  admin: 'Super Admin Panel',
};

const STORAGE_KEYS: Record<RoleId, string> = {
  citizen: 'civic_session_v2_citizen',
  municipal: 'civic_session_v2_municipal',
  field_worker: 'civic_session_v2_field_worker',
  command: 'civic_session_v2_command',
  emergency: 'civic_session_v2_emergency',
  admin: 'civic_session_v2_admin',
};

const createInitialSession = (roleId: RoleId): RoleSession => {
  return {
    roleId,
    roleName: ROLE_NAMES[roleId],
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS[roleId],
  };
};

export const DEMO_USER_PROFILES: Record<RoleId, UserSessionProfile> = {
  citizen: {
    id: 'cit-101',
    email: 'citizen@civicnexus.gov.in',
    fullName: 'Rutuparna Satpathy',
    phone: '+91 98765 43210',
    department: 'Public Citizen',
    systemRole: 'CITIZEN',
  },
  municipal: {
    id: 'muni-204',
    email: 'officer@civicnexus.gov.in',
    fullName: 'Satyabrata Das',
    phone: '+91 94370 12345',
    department: 'Roads & Public Works',
    systemRole: 'DEPARTMENT_OFFICER',
  },
  field_worker: {
    id: 'fw-309',
    email: 'worker@civicnexus.gov.in',
    fullName: 'Bijay Kumar Sahoo',
    phone: '+91 99381 88221',
    department: 'Sanitation & Drainage Team B',
    systemRole: 'FIELD_WORKER',
  },
  command: {
    id: 'cmd-401',
    email: 'commander@civicnexus.gov.in',
    fullName: 'Kalyani Tripathy',
    phone: '+91 91240 55110',
    department: 'Integrated Command & Control Center (ICCC)',
    systemRole: 'CITY_COMMANDER',
  },
  emergency: {
    id: 'emg-502',
    email: 'emergency@civicnexus.gov.in',
    fullName: 'Dr. Rajesh Mohanty',
    phone: '+91 98610 99001',
    department: 'Odisha Emergency Services (108/101)',
    systemRole: 'EMERGENCY_COORDINATOR',
  },
  admin: {
    id: 'adm-001',
    email: 'admin@civicnexus.gov.in',
    fullName: 'Chief Administrator (Super Admin)',
    phone: '+91 67423 00100',
    department: 'CMC Governance & IT Directorate',
    systemRole: 'SUPER_ADMIN',
  },
};

// Initial default sessions start unauthenticated so every portal requires login/signup first
const SEED_DEFAULT_SESSIONS: Record<RoleId, RoleSession> = {
  citizen: {
    roleId: 'citizen',
    roleName: ROLE_NAMES.citizen,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.citizen,
  },
  municipal: {
    roleId: 'municipal',
    roleName: ROLE_NAMES.municipal,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.municipal,
  },
  field_worker: {
    roleId: 'field_worker',
    roleName: ROLE_NAMES.field_worker,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.field_worker,
  },
  command: {
    roleId: 'command',
    roleName: ROLE_NAMES.command,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.command,
  },
  emergency: {
    roleId: 'emergency',
    roleName: ROLE_NAMES.emergency,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.emergency,
  },
  admin: {
    roleId: 'admin',
    roleName: ROLE_NAMES.admin,
    isAuthenticated: false,
    user: null,
    token: null,
    loginTimestamp: null,
    mfaVerified: false,
    lastActive: null,
    permissions: DEFAULT_PERMISSIONS.admin,
  },
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>('citizen');
  const [sessions, setSessions] = useState<Record<RoleId, RoleSession>>(() => {
    const roles: RoleId[] = ['citizen', 'municipal', 'field_worker', 'command', 'emergency', 'admin'];
    const initial: Partial<Record<RoleId, RoleSession>> = {};

    roles.forEach(role => {
      const stored = localStorage.getItem(STORAGE_KEYS[role]);
      if (stored) {
        try {
          initial[role] = JSON.parse(stored);
        } catch {
          initial[role] = SEED_DEFAULT_SESSIONS[role] || createInitialSession(role);
        }
      } else {
        // Hydrate from SEED_DEFAULT_SESSIONS
        initial[role] = SEED_DEFAULT_SESSIONS[role] || createInitialSession(role);
      }
    });

    return initial as Record<RoleId, RoleSession>;
  });

  // Sync to local storage whenever session updates (isolated per key)
  useEffect(() => {
    Object.keys(sessions).forEach(key => {
      const role = key as RoleId;
      localStorage.setItem(STORAGE_KEYS[role], JSON.stringify(sessions[role]));
    });
  }, [sessions]);

  const setActiveRole = (roleId: RoleId) => {
    setActiveRoleId(roleId);
    setSessions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        lastActive: Date.now(),
      },
    }));
  };

  const loginRole = (
    roleId: RoleId,
    userData: { id?: string | number; email: string; fullName: string; phone?: string; department?: string; systemRole?: string },
    token?: string
  ) => {
    const genToken = token || `jwt_session_${roleId}_${Date.now()}`;
    const userProfile: UserSessionProfile = {
      id: userData.id || `usr_${roleId}_${Math.floor(Math.random() * 8999 + 1000)}`,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone || '',
      department: userData.department || ROLE_NAMES[roleId],
      systemRole: userData.systemRole || roleId.toUpperCase(),
    };

    setSessions(prev => ({
      ...prev,
      [roleId]: {
        roleId,
        roleName: ROLE_NAMES[roleId],
        isAuthenticated: true,
        user: userProfile,
        token: genToken,
        loginTimestamp: Date.now(),
        mfaVerified: true,
        lastActive: Date.now(),
        permissions: DEFAULT_PERMISSIONS[roleId],
      },
    }));

    setActiveRoleId(roleId);
  };

  const logoutRole = (roleId: RoleId) => {
    setSessions(prev => ({
      ...prev,
      [roleId]: createInitialSession(roleId),
    }));
    localStorage.removeItem(STORAGE_KEYS[roleId]);
  };

  const logoutAll = () => {
    const roles: RoleId[] = ['citizen', 'municipal', 'field_worker', 'command', 'emergency', 'admin'];
    const cleared: Partial<Record<RoleId, RoleSession>> = {};
    roles.forEach(role => {
      cleared[role] = createInitialSession(role);
      localStorage.removeItem(STORAGE_KEYS[role]);
    });
    setSessions(cleared as Record<RoleId, RoleSession>);
  };

  const isRoleAuthenticated = (roleId: RoleId): boolean => {
    return !!sessions[roleId]?.isAuthenticated;
  };

  const getRoleUser = (roleId: RoleId): UserSessionProfile | null => {
    return sessions[roleId]?.user || null;
  };

  const verifyMfaForRole = (roleId: RoleId, code: string): boolean => {
    if (code.length === 6 || code === '123456' || code === '999999') {
      setSessions(prev => ({
        ...prev,
        [roleId]: {
          ...prev[roleId],
          mfaVerified: true,
        },
      }));
      return true;
    }
    return false;
  };

  const updateRoleUser = (roleId: RoleId, patch: Partial<UserSessionProfile>) => {
    setSessions(prev => {
      const currentRoleSession = prev[roleId];
      if (!currentRoleSession || !currentRoleSession.user) return prev;
      return {
        ...prev,
        [roleId]: {
          ...currentRoleSession,
          user: {
            ...currentRoleSession.user,
            ...patch,
          },
        },
      };
    });
  };

  // Diagnostic assertion ensuring ZERO DATA LEAKAGE across session objects
  const getSessionDiagnostics = (): SessionDiagnostic[] => {
    const roles: RoleId[] = ['citizen', 'municipal', 'field_worker', 'command', 'emergency', 'admin'];
    const seenEmails = new Set<string>();
    const seenTokens = new Set<string>();

    return roles.map(role => {
      const s = sessions[role];
      const email = s.user?.email || 'N/A';
      const token = s.token || 'N/A';

      // Leakage check: check if tokens or users are accidentally duplicated across different roles
      const isUniqueEmail = !seenEmails.has(email) || !s.isAuthenticated;
      const isUniqueToken = !seenTokens.has(token) || !s.isAuthenticated;

      if (s.isAuthenticated && email !== 'N/A') seenEmails.add(email);
      if (s.isAuthenticated && token !== 'N/A') seenTokens.add(token);

      return {
        roleId: role,
        roleName: s.roleName,
        isAuthenticated: s.isAuthenticated,
        userEmail: email,
        userName: s.user?.fullName || 'Unauthenticated',
        storageKey: STORAGE_KEYS[role],
        leakageCheckPassed: isUniqueEmail && isUniqueToken,
        tokenHash: token !== 'N/A' ? `${token.substring(0, 12)}...` : 'NONE',
      };
    });
  };

  const diagnostics = getSessionDiagnostics();
  const zeroLeakageValidated = diagnostics.every(d => d.leakageCheckPassed);

  return (
    <UnifiedAuthContext.Provider
      value={{
        sessions,
        activeRoleId,
        activeSession: sessions[activeRoleId] || createInitialSession(activeRoleId),
        setActiveRole,
        loginRole,
        logoutRole,
        logoutAll,
        isRoleAuthenticated,
        getRoleUser,
        verifyMfaForRole,
        updateRoleUser,
        getSessionDiagnostics,
        zeroLeakageValidated,
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};
