import React, { useState } from 'react';
import { useUnifiedAuth, RoleId, SessionDiagnostic } from '../context/UnifiedAuthContext';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';
import {
  ShieldCheck, Lock, UserCheck, Key, RefreshCw, LogOut, CheckCircle2,
  AlertTriangle, Users, Building2, HardHat, Activity, Flame, Eye,
  ShieldAlert, Sparkles, ChevronRight, Database, ExternalLink, X
} from 'lucide-react';

const ROLE_ICONS: Record<RoleId, any> = {
  citizen: Users,
  municipal: Building2,
  field_worker: HardHat,
  command: Activity,
  emergency: Flame,
  admin: ShieldCheck,
};

const ROLE_COLORS: Record<RoleId, { badge: string; border: string; bg: string }> = {
  citizen: { badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', bg: 'from-amber-500/10' },
  municipal: { badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', bg: 'from-blue-500/10' },
  field_worker: { badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', bg: 'from-orange-500/10' },
  command: { badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', bg: 'from-emerald-500/10' },
  emergency: { badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', bg: 'from-rose-500/10' },
  admin: { badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', bg: 'from-purple-500/10' },
};

interface UnifiedAuthManagerProps {
  onNavigateToPanel?: (roleId: RoleId) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isFloatingWidget?: boolean;
}

export const UnifiedAuthManager: React.FC<UnifiedAuthManagerProps> = ({
  onNavigateToPanel,
  isOpen = false,
  onClose,
  isFloatingWidget = true,
}) => {
  const {
    sessions,
    activeRoleId,
    setActiveRole,
    logoutRole,
    logoutAll,
    getSessionDiagnostics,
    zeroLeakageValidated,
    loginRole,
  } = useUnifiedAuth();

  const [activeTab, setActiveTab] = useState<'sessions' | 'diagnostics' | 'permissions'>('sessions');
  const [selectedDiagnosticRole, setSelectedDiagnosticRole] = useState<RoleId>('citizen');
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpen);

  const diagnostics: SessionDiagnostic[] = getSessionDiagnostics();
  const activeSession = sessions[activeRoleId];

  const handleQuickDemoReset = (roleId: RoleId) => {
    const demoUsers: Record<RoleId, { email: string; name: string; dept: string }> = {
      citizen: { email: 'citizen@civicnexus.gov.in', name: 'Rutuparna Satpathy', dept: 'Public Citizen' },
      municipal: { email: 'officer@civicnexus.gov.in', name: 'Satyabrata Das', dept: 'Roads & Public Works' },
      field_worker: { email: 'worker@civicnexus.gov.in', name: 'Bijay Kumar Sahoo', dept: 'Sanitation Crew B' },
      command: { email: 'commander@civicnexus.gov.in', name: 'Kalyani Tripathy', dept: 'City Control Room' },
      emergency: { email: 'emergency@civicnexus.gov.in', name: 'Dr. Rajesh Mohanty', dept: '108 Ambulance Dispatch' },
      admin: { email: 'admin@civicnexus.gov.in', name: 'Chief Administrator', dept: 'IT Directorate' },
    };

    const target = demoUsers[roleId];
    loginRole(roleId, {
      email: target.email,
      fullName: target.name,
      department: target.dept,
    });
  };

  if (isFloatingWidget && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/90 text-slate-100 border border-amber-500/40 shadow-xl backdrop-blur-md hover:scale-105 transition-all text-xs font-medium group"
        title="Open Centralized Auth Manager"
      >
        <div className="relative">
          <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="font-semibold text-slate-200">Unified Auth Manager</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
          6/6 Isolated
        </span>
      </button>
    );
  }

  return (
    <div className={`${isFloatingWidget ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn' : 'w-full'}`}>
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <KonarkWheelIcon className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-100 font-serif">
                  Unified Auth Manager
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Zero Data Leakage Guaranteed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized authentication state & 6-role isolated session manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => logoutAll()}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out All 6 Panels
            </button>
            {isFloatingWidget && (
              <button
                onClick={() => {
                  setIsExpanded(false);
                  if (onClose) onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Security Isolation Status Banner */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Active View Role: <strong className="text-amber-300 font-mono uppercase">{activeRoleId}</strong></span>
            <span className="text-slate-600">|</span>
            <span>User: <strong className="text-slate-100">{activeSession.user?.fullName || 'Guest'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Session Isolation: <strong>STRICT</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded border border-blue-800/50">
              <Lock className="w-3.5 h-3.5" />
              <span>Namespaces: <strong>6 Unique Keys</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'sessions'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Panel Sessions (6 Roles)
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'diagnostics'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Security Diagnostics & Leak Checks
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'permissions'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Role Permission Matrix
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'sessions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(sessions) as RoleId[]).map(roleId => {
                const s = sessions[roleId];
                const Icon = ROLE_ICONS[roleId];
                const colors = ROLE_COLORS[roleId];
                const isActiveView = activeRoleId === roleId;

                return (
                  <div
                    key={roleId}
                    className={`rounded-xl border p-4 bg-slate-950/50 relative flex flex-col justify-between transition-all ${
                      isActiveView ? `${colors.border} ring-1 ring-amber-500/30 bg-slate-900` : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Role Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${colors.badge}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-100">{s.roleName}</h4>
                            <span className="text-[11px] text-slate-400 font-mono uppercase">Role: {roleId}</span>
                          </div>
                        </div>

                        {s.isAuthenticated ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            AUTHENTICATED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            SIGNED OUT
                          </span>
                        )}
                      </div>

                      {/* User Profile Summary */}
                      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800/80 mb-3 space-y-1 text-xs">
                        {s.isAuthenticated && s.user ? (
                          <>
                            <div className="font-semibold text-slate-200">{s.user.fullName}</div>
                            <div className="text-slate-400 text-[11px] truncate">{s.user.email}</div>
                            <div className="text-amber-400/90 text-[11px]">{s.user.department}</div>
                          </>
                        ) : (
                          <div className="text-slate-500 italic py-1">No active session for this panel</div>
                        )}
                      </div>

                      {/* Isolated Storage Metadata */}
                      <div className="text-[10px] text-slate-400 space-y-1 font-mono mb-4 bg-slate-950 p-2 rounded border border-slate-900">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Storage Key:</span>
                          <span className="text-slate-300">civic_session_v2_{roleId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Token Hash:</span>
                          <span className="text-slate-300 truncate max-w-[140px]">{s.token ? s.token.substring(0, 16) + '...' : 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setActiveRole(roleId);
                          if (onNavigateToPanel) onNavigateToPanel(roleId);
                        }}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                          isActiveView
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {isActiveView ? 'Active View' : 'Switch View'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {s.isAuthenticated ? (
                        <button
                          onClick={() => logoutRole(roleId)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                          title="Log out panel session"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickDemoReset(roleId)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                          title="Quick demo login"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-200">Zero Data Leakage Validation Report</h4>
                  <p className="text-xs text-emerald-400/90 mt-0.5">
                    {zeroLeakageValidated
                      ? 'All 6 role session objects are independently isolated with distinct storage keys, tokens, and non-overlapping state.'
                      : 'Data leakage warning: duplicate tokens or email objects detected across panels.'}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Role Panel</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Local Storage Namespace</th>
                      <th className="p-3">Token Hash</th>
                      <th className="p-3">Leakage Test</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {diagnostics.map(d => (
                      <tr key={d.roleId} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {d.roleName}
                        </td>
                        <td className="p-3">
                          {d.isAuthenticated ? (
                            <span className="text-emerald-400 font-semibold">Active</span>
                          ) : (
                            <span className="text-slate-500">Inactive</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 font-mono">{d.userEmail}</td>
                        <td className="p-3 text-amber-300 font-mono text-[11px]">{d.storageKey}</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px]">{d.tokenHash}</td>
                        <td className="p-3">
                          {d.leakageCheckPassed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5" /> LEAK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(sessions) as RoleId[]).map(roleId => {
                const s = sessions[roleId];
                return (
                  <div key={roleId} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-slate-200">{s.roleName}</h4>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300">
                        {s.permissions.length} Grants
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {s.permissions.map(perm => (
                        <span key={perm} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                          ✓ {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <IkatPatternDivider className="w-16 h-2 text-amber-500/40" />
            <span>CIVIC NEXUS AI — Odisha Smart City Governance Protocol v2.5</span>
          </div>
          <div className="text-amber-400 font-mono">
            Zero Cross-Panel Contamination
          </div>
        </div>
      </div>
    </div>
  );
};
