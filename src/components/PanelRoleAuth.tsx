import React, { useState } from 'react';
import { useUnifiedAuth, RoleId, UserSessionProfile } from '../context/UnifiedAuthContext';
import { LoginModal } from './LoginModal';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';
import {
  ShieldCheck,
  Lock,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Mail,
  Key,
  Building,
  HardHat,
  Activity,
  AlertTriangle,
  Shield,
  CheckCircle2,
  X,
  Sparkles,
  Phone,
  BadgeAlert,
  ChevronDown,
  UserCheck,
  Briefcase
} from 'lucide-react';

interface PanelRoleAuthProps {
  roleId: RoleId;
  compactHeaderOnly?: boolean;
}

const ROLE_THEMES: Record<RoleId, {
  title: string;
  badge: string;
  gradient: string;
  border: string;
  accentText: string;
  bgDark: string;
  icon: React.ElementType;
  demoUser: { email: string; fullName: string; department?: string; systemRole: string };
  roleSpecificFieldLabel: string;
  roleSpecificFieldPlaceholder: string;
}> = {
  citizen: {
    title: 'Citizen Portal',
    badge: 'PUBLIC ACCESS',
    gradient: 'from-amber-600 via-amber-700 to-amber-900',
    border: 'border-amber-500/40',
    accentText: 'text-amber-400',
    bgDark: 'bg-amber-950/30',
    icon: User,
    demoUser: { email: 'citizen@bhubaneswar.gov.in', fullName: 'Ananya Pattnaik', systemRole: 'Verified Citizen' },
    roleSpecificFieldLabel: 'Ward / Area Sector',
    roleSpecificFieldPlaceholder: 'e.g. Ward 28, Saheed Nagar, Bhubaneswar'
  },
  municipal: {
    title: 'Municipal Department Panel',
    badge: 'AUTHORIZED STAFF',
    gradient: 'from-blue-700 via-indigo-800 to-slate-900',
    border: 'border-indigo-500/40',
    accentText: 'text-indigo-400',
    bgDark: 'bg-indigo-950/30',
    icon: Building,
    demoUser: { email: 'officer.das@bmc.gov.in', fullName: 'Er. Rajesh Das', department: 'Public Works & Sanitation', systemRole: 'Senior Officer' },
    roleSpecificFieldLabel: 'Department & Designation',
    roleSpecificFieldPlaceholder: 'e.g. Public Works - Executive Engineer'
  },
  field_worker: {
    title: 'Field Worker Operations Panel',
    badge: 'FIELD OPERATIONS',
    gradient: 'from-orange-600 via-amber-700 to-zinc-900',
    border: 'border-orange-500/40',
    accentText: 'text-orange-400',
    bgDark: 'bg-orange-950/30',
    icon: HardHat,
    demoUser: { email: 'field.sahoo@bmc.gov.in', fullName: 'Sanjay Sahoo', department: 'Sanitation Quick Response Team', systemRole: 'Field Lead' },
    roleSpecificFieldLabel: 'Assigned Field Zone / Unit ID',
    roleSpecificFieldPlaceholder: 'e.g. Zone 4 - Drainage Squad B'
  },
  command: {
    title: 'City Command Center',
    badge: 'CRITICAL MONITORING',
    gradient: 'from-cyan-700 via-teal-800 to-slate-950',
    border: 'border-cyan-500/40',
    accentText: 'text-cyan-400',
    bgDark: 'bg-cyan-950/30',
    icon: Activity,
    demoUser: { email: 'commander.mishra@smartcity.gov.in', fullName: 'Cmdr. Priyabrata Mishra', department: 'ICTC Command Operations', systemRole: 'Control Officer' },
    roleSpecificFieldLabel: 'Telemetry Station & Clearance Rank',
    roleSpecificFieldPlaceholder: 'e.g. Desk-04, Traffic & Surveillance Rank-I'
  },
  emergency: {
    title: 'Emergency Response Panel',
    badge: 'DISASTER & RESCUE',
    gradient: 'from-rose-700 via-red-800 to-neutral-950',
    border: 'border-rose-500/40',
    accentText: 'text-rose-400',
    bgDark: 'bg-rose-950/30',
    icon: AlertTriangle,
    demoUser: { email: 'emergency.108@odisha.gov.in', fullName: 'Dr. Smruti Mohanty', department: 'Emergency Dispatch & 108 Med', systemRole: 'Chief Controller' },
    roleSpecificFieldLabel: 'Emergency Unit / Badge Service No.',
    roleSpecificFieldPlaceholder: 'e.g. 108 Ambulance Hub Alpha - Badg #883'
  },
  admin: {
    title: 'Super Admin Control Panel',
    badge: 'RESTRICTED PRIVILEGED',
    gradient: 'from-purple-800 via-slate-900 to-black',
    border: 'border-purple-500/40',
    accentText: 'text-purple-400',
    bgDark: 'bg-purple-950/30',
    icon: Shield,
    demoUser: { email: 'superadmin@civicnexus.gov.in', fullName: 'Admin R. J. Satpathy', department: 'State e-Governance Cell', systemRole: 'Super Administrator' },
    roleSpecificFieldLabel: 'Security Key Clearance Code',
    roleSpecificFieldPlaceholder: 'e.g. SEC-CLEARANCE-LEVEL-5'
  }
};

