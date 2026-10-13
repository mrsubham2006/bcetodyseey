import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Users, Building2, HardHat, Activity, Flame, ShieldCheck,
  Lock, Mail, ArrowRight, Shield, AlertCircle, CheckCircle2,
  KeyRound, Eye, EyeOff, Loader2, Sparkles, ChevronRight
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

interface UnifiedAccessPortalViewProps {
  onSelectPanel: (panel: PanelConfig) => void;
}

export const UnifiedAccessPortalView: React.FC<UnifiedAccessPortalViewProps> = ({
  onSelectPanel
}) => {
  const { showToast } = useApp();
  const { isAuthenticated: isCitizenAuthenticated, loginCitizen } = useCitizen();

  const [selectedPanel, setSelectedPanel] = useState<PanelConfig | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [mfaCode, setMfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePanelClick = (panel: PanelConfig) => {
    // If Citizen panel and already authenticated, navigate directly
    if (panel.id === 'citizen' && isCitizenAuthenticated) {
      onSelectPanel(panel);
      return;
    }
    setSelectedPanel(panel);
    setEmail(panel.defaultEmail);
    setPassword('Password@123');
    setMfaCode('');
    setError(null);
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPanel) return;
    setError(null);
    setLoading(true);

    try {
      if (selectedPanel.id === 'citizen') {
        const res = await loginCitizen(email, password);
        if (res.success) {
          showToast('Welcome to Citizen Portal!', 'success');
          onSelectPanel(selectedPanel);
        } else {
          setError(res.error || 'Authentication failed. Please check credentials.');
        }
        setLoading(false);
        return;
      }

      // Staff login endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Unable to sign in with those credentials. Please check details.');
        setLoading(false);
        return;
      }

      // Role & permissions check
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
        setError(`Access denied. Your account role (${userRole}) is not authorized for the ${selectedPanel.title}.`);
        setLoading(false);
        return;
      }

      // Store staff token
      localStorage.setItem('civic_token', data.access_token);
      showToast(`Authenticated as ${data.user.full_name} (${userRole})`, 'success');
      onSelectPanel(selectedPanel);
    } catch {
      setError('Connection failed. Please verify that the backend API is online.');
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
        <div className="text-left mb-4">
          <h2 className="text-xs font-bold text-heritage-aged uppercase tracking-widest">
            Choose Your Access Portal
          </h2>
          <p className="text-[11px] text-heritage-aged/80">
            Select an operational portal below to sign in with verified credentials.
          </p>
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
                    {isCitizen && isCitizenAuthenticated ? 'Open My Dashboard' : 'Enter Secure Portal'}
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

      {/* ── Modal: Role-Based Secure Sign-In Dialog ─────────────────────── */}
      {selectedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-heritage-charcoal-dark/80 backdrop-blur-sm"
            onClick={() => setSelectedPanel(null)}
          />

          <div className="relative z-10 w-full max-w-md bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal-dark shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${selectedPanel.accentColor} text-white relative`}>
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
              <p className="text-xs text-white/80 mt-2">
                Sign in with authorized credentials to access this operational station.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStaffLogin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 dark:text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Registered Staff Email / Identifier
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
                  <span className="text-[10px] text-heritage-aged mt-1 block">
                    Pre-authorized for demo demonstration
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Authorize & Open {selectedPanel.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedPanel(null)}
                  className="text-xs text-heritage-aged hover:text-heritage-charcoal underline"
                >
                  Return to Portal Selector
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
