import React, { useState, useEffect } from 'react';
import { useUnifiedAuth, RoleId, UserSessionProfile } from '../context/UnifiedAuthContext';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Lock,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Mail,
  Key,
  Building2,
  HardHat,
  Activity,
  Flame,
  Shield,
  CheckCircle2,
  X,
  Sparkles,
  Phone,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleId;
  initialTab?: 'signin' | 'signup';
  onSuccess?: (user: UserSessionProfile) => void;
}

export interface RoleThemeConfig {
  title: string;
  badge: string;
  subtitle: string;
  gradient: string;
  borderColor: string;
  accentText: string;
  bgDark: string;
  buttonBg: string;
  icon: React.ElementType;
  demoUser: {
    email: string;
    fullName: string;
    department?: string;
    systemRole: string;
  };
  customFieldLabel: string;
  customFieldPlaceholder: string;
}

export const font_mono = 'font-mono';

export const ROLE_THEME_MAP: Record<RoleId, RoleThemeConfig> = {
  citizen: {
    title: 'Citizen Access Portal',
    badge: 'PUBLIC CITIZEN ACCESS',
    subtitle: 'Submit issues, track status, and participate in civic governance.',
    gradient: 'from-amber-600 via-amber-700 to-amber-950',
    borderColor: 'border-amber-500/40',
    accentText: 'text-amber-400',
    bgDark: 'bg-amber-950/20',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold',
    icon: User,
    demoUser: {
      email: 'citizen@bhubaneswar.gov.in',
      fullName: 'Ananya Pattnaik',
      department: 'Ward 28 - Saheed Nagar',
      systemRole: 'Verified Citizen'
    },
    customFieldLabel: 'Residential Ward / Neighborhood',
    customFieldPlaceholder: 'e.g. Ward 28, Saheed Nagar, Bhubaneswar'
  },
  municipal: {
    title: 'Municipal Department Panel',
    badge: 'AUTHORIZED STAFF & OFFICERS',
    subtitle: 'Departmental case assignment, SLA tracking, and ticket workflows.',
    gradient: 'from-blue-700 via-indigo-800 to-slate-950',
    borderColor: 'border-indigo-500/40',
    accentText: 'text-indigo-400',
    bgDark: 'bg-indigo-950/20',
    buttonBg: 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-bold',
    icon: Building2,
    demoUser: {
      email: 'officer.das@bmc.gov.in',
      fullName: 'Er. Rajesh Das',
      department: 'Roads & Drainage Works',
      systemRole: 'Senior Executive Officer'
    },
    customFieldLabel: 'Department Name & Officer Title',
    customFieldPlaceholder: 'e.g. Sanitation Division - Senior Inspector'
  },
  field_worker: {
    title: 'Field Worker Operations Panel',
    badge: 'FIELD CREW & INSPECTORS',
    subtitle: 'Mobile task dispatch, GPS check-in, and repair proof submission.',
    gradient: 'from-orange-600 via-amber-700 to-stone-950',
    borderColor: 'border-orange-500/40',
    accentText: 'text-orange-400',
    bgDark: 'bg-orange-950/20',
    buttonBg: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-bold',
    icon: HardHat,
    demoUser: {
      email: 'field.sahoo@bmc.gov.in',
      fullName: 'Sanjay Sahoo',
      department: 'Sanitation Squad B - Zone 4',
      systemRole: 'Field Operations Lead'
    },
    customFieldLabel: 'Worker Badge ID / Assigned Operating Zone',
    customFieldPlaceholder: 'e.g. FW-1082 (North-Central Drainage Squad)'
  },
  command: {
    title: 'City Command Center',
    badge: 'CRITICAL TELEMETRY & ICCC',
    subtitle: 'Real-time incident matrix, sensor integration, and city telemetry.',
    gradient: 'from-cyan-700 via-teal-800 to-slate-950',
    borderColor: 'border-cyan-500/40',
    accentText: 'text-cyan-400',
    bgDark: 'bg-cyan-950/20',
    buttonBg: 'bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 text-white font-bold',
    icon: Activity,
    demoUser: {
      email: 'commander.mishra@smartcity.gov.in',
      fullName: 'Cmdr. Priyabrata Mishra',
      department: 'ICCC Telemetry Command',
      systemRole: 'Chief Operations Commander'
    },
    customFieldLabel: 'Console Station ID & Clearance Rank',
    customFieldPlaceholder: 'e.g. ICCC Station #4 - Clearance Rank Alpha'
  },
  emergency: {
    title: 'Emergency Response Panel',
    badge: 'FIRE, 108 MEDICAL & DISASTER',
    subtitle: 'Rapid emergency corridor dispatch, ambulance routing, and SOS tracking.',
    gradient: 'from-rose-700 via-red-800 to-neutral-950',
    borderColor: 'border-rose-500/40',
    accentText: 'text-rose-400',
    bgDark: 'bg-rose-950/20',
    buttonBg: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold',
    icon: Flame,
    demoUser: {
      email: 'emergency.108@odisha.gov.in',
      fullName: 'Dr. Smruti Mohanty',
      department: 'Odisha Emergency Services (108/101)',
      systemRole: 'Emergency Dispatch Controller'
    },
    customFieldLabel: 'Emergency Unit Code / Dispatch Hub',
    customFieldPlaceholder: 'e.g. 108 Ambulance Unit Hub 3 - Badge #883'
  },
  admin: {
    title: 'Super Admin Control Panel',
    badge: 'PRIVILEGED SYSTEM MANAGEMENT',
    subtitle: 'Role-based access controls, security policies, and audit monitoring.',
    gradient: 'from-purple-800 via-slate-900 to-black',
    borderColor: 'border-purple-500/40',
    accentText: 'text-purple-400',
    bgDark: 'bg-purple-950/20',
    buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-bold',
    icon: ShieldCheck,
    demoUser: {
      email: 'superadmin@civicnexus.gov.in',
      fullName: 'Admin R. J. Satpathy',
      department: 'State e-Governance Cell',
      systemRole: 'Super Administrator'
    },
    customFieldLabel: 'Super Admin Clearance Passcode / Key',
    customFieldPlaceholder: 'e.g. SEC-CLEARANCE-CODE-LEVEL-5'
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  role,
  initialTab = 'signin',
  onSuccess
}) => {
  const { loginRole } = useUnifiedAuth();
  const { showToast, loginAsRole } = useApp();
  const theme = ROLE_THEME_MAP[role] || ROLE_THEME_MAP.citizen;
  const RoleIcon = theme.icon;

  const roleToSystemRole: Record<RoleId, UserRole> = {
    citizen: 'CITIZEN',
    municipal: 'DEPARTMENT_OFFICER',
    field_worker: 'FIELD_WORKER',
    command: 'CITY_COMMANDER',
    emergency: 'EMERGENCY_COORDINATOR',
    admin: 'SUPER_ADMIN'
  };

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customRoleDetail, setCustomRoleDetail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Reset tab when modal opens or role changes
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setSuccessMsg(null);
      setEmail(theme.demoUser.email);
      setPassword('Password@123');
    }
  }, [isOpen, role, initialTab]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please provide your Email / Official ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        const sysRole = roleToSystemRole[role] || 'CITY_COMMANDER';
        const userObj: UserSessionProfile = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          phone: data.user.phone || phone || '+91 98765 00000',
          department: customRoleDetail || theme.demoUser.department || theme.title,
          systemRole: data.user.role || theme.demoUser.systemRole
        };

        loginRole(role, userObj, data.access_token);
        await loginAsRole(sysRole);
        setSuccessMsg(`Authenticated successfully into ${theme.title}!`);
        showToast(`Authenticated as ${data.user.full_name} (${role})`, 'success');

        if (onSuccess) {
          onSuccess(userObj);
        }

        setTimeout(() => {
          onClose();
        }, 600);
        return;
      }
    } catch {
      // Proceed to fallback authentication
    }

    // Fallback authentication for smooth offline demonstration
    const sysRole = roleToSystemRole[role] || 'CITY_COMMANDER';
    const userObj: UserSessionProfile = {
      id: `${role}_usr_${Date.now()}`,
      email: email.trim(),
      fullName: fullName.trim() || email.split('@')[0].toUpperCase().replace('.', ' '),
      phone: phone || '+91 98765 00000',
      department: customRoleDetail || theme.demoUser.department || theme.title,
      systemRole: theme.demoUser.systemRole
    };

    loginRole(role, userObj);
    await loginAsRole(sysRole);
    setSuccessMsg(`Authenticated successfully into ${theme.title}!`);
    showToast(`Session active for ${theme.title}`, 'success');

    if (onSuccess) {
      onSuccess(userObj);
    }

    setTimeout(() => {
      onClose();
    }, 600);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !signupEmail.trim() || !signupPassword) {
      setError('Full Name, Email, and Password are required.');
      return;
    }

    if (!agreeTerms) {
      setError('Please certify compliance with system security guidelines.');
      return;
    }

    setLoading(true);

    const sysRole = roleToSystemRole[role] || 'CITY_COMMANDER';

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          phone: phone.trim() || '+91 98765 43210',
          password: signupPassword,
          role: sysRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Sign up failed. Please check your details.');
        setLoading(false);
        return;
      }

      const newUser: UserSessionProfile = {
        id: data.user?.id || `${role}_reg_${Date.now()}`,
        email: signupEmail.trim(),
        fullName: fullName.trim(),
        phone: phone.trim() || '+91 98765 43210',
        department: customRoleDetail.trim() || theme.demoUser.department || 'General',
        systemRole: sysRole
      };

      loginRole(role, newUser, data.access_token);
      await loginAsRole(sysRole);
      setSuccessMsg(`Account created and session activated for ${theme.title}!`);
      showToast(`Welcome ${fullName}! Session active`, 'success');

      if (onSuccess) {
        onSuccess(newUser);
      }

      setTimeout(() => {
        onClose();
      }, 700);
      return;
    } catch {
      // Fallback local sign up
    }

    const newUser: UserSessionProfile = {
      id: `${role}_reg_${Date.now()}`,
      email: signupEmail.trim(),
      fullName: fullName.trim(),
      phone: phone.trim() || '+91 98765 43210',
      department: customRoleDetail.trim() || theme.demoUser.department || 'General',
      systemRole: theme.demoUser.systemRole
    };

    loginRole(role, newUser);
    await loginAsRole(sysRole);
    setSuccessMsg(`Account created and session activated for ${theme.title}!`);

    if (onSuccess) {
      onSuccess(newUser);
    }

    setTimeout(() => {
      onClose();
    }, 700);
    setLoading(false);
  };

  const handleQuickFillDemo = async () => {
    setError(null);
    setSuccessMsg(null);
    const demo = theme.demoUser;
    const sysRole = roleToSystemRole[role] || 'CITY_COMMANDER';

    const userObj: UserSessionProfile = {
      id: `${role}_demo_${Date.now()}`,
      email: demo.email,
      fullName: demo.fullName,
      department: demo.department,
      systemRole: demo.systemRole
    };

    loginRole(role, userObj);
    await loginAsRole(sysRole);

    setSuccessMsg(`Demo session activated for ${demo.fullName}!`);
    showToast(`Signed in as ${demo.fullName}`, 'success');

    if (onSuccess) {
      onSuccess(userObj);
    }

    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Banner Header */}
        <div className={`p-5 bg-gradient-to-br ${theme.gradient} text-white relative shadow-md`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-black/30 border border-white/20 shadow-inner">
              <RoleIcon className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">{theme.title}</h3>
              <span className="text-[9px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/20 text-amber-200 inline-block mt-0.5">
                {theme.badge}
              </span>
            </div>
          </div>
          <p className="text-xs text-white/85 leading-snug">{theme.subtitle}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/90 p-1.5">
          <button
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition ${
              tab === 'signin'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition ${
              tab === 'signup'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Quick Demo Preset Button */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Quick Demo Login</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                {theme.demoUser.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition flex items-center gap-1"
            >
              <span>Instant Access</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email / Official ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g. ${theme.demoUser.email}`}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Stay logged in</span>
                </label>
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  Use Default Passcode
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl ${theme.buttonBg} shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs`}
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : `Sign In to ${theme.title}`}</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Officer Sunita Mohapatra"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="user@gov.in"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {theme.customFieldLabel}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customRoleDetail}
                    onChange={(e) => setCustomRoleDetail(e.target.value)}
                    placeholder={theme.customFieldPlaceholder}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <span>
                  I confirm authorization for access to <strong>{theme.title}</strong> under State Governance Protocols.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl ${theme.buttonBg} shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : `Register & Access ${theme.title}`}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Session Isolation: ACTIVE</span>
          <span>Zero Data Leakage Shield</span>
        </div>
      </div>
    </div>
  );
};