export const PanelRoleAuth: React.FC<PanelRoleAuthProps> = ({ roleId, compactHeaderOnly = false }) => {
  const { sessions, loginRole, logoutRole } = useUnifiedAuth();
  const session = sessions[roleId];
  const theme = ROLE_THEMES[roleId];
  const IconComponent = theme.icon;

  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showDropdown, setShowDropdown] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCustomField, setRoleCustomField] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email || !password) {
      setFormError('Please fill in both Email/ID and Password.');
      return;
    }

    // Process login for this specific role
    loginRole(roleId, {
      id: `${roleId}_${Date.now()}`,
      email: email,
      fullName: email.split('@')[0].toUpperCase().replace('.', ' '),
      systemRole: theme.demoUser.systemRole,
      department: theme.demoUser.department || 'Operations',
    });

    setFormSuccess(`Successfully authenticated into ${theme.title}!`);
    setTimeout(() => {
      setIsOpen(false);
      setFormSuccess('');
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!fullName || !email || !password) {
      setFormError('Full Name, Email, and Password are required.');
      return;
    }

    if (!termsAccepted) {
      setFormError('Please accept the system security policy.');
      return;
    }

    // Process registration & immediate session login
    loginRole(roleId, {
      id: `${roleId}_reg_${Date.now()}`,
      email,
      fullName,
      phone,
      department: roleCustomField || theme.demoUser.department || 'General',
      systemRole: theme.demoUser.systemRole,
    });

    setFormSuccess(`Account created & logged into ${theme.title}!`);
    setTimeout(() => {
      setIsOpen(false);
      setFormSuccess('');
    }, 1000);
  };

  const handleQuickDemoLogin = () => {
    loginRole(roleId, theme.demoUser);
    setFormSuccess(`Quick Demo login activated for ${theme.title}!`);
    setTimeout(() => {
      setIsOpen(false);
      setFormSuccess('');
    }, 600);
  };

  return (
    <>
      {/* HEADER WIDGET IN EACH PANEL */}
      <div className="relative inline-flex items-center">
        {session.isAuthenticated && session.user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${theme.border} ${theme.bgDark} hover:bg-slate-800/80 transition-all text-xs text-slate-100 shadow-md`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-[11px] shadow-sm">
                {session.user.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold leading-none flex items-center gap-1 text-slate-200">
                  {session.user.fullName}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {session.user.department || session.user.systemRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Account Quick Menu Dropdown */}
            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-3 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${theme.accentText}`} />
                    <span className="font-bold text-slate-100">{theme.title}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    ACTIVE SESSION
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                  <p><span className="text-slate-500">Name:</span> <strong className="text-slate-100">{session.user.fullName}</strong></p>
                  <p><span className="text-slate-500">Email:</span> <span className="font-mono text-slate-300">{session.user.email}</span></p>
                  <p><span className="text-slate-500">Role:</span> <span className="text-amber-400 font-medium">{session.user.systemRole}</span></p>
                  <p><span className="text-slate-500">Session ID:</span> <span className="font-mono text-[9px] text-slate-400">{session.token ? session.token.slice(0, 16) + '...' : 'SEC-VERIFIED'}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setAuthMode('signup');
                      setIsOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    New Account
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logoutRole(roleId);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-medium border border-rose-800/40 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${theme.gradient} hover:brightness-110 text-white font-medium text-xs shadow-lg border border-white/20 transition-all hover:scale-105 active:scale-95`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-300" />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>

      {/* REUSABLE UNIFIED LOGIN MODAL FOR ALL 6 PANELS */}
      <LoginModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        role={roleId}
        initialTab={authMode}
      />
    </>
  );
};
