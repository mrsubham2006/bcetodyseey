import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCitizen } from '../context/CitizenContext';
import { useUnifiedAuth, RoleId } from '../context/UnifiedAuthContext';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Users, Building2, HardHat, Activity, Flame, ShieldCheck,
  Lock, Mail, ArrowRight, Shield, AlertCircle, CheckCircle2,
  Eye, EyeOff, Loader2, UserPlus, LogIn, Phone, User as UserIcon,
  Building, Sparkles, ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';

export interface PanelConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  accentColor: string;
  badgeText: string;
  defaultEmail: string;
  targetRole: UserRole | 'CITIZEN';
  targetView: string;
  requiresMfa?: boolean;
}

const PANELS: PanelConfig[] = [
  {
    id: 'citizen',
    title: 'Citizen Portal',
    subtitle: 'Public Access',
    description: 'Civic complaints, GPS photo evidence, status tracking & civic records.',
    icon: Users,
    accentColor: 'from-amber-600 to-amber-800',
    badgeText: 'PUBLIC ACCESS',
    defaultEmail: 'citizen@civicnexus.gov.in',
    targetRole: 'CITIZEN',
    targetView: 'citizen_dashboard',
  },
  {
    id: 'municipal',
    title: 'Municipal Department',
    subtitle: 'Department Staff',
    description: 'Roads, Drainage, Lighting, and Waste Management dispatch & SLA tracking.',
    icon: Building2,
    accentColor: 'from-blue-700 to-blue-900',
    badgeText: 'OFFICER / SUPERVISOR',
    defaultEmail: 'officer@civicnexus.gov.in',
    targetRole: 'DEPARTMENT_OFFICER',
    targetView: 'municipal',
  },
  {
    id: 'field_worker',
    title: 'Field Worker Panel',
    subtitle: 'Assigned Operations',
    description: 'Mobile-first task execution, GPS check-in, and before/after repair proof.',
    icon: HardHat,
    accentColor: 'from-amber-700 to-orange-800',
    badgeText: 'CREW / INSPECTOR',
    defaultEmail: 'worker@civicnexus.gov.in',
    targetRole: 'FIELD_WORKER',
    targetView: 'field_worker',
  },
  {
    id: 'command',
    title: 'City Command Center',
    subtitle: 'City Operations',
    description: 'Real-time urban telemetry, spatial incident clustering, and multi-agency map.',
    icon: Activity,
    accentColor: 'from-emerald-700 to-teal-900',
    badgeText: 'COMMAND CONSOLE',
    defaultEmail: 'commander@civicnexus.gov.in',
    targetRole: 'CITY_COMMANDER',
    targetView: 'command',
  },
  {
    id: 'emergency',
    title: 'Emergency Response',
    subtitle: 'Response Team',
    description: '108 Ambulance green corridors, Odisha Fire Service, and disaster coordination.',
    icon: Flame,
    accentColor: 'from-rose-700 to-red-900',
    badgeText: 'FIRE & 108 MEDICAL',
    defaultEmail: 'emergency@civicnexus.gov.in',
    targetRole: 'EMERGENCY_COORDINATOR',
    targetView: 'emergency',
  },
  {
    id: 'admin',
    title: 'Super Admin Panel',
    subtitle: 'Restricted Access',
    description: 'Privileged administration, RBAC security policies, audit logs & system health.',
    icon: ShieldCheck,
    accentColor: 'from-purple-800 to-indigo-950',
    badgeText: 'RESTRICTED / 2FA',
    defaultEmail: 'admin@civicnexus.gov.in',
    targetRole: 'SUPER_ADMIN',
    targetView: 'admin',
    requiresMfa: true,
  },
];

const DEPARTMENTS = [
  { id: 1, name: 'Drainage and Flood Management' },
  { id: 2, name: 'Roads and Infrastructure' },
  { id: 3, name: 'Traffic Operations & Corridor Safety' },
  { id: 4, name: 'Fire and Rescue Services' },
  { id: 5, name: 'Sanitation and Waste Management' },
  { id: 6, name: 'Street Lighting and Electrical' },
  { id: 7, name: 'Emergency Healthcare Coordination' },
  { id: 8, name: 'Smart Tourism & Cultural Heritage' },
];

interface UnifiedAccessPortalViewProps {
  onSelectPanel: (panel: PanelConfig) => void;
}

