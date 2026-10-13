import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useUnifiedAuth } from '../context/UnifiedAuthContext';
import { Department } from '../types';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Building2,
  LogIn,
  UserPlus,
  Mail,
  Key,
  User,
  Phone,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  BadgeHelp,
  FileCheck2,
  Send
} from 'lucide-react';

export interface MunicipalAuthViewProps {
  initialTab?: 'login' | 'signup' | 'forgot-password' | 'pending-approval';
  onAuthenticated?: (user: any) => void;
  onNavigateHome?: () => void;
}

export const MunicipalAuthView: React.FC<MunicipalAuthViewProps> = ({
  initialTab = 'login',
  onAuthenticated,
  onNavigateHome
}) => {
  const { showToast } = useApp();
  const { loginRole } = useUnifiedAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot' | 'pending'>(
    initialTab === 'forgot-password' ? 'forgot' : initialTab === 'pending-approval' ? 'pending' : initialTab
  );

  // Common UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState<string>('officer@civicnexus.gov.in');
  const [loginPassword, setLoginPassword] = useState<string>('Password@123');
  const [rememberEmail, setRememberEmail] = useState<boolean>(true);

  // SIGNUP STATE
  const [fullName, setFullName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<number>(1);
  const [designation, setDesignation] = useState<string>('Executive Officer');
  const [zoneOrOffice, setZoneOrOffice] = useState<string>('BMC Zone-1 Office');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);

  // FORGOT PASSWORD STATE
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotDispatched, setForgotDispatched] = useState<boolean>(false);

  // PENDING APPROVAL DATA
  const [pendingRegData, setPendingRegData] = useState<any>(null);

  // Fetch departments from backend API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/v1/departments');
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
          if (data.length > 0) setSelectedDeptId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter your official email address and passcode.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/municipal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PENDING_APPROVAL') {
          setPendingRegData(data.registration || {
            ref_code: 'MUNI-REG-2026-PENDING',
            full_name: loginEmail.split('@')[0].toUpperCase(),
            email: loginEmail,
            department_name: 'Municipal Operations',
            designation: 'Officer Candidate',
            status: 'PENDING_APPROVAL',
            created_at: new Date().toISOString()
          });
          setActiveTab('pending');
          setErrorMsg(null);
          return;
        }

        setErrorMsg(data.detail || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Success
      loginRole('municipal', {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.full_name,
        phone: data.user.phone,
        department: data.user.department_name || 'Public Works & Municipal Operations',
        systemRole: data.user.role || 'DEPARTMENT_OFFICER'
      });

      showToast(`Welcome back, Officer ${data.user.full_name}!`, 'success');
      if (onAuthenticated) {
        onAuthenticated(data.user);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network or server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Field-level validations
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('A valid official email address is required.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 8) {
      setErrorMsg('A valid official phone number is required.');
      return;
    }
    if (!employeeId.trim()) {
      setErrorMsg('Employee ID is required (e.g. BMC-EMP-1024).');
      return;
    }
    if (!designation.trim()) {
      setErrorMsg('Official Designation is required.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Confirm Password does not match Password.');
      return;
    }
    if (!termsAgreed) {
      setErrorMsg('You must certify authorization under Municipal Operations Governance Rules.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/municipal/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          phone: contactPhone.trim(),
          employee_id: employeeId.trim(),
          department_id: selectedDeptId,
          designation: designation.trim(),
          zone_or_office: zoneOrOffice.trim(),
          password: signupPassword,
          requested_role: 'MUNICIPAL_OFFICER'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || 'Registration failed. Please review your submitted details.');
        return;
      }

      // Success -> Redirect to Pending Approval View
      showToast('Municipal Registration Submitted Successfully!', 'success');
      setPendingRegData(data.registration);
      setActiveTab('pending');
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error while processing registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMsg('Please enter a valid official email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/municipal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      setForgotDispatched(true);
      setSuccessMsg(data.message);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-Fill
  const handleAutoFillDemo = () => {
    setLoginEmail('officer@civicnexus.gov.in');
    setLoginPassword('Password@123');
    setErrorMsg(null);
    showToast('Demo Officer credentials loaded.', 'info');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-heritage-ivory via-stone-100 to-heritage-ivory dark:from-heritage-charcoal-dark dark:via-slate-900 dark:to-heritage-charcoal-dark transition-colors duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone/80 dark:border-heritage-charcoal-dark rounded-3xl shadow-heritage-lg overflow-hidden transition-all duration-300">

        {/* HEADER BRANDING BANNER (Odisha Govt Palette) */}
        <div className="bg-gradient-to-r from-heritage-maroon-dark via-heritage-maroon to-heritage-maroon-dark p-6 text-white relative shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-black/30 border border-heritage-gold/40 shadow-inner">
                <Building2 className="w-7 h-7 text-heritage-gold shrink-0 animate-pulse-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-md bg-heritage-gold/20 text-heritage-gold border border-heritage-gold/30">
                    AUTHORIZATION PORTAL
                  </span>
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl tracking-wide text-white mt-0.5">
                  CIVIC NEXUS AI
                </h2>
              </div>
            </div>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-heritage-gold border border-heritage-gold/30 text-xs font-semibold transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            )}
          </div>

          <p className="text-sm font-semibold text-heritage-gold font-serif mt-2">
            Welcome to Municipal Operations
          </p>
          <p className="text-xs text-heritage-stone/90 mt-0.5 leading-relaxed">
            Manage civic complaints, coordinate field teams, and monitor municipal service delivery from one platform.
          </p>

          <IkatPatternDivider className="mt-4 opacity-40" />
        </div>

        {/* TABS: [ LOGIN ] [ SIGN UP ] */}
        {activeTab !== 'pending' && activeTab !== 'forgot' && (
          <div className="flex border-b border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/80 dark:bg-heritage-charcoal-dark/60 p-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-2xl transition-all duration-150 ${
                activeTab === 'login'
                  ? 'bg-heritage-maroon text-white shadow-md border border-heritage-gold/40'
                  : 'text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/30 dark:hover:bg-heritage-charcoal'
              }`}
            >
              <LogIn className="w-4 h-4 text-heritage-gold shrink-0" />
              <span>OFFICER LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-2xl transition-all duration-150 ${
                activeTab === 'signup'
                  ? 'bg-heritage-maroon text-white shadow-md border border-heritage-gold/40'
                  : 'text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/30 dark:hover:bg-heritage-charcoal'
              }`}
            >
              <UserPlus className="w-4 h-4 text-heritage-gold shrink-0" />
              <span>STAFF SIGN UP</span>
            </button>
          </div>
        )}

        {/* FORM CONTAINER BODY */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick Demo Preset Button */}
              <div className="p-3 rounded-2xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-gold/30 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-heritage-gold shrink-0" />
                  <div>
                    <span className="font-bold text-heritage-maroon dark:text-heritage-gold">
                      Quick Demo Officer Credentials
                    </span>
                    <p className="text-[10px] text-heritage-aged font-mono">officer@civicnexus.gov.in</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="px-3 py-1.5 rounded-xl bg-heritage-gold/20 hover:bg-heritage-gold/30 text-heritage-maroon dark:text-heritage-gold border border-heritage-gold/40 font-bold text-xs transition"
                >
                  Auto-Fill
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="officer.das@bmc.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Passcode *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-heritage-aged pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="rounded border-heritage-stone text-heritage-maroon focus:ring-heritage-gold"
                  />
                  <span>Remember official email</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-heritage-maroon dark:text-heritage-gold hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark hover:brightness-110 text-white font-bold text-xs shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-heritage-gold" />
                    <span>Authenticating Municipal Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-heritage-gold" />
                    <span>Sign In to Municipal Operations</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">

              <div className="border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-heritage-maroon dark:text-heritage-gold flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Personal Details</span>
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Er. Soumya Ranjan Mohanty"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="soumya.m@bmc.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98612 34567"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2 pt-2">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-heritage-maroon dark:text-heritage-gold flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>2. Employment & Department Details</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. BMC-EMP-8821"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Assigned Department *
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Assistant Executive Engineer"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Municipal Zone / Office
                  </label>
                  <input
                    type="text"
                    value={zoneOrOffice}
                    onChange={(e) => setZoneOrOffice(e.target.value)}
                    placeholder="e.g. BMC Zone-2 North Headquarters"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2 pt-2">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-heritage-maroon dark:text-heritage-gold flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>3. Account Passcode</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 characters"
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start space-x-2 cursor-pointer text-xs text-heritage-aged pt-1">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-heritage-stone text-heritage-maroon focus:ring-heritage-gold"
                />
                <span className="leading-tight">
                  I certify official employment and request approval under Municipal Operations Governance Protocol.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark hover:brightness-110 text-white font-bold text-xs shadow-heritage transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-heritage-gold" />
                    <span>Submitting Staff Registration...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-heritage-gold" />
                    <span>Submit Municipal Registration for Approval</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: PENDING APPROVAL SCREEN */}
          {activeTab === 'pending' && (
            <div className="space-y-5 text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-heritage-gold text-heritage-gold flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 mb-2">
                  STATUS: PENDING_APPROVAL
                </span>
                <h3 className="font-serif font-bold text-lg text-heritage-maroon dark:text-heritage-gold">
                  Registration Submitted Successfully
                </h3>
                <p className="text-xs text-heritage-aged dark:text-heritage-stone max-w-md mx-auto mt-1 leading-relaxed">
                  Your municipal staff registration has been received. Your account must be approved by the Super Administrator before you can access the Municipal Department Dashboard.
                </p>
              </div>

              {/* Pending Details Card */}
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark/90 p-4 rounded-2xl border border-heritage-gold/30 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2">
                  <span className="text-heritage-aged">Reference Code:</span>
                  <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                    {pendingRegData?.ref_code || 'MUNI-REG-2026-1001'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2">
                  <span className="text-heritage-aged">Applicant Name:</span>
                  <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">
                    {pendingRegData?.full_name || 'Staff Candidate'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2">
                  <span className="text-heritage-aged">Official Email:</span>
                  <span className="font-mono text-heritage-charcoal dark:text-heritage-ivory">
                    {pendingRegData?.email || loginEmail}
                  </span>
                </div>
                <div className="flex justify-between border-b border-heritage-stone/60 dark:border-heritage-charcoal pb-2">
                  <span className="text-heritage-aged">Submitted Department:</span>
                  <span className="font-medium text-heritage-charcoal dark:text-heritage-ivory">
                    {pendingRegData?.department_name || 'Drainage and Flood Management'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-heritage-aged">Submission Timestamp:</span>
                  <span className="font-mono text-heritage-aged">
                    {pendingRegData?.created_at ? new Date(pendingRegData.created_at).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 text-left flex items-start space-x-2">
                <BadgeHelp className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Authorized Approver Contact: <strong>support.municipal@civicnexus.gov.in</strong> (+91 674 2431000). You will be notified automatically upon Super Admin approval.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-heritage-maroon text-white font-bold text-xs hover:brightness-110 transition"
                >
                  Return to Officer Login
                </button>
                {onNavigateHome && (
                  <button
                    onClick={onNavigateHome}
                    className="flex-1 py-2.5 rounded-xl border border-heritage-stone text-heritage-charcoal dark:text-heritage-stone font-semibold text-xs hover:bg-heritage-stone/20 transition"
                  >
                    Return to Main Portal
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                  Recover Official Account Password
                </h3>
                <p className="text-xs text-heritage-aged dark:text-heritage-stone mt-0.5">
                  Enter your registered official email address. Password reset instructions will be dispatched via secure state mail server.
                </p>
              </div>

              {!forgotDispatched ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                      Official Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="officer.das@bmc.gov.in"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-heritage-maroon text-white font-bold text-xs hover:brightness-110 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-heritage-gold" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-heritage-gold" />
                        <span>Dispatch Password Recovery Email</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs space-y-3 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-sm text-emerald-300">
                    Recovery Instructions Dispatched
                  </p>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {successMsg}
                  </p>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setForgotDispatched(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-heritage-maroon dark:text-heritage-gold hover:underline font-semibold"
                >
                  Return to Officer Login
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-heritage-ivory/90 dark:bg-heritage-charcoal-dark border-t border-heritage-stone dark:border-heritage-charcoal text-[10px] text-heritage-aged flex items-center justify-between font-mono">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold shrink-0" />
            <span>State Civic Governance RBAC Active</span>
          </span>
          <span>CIVIC NEXUS AI v2026</span>
        </div>

      </div>
    </div>
  );
};