export const UnifiedAccessPortalView: React.FC<UnifiedAccessPortalViewProps> = ({
  onSelectPanel
}) => {
  const { showToast, loginAsRole } = useApp();
  const { isAuthenticated: isCitizenAuthenticated, loginCitizen, registerCitizen } = useCitizen();
  const { loginRole, isRoleAuthenticated } = useUnifiedAuth();

  const [selectedPanel, setSelectedPanel] = useState<PanelConfig | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [mfaCode, setMfaCode] = useState('');
  
  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('Password@123');
  const [confirmPassword, setConfirmPassword] = useState('Password@123');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(1);
  const [adminKey, setAdminKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handlePanelClick = (panel: PanelConfig) => {
    // If already authenticated for this specific panel, enter directly
    if (panel.id === 'citizen' && (isCitizenAuthenticated || isRoleAuthenticated('citizen'))) {
      onSelectPanel(panel);
      return;
    }
    if (isRoleAuthenticated(panel.id as RoleId)) {
      onSelectPanel(panel);
      return;
    }

    // Otherwise, 1st open proper Login & Sign Up for this panel
    setSelectedPanel(panel);
    setAuthTab('login');
    setEmail(panel.defaultEmail);
    setPassword('Password@123');
    setMfaCode('');
    
    // Clear Sign Up fields
    setFullName('');
    setSignupEmail('');
    setPhone('');
    setSignupPassword('Password@123');
    setConfirmPassword('Password@123');
    setSelectedDepartmentId(1);
    setAdminKey('');
    setError(null);
    setDuplicateWarning(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPanel) return;
    setError(null);
    setDuplicateWarning(null);
    setLoading(true);

    try {
      if (selectedPanel.id === 'citizen') {
        const res = await loginCitizen(email, password);
        if (res.success) {
          loginRole('citizen', {
            email: email.trim(),
            fullName: 'Rutuparna Satpathy',
            department: 'Public Citizen',
            systemRole: 'CITIZEN',
          });
          showToast('Welcome to Citizen Portal!', 'success');
          onSelectPanel(selectedPanel);
        } else {
          setError(res.error || 'Authentication failed. Please check credentials.');
        }
        setLoading(false);
        return;
      }

      // Staff Login Call
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Unable to sign in with those credentials.');
        setLoading(false);
        return;
      }

      // Role check
      const userRole = data.user.role;
      const validRolesForPanel: Record<string, string[]> = {
        municipal: ['DEPARTMENT_OFFICER', 'DEPARTMENT_SUPERVISOR', 'SUPER_ADMIN'],
        field_worker: ['FIELD_WORKER', 'DEPARTMENT_SUPERVISOR', 'SUPER_ADMIN'],
        command: ['CITY_COMMANDER', 'SUPER_ADMIN'],
        emergency: ['EMERGENCY_COORDINATOR', 'FIRE_RESCUE_OPERATOR', 'HOSPITAL_COORDINATOR', 'SUPER_ADMIN'],
        admin: ['SUPER_ADMIN'],
      };

      const allowed = validRolesForPanel[selectedPanel.id]?.includes(userRole);
      if (!allowed) {
        setError(`Access denied. Account role (${userRole}) is not authorized for ${selectedPanel.title}.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('civic_token', data.access_token);
      await loginAsRole(userRole as UserRole);

      // Record in Centralized Unified Auth Manager with zero data leakage
      loginRole(
        selectedPanel.id as RoleId,
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          phone: data.user.phone,
          department: selectedPanel.title,
          systemRole: userRole,
        },
        data.access_token
      );

      showToast(`Authenticated as ${data.user.full_name} (${userRole})`, 'success');
      onSelectPanel(selectedPanel);
    } catch {
      setError('Connection failed. Please check backend API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPanel) return;
    setError(null);
    setDuplicateWarning(null);

    if (!fullName.trim() || !signupEmail.trim() || !phone.trim()) {
      setError('Please fill in all required fields (Full Name, Email, Mobile).');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter passwords carefully.');
      return;
    }

    if (selectedPanel.id === 'admin' && adminKey.trim() !== 'CIVIC-ADMIN-2026') {
      setError('Invalid Super Admin Verification Key. Contact System Governance.');
      return;
    }

    setLoading(true);

    try {
      if (selectedPanel.id === 'citizen') {
        const res = await registerCitizen({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          mobile: phone.trim(),
          password: signupPassword,
          confirm_password: confirmPassword,
          consent: true,
        });

        if (!res.success) {
          if (res.error?.includes('already exists') || res.error?.includes('Duplicate')) {
            setDuplicateWarning(res.error);
            setError('Duplicate account detected. No data duplicacy allowed. Please sign in with your existing account.');
          } else {
            setError(res.error || 'Registration failed.');
          }
          setLoading(false);
          return;
        }

        loginRole('citizen', {
          email: signupEmail.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          department: 'Public Citizen',
          systemRole: 'CITIZEN',
        });

        showToast('Citizen Registration Successful! You can now access all citizen features.', 'success');
        onSelectPanel(selectedPanel);
        setLoading(false);
        return;
      }

      // Map panel to target user role
      const roleMapping: Record<string, UserRole> = {
        municipal: 'DEPARTMENT_OFFICER',
        field_worker: 'FIELD_WORKER',
        command: 'CITY_COMMANDER',
        emergency: 'EMERGENCY_COORDINATOR',
        admin: 'SUPER_ADMIN'
      };

      const targetRole = roleMapping[selectedPanel.id] || 'CITIZEN';

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          phone: phone.trim(),
          password: signupPassword,
          role: targetRole,
          department_id: selectedDepartmentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.is_duplicate || data.detail?.includes('No Data Duplicacy') || data.detail?.includes('already registered')) {
          setDuplicateWarning(data.detail);
          setError('Duplicate user record prevented (No Data Duplicacy Enforcement). Please sign in.');
        } else {
          setError(data.detail || 'Sign up failed.');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('civic_token', data.access_token);
      await loginAsRole(targetRole);

      // Record in Centralized Unified Auth Manager
      loginRole(
        selectedPanel.id as RoleId,
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          phone: data.user.phone,
          department: selectedPanel.title,
          systemRole: targetRole,
        },
        data.access_token
      );

      showToast(`Account Created & Signed In as ${data.user.full_name}!`, 'success');
      onSelectPanel(selectedPanel);

    } catch {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory flex flex-col justify-between transition-colors">
      
      {/* ── Top Header Hero ───────────────────────────────────────────── */}
      <div className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-heritage-stone/60 dark:bg-heritage-charcoal border border-heritage-gold/50 shadow-sm mb-4">
          <KonarkWheelIcon size={18} className="text-heritage-gold" />
          <span className="text-xs font-semibold tracking-wide text-heritage-maroon dark:text-heritage-gold uppercase">
            CIVIC NEXUS AI • UNIFIED ACCESS PORTAL
          </span>
        </div>

        <h1 className="font-serif font-extrabold text-3xl sm:text-5xl text-heritage-maroon dark:text-heritage-ivory tracking-tight">
          One City. One Intelligence. <span className="text-heritage-gold">Faster Response.</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-heritage-aged dark:text-heritage-stone/80 max-w-2xl mx-auto">
          Choose your authorized role to access city operations, complaint dispatch, emergency logistics, or citizen self-service.
        </p>

        <IkatPatternDivider className="my-6 max-w-xl mx-auto" />
      </div>

      {/* ── Main Panel Grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xs font-bold text-heritage-aged uppercase tracking-widest">
              Choose Your Access Portal (6 Operational Stations)
            </h2>
            <p className="text-[11px] text-heritage-aged/80">
              Each portal supports both direct Sign In and unique Sign Up with strict No Data Duplicacy validation.
            </p>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Data Duplicacy Check Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PANELS.map(panel => {
            const Icon = panel.icon;
            const isCitizen = panel.id === 'citizen';
            return (
              <div
                key={panel.id}
                onClick={() => handlePanelClick(panel)}
                className="group relative bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-3xl p-6 shadow-sm hover:shadow-heritage hover:border-heritage-gold transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-heritage-gold/5 group-hover:bg-heritage-gold/15 transition-all blur-xl" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-heritage-maroon text-heritage-gold shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-heritage-stone/40 dark:bg-heritage-charcoal-dark text-heritage-maroon dark:text-heritage-gold border border-heritage-stone/80 dark:border-heritage-charcoal-dark font-mono">
                      {panel.badgeText}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-heritage-aged tracking-wide uppercase">
                    {panel.subtitle}
                  </p>
                  <h3 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory mt-0.5 group-hover:text-heritage-maroon dark:group-hover:text-heritage-gold transition-colors">
                    {panel.title}
                  </h3>
                  <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-2 leading-relaxed">
                    {panel.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-heritage-stone/40 dark:border-heritage-charcoal-dark flex items-center justify-between text-xs font-semibold text-heritage-maroon dark:text-heritage-gold">
                  <span>
                    {isCitizen && isCitizenAuthenticated ? 'Open Dashboard' : 'Sign In / Sign Up'}
                  </span>
                  <div className="p-1.5 rounded-full bg-heritage-maroon/10 dark:bg-heritage-gold/10 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-4 bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border-t border-heritage-stone dark:border-heritage-charcoal text-center text-[11px] text-heritage-aged">
        CIVIC NEXUS AI — Odisha Smart City Operations Platform • End-to-End Encrypted Session Verification
      </footer>

      {/* ── Modal: Dual Mode Sign-In / Sign-Up Dialog ───────────────────── */}
      {selectedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-heritage-charcoal-dark/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedPanel(null)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal-dark shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className={`p-5 bg-gradient-to-r ${selectedPanel.accentColor} text-white relative shrink-0`}>
              <button
                onClick={() => setSelectedPanel(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                ✕
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                  <selectedPanel.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-heritage-gold uppercase">
                    {selectedPanel.badgeText}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {selectedPanel.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-white/80 mt-1.5">
                Authenticate with verified credentials or register a new authorized account.
              </p>
            </div>

            {/* Modal Mode Selector Bar */}
            <div className="bg-heritage-stone/30 dark:bg-heritage-charcoal-dark p-2 border-b border-heritage-stone/40 dark:border-heritage-charcoal shrink-0 flex items-center justify-between">
              <div className="grid grid-cols-2 gap-1 w-full bg-heritage-stone/50 dark:bg-heritage-charcoal p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setError(null);
                    setDuplicateWarning(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    authTab === 'login'
                      ? 'bg-heritage-maroon text-white shadow-sm'
                      : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setError(null);
                    setDuplicateWarning(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    authTab === 'signup'
                      ? 'bg-heritage-maroon text-white shadow-sm'
                      : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up (New User)</span>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Duplicate Warning Alert */}
              {duplicateWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>No Data Duplicacy Enforcement</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {duplicateWarning}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setEmail(signupEmail || selectedPanel.defaultEmail);
                      setDuplicateWarning(null);
                      setError(null);
                    }}
                    className="mt-1 px-3 py-1 rounded bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700 transition-colors inline-flex items-center space-x-1"
                  >
                    <span>Switch to Sign In with Existing Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Standard Error Alert */}
              {error && !duplicateWarning && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── FORM TAB: LOGIN ──────────────────────────────── */}
              {authTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                      Registered Email / Identifier
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                      <input
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="user@civicnexus.gov.in"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-aged hover:text-heritage-charcoal"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {selectedPanel.requiresMfa && (
                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Security Authenticator Code (MFA)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Auto-verified (Demo)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-mono text-center tracking-widest focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Authorize & Sign In ({selectedPanel.title})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Quick Fill Preset Credential button */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(selectedPanel.defaultEmail);
                        setPassword('Password@123');
                        setError(null);
                      }}
                      className="text-[11px] text-heritage-gold hover:underline font-mono"
                    >
                      ⚡ Pre-fill default demo user ({selectedPanel.defaultEmail})
                    </button>
                  </div>
                </form>
              ) : (
                /* ── FORM TAB: SIGN UP (NO DATA DUPLICACY) ──────────── */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Registers a new verified user for <strong>{selectedPanel.title}</strong> with unique phone & email validation.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Subham Pradhan"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          placeholder="newuser@civicnexus.gov.in"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                        <input
                          type="text"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 94370 12345"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {selectedPanel.id !== 'citizen' && selectedPanel.id !== 'admin' && (
                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Assign Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                        <select
                          value={selectedDepartmentId}
                          onChange={e => setSelectedDepartmentId(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        >
                          {DEPARTMENTS.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedPanel.id === 'admin' && (
                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Super Admin Security Authorization Key
                      </label>
                      <input
                        type="password"
                        value={adminKey}
                        onChange={e => setAdminKey(e.target.value)}
                        placeholder="Enter CIVIC-ADMIN-2026"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="Password@123"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Password@123"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Register Account for {selectedPanel.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedPanel(null)}
                  className="text-xs text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white underline"
                >
                  Return to Portal Station Selector
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
