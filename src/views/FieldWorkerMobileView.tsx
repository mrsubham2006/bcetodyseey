import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskProgressUpdate, TaskHistoryEvent } from '../types';
import { useUnifiedAuth } from '../context/UnifiedAuthContext';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import { SatelliteLocationMap } from '../components/SatelliteLocationMap';
import { PanelRoleAuth } from '../components/PanelRoleAuth';
import {
  HardHat,
  MapPin,
  Camera,
  CheckCircle2,
  Play,
  FileCheck,
  Send,
  RefreshCw,
  Navigation,
  Clock,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Check,
  Phone,
  User,
  Shield,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ListTodo,
  FileText,
  Boxes,
  Activity,
  Layers,
  Sparkles,
  PhoneCall,
  CheckCircle,
  Compass,
  ArrowLeft,
  Calendar,
  X,
  ShieldCheck,
  Upload,
  Lock,
  RotateCcw
} from 'lucide-react';

interface WorkerProfile {
  id: number;
  worker_code: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: number;
  department_name: string;
  designation: string;
  supervisor_name: string;
  assigned_zone: string;
  duty_status: 'ON_DUTY' | 'OFF_DUTY';
  account_status: string;
  joined_date: string;
}

interface DashboardStats {
  total_assigned: number;
  new_assignments: number;
  accepted: number;
  on_the_way: number;
  arrived: number;
  in_progress: number;
  pending_verification: number;
  completed: number;
  rejected: number;
  returned: number;
  overdue: number;
}

export const FieldWorkerMobileView: React.FC = () => {
  const { language, showToast } = useApp();
  const { sessions, loginRole, logoutRole, isRoleAuthenticated } = useUnifiedAuth();
  const fieldWorkerSession = sessions.field_worker;

  // Login Form States for UnifiedAuthManager Integration
  const [showLoginModal, setShowLoginModal] = useState<boolean>(!fieldWorkerSession.isAuthenticated);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [badgeIdInput, setBadgeIdInput] = useState<string>('FW-1024');
  const [emailInput, setEmailInput] = useState<string>(fieldWorkerSession.user?.email || 'worker@civicnexus.gov.in');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••');
  const [fullNameInput, setFullNameInput] = useState<string>(fieldWorkerSession.user?.fullName || 'Bikash Mohapatra');
  const [phoneInputAuth, setPhoneInputAuth] = useState<string>(fieldWorkerSession.user?.phone || '+91 98765 43210');
  const [departmentInput, setDepartmentInput] = useState<string>(fieldWorkerSession.user?.department || 'Drainage & Flood Management');
  const [zoneInput, setZoneInput] = useState<string>('BMC Ward 28 (North-Central)');
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Active Workspace Sub-Tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TASKS' | 'DETAILS' | 'PROFILE'>('DASHBOARD');

  // Data States
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_assigned: 0,
    new_assignments: 0,
    accepted: 0,
    on_the_way: 0,
    arrived: 0,
    in_progress: 0,
    pending_verification: 0,
    completed: 0,
    rejected: 0,
    returned: 0,
    overdue: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters & Search for Task List
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Equipment unavailable');
  const [rejectNotes, setRejectNotes] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Arrival Check-In State
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinResult, setCheckinResult] = useState<{ distance_meters: number; within_radius: boolean } | null>(null);

  // Before & After Photo Upload Forms
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800');
  const [beforePhotoDesc, setBeforePhotoDesc] = useState('Initial flooded site condition before pump deployment.');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800');
  const [afterPhotoDesc, setAfterPhotoDesc] = useState('Stormwater cleared and culvert grate desilted.');

  // Progress Update Form State
  const [progressNotes, setProgressNotes] = useState('');
  const [progressStatus, setProgressStatus] = useState('IN_PROGRESS');
  const [isBlocker, setIsBlocker] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Structured Completion Report Form State
  const [completionSummary, setCompletionSummary] = useState('All stormwater drained from underpass using 300 HP suction pump.');
  const [materialsUsed, setMaterialsUsed] = useState('300 HP Sluice Dewatering Pump, 4 Traffic Warning Cones');
  const [workerNotes, setWorkerNotes] = useState('Submersible pump ran for 45 minutes at 120 L/min. Traffic flow resumed.');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Profile Edit
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  // Handle Field Worker Login Form submission to UnifiedAuthManager
  const handleFieldWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage(null);
    setAuthSuccessMessage(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthErrorMessage('Please enter valid email and password credentials.');
      return;
    }

    setAuthenticating(true);
    setTimeout(() => {
      const userData = {
        id: badgeIdInput || `FW-${Math.floor(1000 + Math.random() * 9000)}`,
        email: emailInput.trim(),
        fullName: fullNameInput.trim() || 'Bikash Mohapatra',
        phone: phoneInputAuth.trim() || '+91 98765 43210',
        department: departmentInput,
        systemRole: 'FIELD_WORKER'
      };

      const mockToken = `jwt_fw_sec_${Date.now()}`;

      // Save credentials in UnifiedAuthManager context
      loginRole('field_worker', userData, mockToken);
      setAuthenticating(false);
      setAuthSuccessMessage('Field Worker credentials saved to UnifiedAuthManager!');

      // Sync local profile
      setProfile(prev => prev ? {
        ...prev,
        worker_code: badgeIdInput || 'FW-1024',
        full_name: fullNameInput || 'Bikash Mohapatra',
        email: emailInput,
        phone: phoneInputAuth || '+91 98765 43210',
        department_name: departmentInput,
        assigned_zone: zoneInput
      } : prev);

      setTimeout(() => {
        setShowLoginModal(false);
        showToast('Field Worker session active & saved in UnifiedAuthManager context', 'success');
      }, 600);
    }, 500);
  };

  // Fetch Field Worker Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, tasksRes, profRes] = await Promise.all([
        fetch('/api/v1/field-worker/dashboard'),
        fetch('/api/v1/field-worker/tasks'),
        fetch('/api/v1/field-worker/profile')
      ]);

      if (dashRes.ok) {
        const dData = await dashRes.json();
        setProfile(dData.worker);
        setStats(dData.stats);
        setPriorityTasks(dData.priority_tasks || []);
      }

      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        setTasks(tData);
        if (tData.length > 0 && !selectedTask) {
          setSelectedTask(tData[0]);
        }
      }

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData);
        setPhoneInput(pData.phone || '');
      }
    } catch (err) {
      console.error("Error loading field worker dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Action Handlers
  const handleAcceptTask = async (taskId: number) => {
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${taskId}/accept`, { method: 'POST' });
      if (res.ok) {
        showToast(`Work order TSK-${taskId} accepted! Route initialized.`, 'success');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmittingReject(true);
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${selectedTask.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason, notes: rejectNotes })
      });
      if (res.ok) {
        showToast(`Task TSK-${selectedTask.id} returned to department queue.`, 'info');
        setShowRejectModal(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleOnTheWay = async (taskId: number) => {
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${taskId}/on-the-way`, { method: 'POST' });
      if (res.ok) {
        showToast("Logged 'En Route' to site. Citizen tracking updated!", 'info');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArrivalCheckin = async (taskId: number) => {
    setCheckingIn(true);
    setCheckinResult(null);

    const performCheckin = async (lat?: number, lng?: number) => {
      try {
        const res = await fetch(`/api/v1/field-worker/tasks/${taskId}/arrival`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lng })
        });
        if (res.ok) {
          const data = await res.json();
          setCheckinResult(data.checkin);
          showToast(`Arrived on site! GPS distance: ${data.checkin.distance_meters}m from reported spot.`, 'success');
          loadDashboardData();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingIn(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => performCheckin(pos.coords.latitude, pos.coords.longitude),
        () => performCheckin()
      );
    } else {
      performCheckin();
    }
  };

  const handleStartWork = async (taskId: number) => {
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${taskId}/start-work`, { method: 'POST' });
      if (res.ok) {
        showToast("Work started! Safety checklist confirmed.", 'success');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmittingProgress(true);
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${selectedTask.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: progressNotes,
          status: progressStatus,
          blocker_reported: isBlocker
        })
      });
      if (res.ok) {
        showToast(isBlocker ? "Blocker alert sent to Supervisor!" : "Progress update saved", isBlocker ? "alert" : "success");
        setProgressNotes('');
        setIsBlocker(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleSubmitCompletionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/v1/field-worker/tasks/${selectedTask.id}/completion-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: completionSummary,
          worker_notes: workerNotes,
          materials_used: materialsUsed,
          before_photo_url: beforePhotoUrl,
          after_photo_url: afterPhotoUrl
        })
      });
      if (res.ok) {
        showToast("Completion report submitted for Supervisor verification!", "success");
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const toggleDutyStatus = async () => {
    if (!profile) return;
    const nextStatus = profile.duty_status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
    try {
      const res = await fetch('/api/v1/field-worker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duty_status: nextStatus })
      });
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, duty_status: nextStatus } : null);
        showToast(`Duty status updated to ${nextStatus.replace('_', ' ')}`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered task list
  const filteredTasks = tasks.filter(t => {
    if (statusTab !== 'ALL' && t.status !== statusTab) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = `TSK-${t.id}`.toLowerCase().includes(q);
      const titleMatch = t.title.toLowerCase().includes(q);
      const addrMatch = t.address ? t.address.toLowerCase().includes(q) : false;
      if (!codeMatch && !titleMatch && !addrMatch) return false;
    }
    return true;
  });

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-6 pb-24 lg:pb-12">
      
      {/* ── TOP MOBILE TERMINAL HEADER ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-heritage-maroon via-heritage-maroon-dark to-heritage-maroon text-white shadow-heritage flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-heritage-maroon-dark text-heritage-gold shadow-sm shrink-0">
            <HardHat className="w-6 h-6 text-heritage-gold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-heritage-gold uppercase tracking-wider">
                FIELD WORKER TERMINAL · {profile?.worker_code || 'FW-1024'}
              </span>
              <button
                onClick={toggleDutyStatus}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all flex items-center space-x-1 ${
                  profile?.duty_status === 'ON_DUTY'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{profile?.duty_status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}</span>
              </button>
            </div>

            <h2 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5">
              {profile?.full_name || 'Bikash Mohapatra'} ({profile?.department_name || 'Drainage & Flood Management'})
            </h2>
            <p className="text-[11px] text-heritage-stone/90">
              Zone: {profile?.assigned_zone || 'BMC Ward 28 (North-Central)'} · Supervisor: {profile?.supervisor_name || 'Sanjay Tripathy'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-heritage-gold text-heritage-charcoal font-bold text-xs shadow-sm hover:brightness-110 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-heritage-maroon" />
            <span>{fieldWorkerSession.isAuthenticated ? 'Session Active' : 'Worker Login'}</span>
          </button>
          <PanelRoleAuth roleId="field_worker" />
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-heritage-maroon-dark/80 text-heritage-stone border border-heritage-gold/40 hover:border-heritage-gold text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-heritage-gold ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* ── FIELD WORKER DEDICATED LOGIN FORM MODAL ──────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-heritage-lg relative animate-scale-up">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-heritage-stone/30 text-heritage-aged transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-heritage-maroon text-heritage-gold shadow-sm">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-heritage-gold bg-heritage-maroon px-2 py-0.5 rounded uppercase">
                  UNIFIED AUTH MANAGER
                </span>
                <h3 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory mt-0.5">
                  Field Worker Login
                </h3>
              </div>
            </div>

            <p className="text-xs text-heritage-aged mb-5 leading-relaxed">
              Authenticate your field worker profile. Session credentials will be stored securely into <strong className="text-heritage-maroon dark:text-heritage-gold">UnifiedAuthManager</strong> context under role <code className="font-mono bg-heritage-stone/40 px-1 py-0.5 rounded">field_worker</code>.
            </p>

            {authErrorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs font-semibold mb-4 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authErrorMessage}</span>
              </div>
            )}

            {authSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{authSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleFieldWorkerLogin} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Worker Badge Code *
                  </label>
                  <input
                    type="text"
                    value={badgeIdInput}
                    onChange={e => setBadgeIdInput(e.target.value)}
                    placeholder="FW-1024"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark font-mono text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={e => setFullNameInput(e.target.value)}
                    placeholder="Bikash Mohapatra"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Official Email / Username *
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="worker@civicnexus.gov.in"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Security Password *
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Assigned Municipal Department *
                </label>
                <select
                  value={departmentInput}
                  onChange={e => setDepartmentInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                >
                  <option value="Drainage & Flood Management">Drainage & Flood Management</option>
                  <option value="Roads & Public Works">Roads & Public Works</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Street Lighting & Electrical">Street Lighting & Electrical</option>
                  <option value="Emergency Fire & Rescue">Emergency Fire & Rescue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                  Assigned Operating Zone / Ward *
                </label>
                <select
                  value={zoneInput}
                  onChange={e => setZoneInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                >
                  <option value="BMC Ward 28 (North-Central)">BMC Ward 28 (North-Central)</option>
                  <option value="BMC Ward 14 (Saheed Nagar)">BMC Ward 14 (Saheed Nagar)</option>
                  <option value="BMC Ward 32 (Patia Tech Grid)">BMC Ward 32 (Patia Tech Grid)</option>
                  <option value="CMC Ward 12 (Cuttack Grid)">CMC Ward 12 (Cuttack Grid)</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-full py-3 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {authenticating ? <RefreshCw className="w-4 h-4 animate-spin text-heritage-gold" /> : <Lock className="w-4 h-4 text-heritage-gold" />}
                  <span>{authenticating ? 'Authenticating & Storing Session…' : 'Sign In & Save Field Session'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeIdInput('FW-1024');
                    setEmailInput('worker@civicnexus.gov.in');
                    setFullNameInput('Bikash Mohapatra');
                    setDepartmentInput('Drainage & Flood Management');
                    setZoneInput('BMC Ward 28 (North-Central)');
                  }}
                  className="w-full py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-[11px] font-semibold text-heritage-aged hover:text-heritage-maroon transition-colors"
                >
                  Load Demo Field Worker Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WORKSPACE SUB-NAVIGATION BAR ─────────────────────────────────────── */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-heritage-stone dark:border-heritage-charcoal">
        {[
          { id: 'DASHBOARD', label: '01. Dashboard Overview', icon: Activity },
          { id: 'TASKS', label: `02. My Assigned Tasks (${tasks.length})`, icon: ListTodo, badge: stats.new_assignments },
          { id: 'DETAILS', label: '03. Active Task Execution', icon: FileCheck },
          { id: 'PROFILE', label: '04. Worker Profile', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-heritage-maroon text-heritage-gold border-heritage-maroon shadow-sm'
                  : 'bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-heritage-gold' : 'text-heritage-aged'}`} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-heritage-gold text-heritage-charcoal font-bold">
                  {tab.badge} New
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: FIELD WORKER DASHBOARD ──────────────────────────────────── */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Card & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-heritage-charcoal p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">Real-time Task Matrix</span>
              <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Bikash'}!
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-heritage-aged" />
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory text-xs"
              >
                <option value="all">All Task Records</option>
                <option value="today">Today's Shift</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Calculated KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div onClick={() => { setStatusTab('ASSIGNED'); setActiveTab('TASKS'); }} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">New Assigned</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-heritage-maroon dark:text-heritage-gold mt-1">{stats.new_assignments}</p>
              <span className="text-[10px] text-heritage-maroon font-semibold">Needs Acceptance</span>
            </div>

            <div onClick={() => { setStatusTab('IN_PROGRESS'); setActiveTab('TASKS'); }} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">In Progress</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-heritage-blue mt-1">{stats.in_progress}</p>
              <span className="text-[10px] text-heritage-blue font-semibold">Active Work Site</span>
            </div>

            <div onClick={() => { setStatusTab('PENDING_VERIFICATION'); setActiveTab('TASKS'); }} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">Pending Inspection</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{stats.pending_verification}</p>
              <span className="text-[10px] text-amber-700 font-semibold">Proof Uploaded</span>
            </div>

            <div onClick={() => { setStatusTab('COMPLETED'); setActiveTab('TASKS'); }} className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:border-heritage-gold transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-heritage-aged uppercase tracking-wider block">Completed</span>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Supervisor Signed Off</span>
            </div>
          </div>

          {/* "My Priority Tasks" Section */}
          <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-heritage-gold" />
                  <span>My Priority Tasks ({priorityTasks.length})</span>
                </h3>
                <p className="text-xs text-heritage-aged mt-0.5">
                  Sorted by critical SLA deadline and urgency.
                </p>
              </div>

              <button
                onClick={() => { setStatusTab('ALL'); setActiveTab('TASKS'); }}
                className="text-xs font-bold text-heritage-maroon dark:text-heritage-gold hover:underline flex items-center space-x-1"
              >
                <span>View All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {priorityTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-heritage-aged">
                  <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                  <p className="font-semibold">No critical or overdue tasks pending!</p>
                </div>
              ) : (
                priorityTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark hover:border-heritage-gold transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-heritage-maroon dark:text-heritage-gold">
                          TSK-{t.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-heritage-stone/40 text-heritage-charcoal">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-heritage-charcoal dark:text-heritage-ivory">{t.title}</h4>
                      <p className="text-[11px] text-heritage-aged flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-heritage-red shrink-0" />
                        <span>{t.address}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => { setSelectedTask(t); setActiveTab('DETAILS'); }}
                      className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-bold hover:bg-heritage-maroon-dark transition-all self-start sm:self-auto shrink-0 shadow-sm"
                    >
                      View & Execute →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MY ASSIGNED TASKS QUEUE ──────────────────────────────────── */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Status Tabs Segmented Bar */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 bg-white dark:bg-heritage-charcoal p-2 rounded-2xl border border-heritage-stone text-xs">
            {[
              { id: 'ALL', label: 'All Tasks' },
              { id: 'ASSIGNED', label: 'New' },
              { id: 'ACCEPTED', label: 'Accepted' },
              { id: 'ON_THE_WAY', label: 'En Route' },
              { id: 'ARRIVED', label: 'Arrived' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'PENDING_VERIFICATION', label: 'Submitted' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'RETURNED', label: 'Returned' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusTab === tab.id
                    ? 'bg-heritage-maroon text-heritage-gold shadow-sm'
                    : 'text-heritage-aged hover:text-heritage-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Priority Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-heritage-charcoal p-3.5 rounded-2xl border border-heritage-stone shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-heritage-aged absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search complaint code, task title, address..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-semibold"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Task List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-heritage-aged bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone">
                <ListTodo className="w-8 h-8 mx-auto text-heritage-stone mb-2" />
                <p className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">No tasks assigned yet.</p>
                <p className="text-[11px] mt-1">New municipal assignments will appear here automatically.</p>
              </div>
            ) : (
              filteredTasks.map(t => {
                const isSelected = selectedTask?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedTask(t); setActiveTab('DETAILS'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-heritage-gold bg-white dark:bg-heritage-charcoal shadow-heritage ring-2 ring-heritage-gold/50'
                        : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">
                          TSK-{t.id}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-stone/40 text-heritage-charcoal">
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{t.title}</h4>
                      <p className="text-xs text-heritage-aged line-clamp-2 mt-1">{t.instructions}</p>
                    </div>

                    <div className="pt-3 border-t border-heritage-stone/40 flex items-center justify-between text-xs font-semibold">
                      <span className="text-heritage-maroon dark:text-heritage-gold flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-heritage-red shrink-0" />
                        <span className="truncate max-w-[160px]">{t.address}</span>
                      </span>

                      <button className="px-3 py-1.5 rounded-lg bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold font-bold text-xs hover:bg-heritage-maroon/20 flex items-center space-x-1">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ACTIVE TASK EXECUTION & DETAILS ─────────────────────────── */}
      {activeTab === 'DETAILS' && selectedTask && (
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setActiveTab('TASKS')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Task List</span>
          </button>

          {/* Active Work Order Hero Header */}
          <div className="p-6 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-gold shadow-heritage space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-heritage-stone">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-heritage-stone/40 px-2 py-0.5 rounded text-heritage-maroon dark:text-heritage-gold">
                    WORK ORDER · TSK-{selectedTask.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-heritage-gold/20 text-heritage-charcoal border border-heritage-gold/40">
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory mt-1">
                  {selectedTask.title}
                </h2>
                <p className="text-xs text-heritage-aged flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-heritage-red shrink-0" />
                  <span>{selectedTask.address}</span>
                </p>
              </div>

              {/* Navigation & Maps Button */}
              <a
                href={`https://maps.google.com/?q=${selectedTask.latitude || 20.2961},${selectedTask.longitude || 85.8645}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-heritage-blue text-white text-xs font-bold flex items-center space-x-2 shadow-sm hover:bg-heritage-blue/90 shrink-0 self-start sm:self-auto"
              >
                <Navigation className="w-4 h-4" />
                <span>Start Navigation</span>
              </a>
            </div>

            {/* ── SECTION A: COMPLAINT INFORMATION ─────────────────────────────── */}
            <div className="space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Section A: Complaint & Scope Information
              </h3>
              <div className="p-4 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone/60 space-y-2">
                <p><b>Detailed Work Instructions:</b> {selectedTask.instructions}</p>
                <p><b>Required Equipment & Safety Tools:</b> {selectedTask.equipment_required || '300 HP Dewatering Pump, Reflective Vests, Safety Cones'}</p>
                <p><b>Target SLA Deadline:</b> <span className="font-mono font-bold text-heritage-maroon dark:text-heritage-gold">{selectedTask.deadline || '4 Hours'}</span></p>
              </div>
            </div>

            {/* ── SECTION B: CITIZEN SUBMITTED EVIDENCE ───────────────────────────── */}
            <div className="space-y-2 text-xs">
              <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Section B: Citizen Original Photo Evidence
              </h3>
              <div className="p-3 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone/60">
                <img
                  src={selectedTask.before_photo_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'}
                  alt="Citizen complaint"
                  className="w-full h-44 object-cover rounded-lg border border-heritage-stone"
                />
                <span className="text-[10px] text-heritage-aged mt-1 block">Citizen reported site condition on submission</span>
              </div>
            </div>

            {/* ── SECTION C: INCIDENT LOCATION & SATELLITE MAP ──────────────────── */}
            <div className="space-y-2 text-xs">
              <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Section C: Incident Satellite Map & Coordinates
              </h3>
              <SatelliteLocationMap
                latitude={selectedTask.latitude || 20.2961}
                longitude={selectedTask.longitude || 85.8645}
                address={selectedTask.address || "Rasulgarh Junction Underpass, NH-16"}
                landmark="Rasulgarh Overbridge Sluice Gate"
                ward="BMC Ward 28 (North-Central)"
                city="Bhubaneswar"
                pincode="751010"
                captureMode="AUTO_GPS"
                accuracyMeters={4.2}
                interactive={false}
                height="220px"
              />
            </div>

            {/* ── INTERACTIVE WORKFLOW CONTROL PANEL ────────────────────────────── */}
            <div className="pt-4 border-t border-heritage-stone space-y-4">
              <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Field Operations Execution Panel
              </h3>

              {/* Step 1: Accept or Reject */}
              {selectedTask.status === 'ASSIGNED' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200">New Work Order Assignment Received</span>
                    <span className="text-[10px] font-mono text-amber-800">Status: ASSIGNED</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Review complaint scope and accept work order to begin dispatching.
                  </p>

                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      onClick={() => handleAcceptTask(selectedTask.id)}
                      className="px-6 py-2.5 rounded-xl bg-heritage-maroon text-white font-bold text-xs shadow-md hover:bg-heritage-maroon-dark transition-all flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 text-heritage-gold" />
                      <span>Accept Assignment</span>
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 text-xs font-semibold hover:bg-rose-50"
                    >
                      Reject Assignment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: On the Way & GPS Check-In */}
              {(selectedTask.status === 'ACCEPTED' || selectedTask.status === 'ON_THE_WAY' || selectedTask.status === 'ARRIVED') && (
                <div className="p-4 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                    <span>Step 2: Arrival & GPS Location Check-in</span>
                    <span className="text-heritage-maroon dark:text-heritage-gold font-mono">{selectedTask.status}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOnTheWay(selectedTask.id)}
                      disabled={selectedTask.status === 'ON_THE_WAY' || selectedTask.status === 'ARRIVED'}
                      className="px-4 py-2.5 rounded-xl bg-heritage-blue text-white text-xs font-bold hover:bg-heritage-blue/90 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{selectedTask.status === 'ON_THE_WAY' ? 'En Route Logged ✓' : "I'm On the Way"}</span>
                    </button>

                    <button
                      onClick={() => handleArrivalCheckin(selectedTask.id)}
                      disabled={checkingIn || selectedTask.status === 'ARRIVED'}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{checkingIn ? 'Verifying GPS…' : selectedTask.status === 'ARRIVED' ? 'Arrived & GPS Verified ✓' : "I've Arrived (GPS Check-In)"}</span>
                    </button>
                  </div>

                  {checkinResult && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center space-x-2 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>GPS Arrival verified! Distance from incident: {checkinResult.distance_meters}m (Within perimeter: {checkinResult.within_radius ? 'YES' : 'EXCEPTION LOGGED'})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Start Work */}
              {(selectedTask.status === 'ARRIVED' || selectedTask.status === 'IN_PROGRESS') && (
                <div className="p-4 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-stone space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                    <span>Step 3: Commencing Work & Safety Confirmation</span>
                    <button
                      onClick={() => handleStartWork(selectedTask.id)}
                      disabled={selectedTask.status === 'IN_PROGRESS'}
                      className="px-5 py-2 rounded-xl bg-heritage-orange text-white font-bold text-xs hover:brightness-110 disabled:opacity-50 flex items-center space-x-1.5 shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{selectedTask.status === 'IN_PROGRESS' ? 'Work In Progress Active ✓' : 'Confirm Safety & Start Work'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Before & After Photos & Completion Report */}
              {(selectedTask.status === 'IN_PROGRESS' || selectedTask.status === 'PENDING_VERIFICATION') && (
                <form onSubmit={handleSubmitCompletionReport} className="p-5 rounded-xl bg-white dark:bg-heritage-charcoal border border-heritage-gold shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Step 4: Upload Before/After Evidence & Submit Completion Report</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        Before-Work Site Photo URL *
                      </label>
                      <input
                        type="url"
                        value={beforePhotoUrl}
                        onChange={e => setBeforePhotoUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                        required
                      />
                      <span className="text-[10px] text-heritage-aged mt-0.5 block">Original site condition prior to work</span>
                    </div>

                    <div>
                      <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">
                        After-Work Completed Site Photo URL *
                      </label>
                      <input
                        type="url"
                        value={afterPhotoUrl}
                        onChange={e => setAfterPhotoUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                        required
                      />
                      <span className="text-[10px] text-heritage-aged mt-0.5 block">Final resolved site condition proof</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Completion Summary *</label>
                      <input
                        type="text"
                        value={completionSummary}
                        onChange={e => setCompletionSummary(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Materials & Equipment Used</label>
                      <input
                        type="text"
                        value={materialsUsed}
                        onChange={e => setMaterialsUsed(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-heritage-charcoal dark:text-heritage-stone mb-1">Field Technician Remarks & Notes</label>
                      <textarea
                        rows={2}
                        value={workerNotes}
                        onChange={e => setWorkerNotes(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport || selectedTask.status === 'PENDING_VERIFICATION'}
                    className="w-full py-3 rounded-xl bg-heritage-green hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReport ? 'Submitting Report…' : selectedTask.status === 'PENDING_VERIFICATION' ? 'Completion Report Submitted · Awaiting Supervisor Sign-Off' : 'Submit Completion Report for Supervisor Verification'}</span>
                  </button>
                </form>
              )}

              {/* Progress Update & Blocker Form */}
              {selectedTask.status === 'IN_PROGRESS' && (
                <form onSubmit={handleProgressUpdate} className="p-4 rounded-xl bg-heritage-stone/20 border border-heritage-stone space-y-3 text-xs">
                  <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory block">Option: Log Progress Note or Report Blocker</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={progressNotes}
                      onChange={e => setProgressNotes(e.target.value)}
                      placeholder="e.g. Awaiting additional suction hose at site..."
                      className="flex-1 p-2 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs"
                    />
                    <button
                      type="submit"
                      disabled={submittingProgress || !progressNotes.trim()}
                      className="px-4 py-2 rounded-xl bg-heritage-maroon text-white font-bold hover:bg-heritage-maroon-dark disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBlocker}
                      onChange={e => setIsBlocker(e.target.checked)}
                      className="rounded border-heritage-stone text-heritage-maroon"
                    />
                    <span className="font-bold text-heritage-red">Report as Critical Blocker to Supervisor</span>
                  </label>
                </form>
              )}
            </div>

            {/* ── SECTION F: CHRONOLOGICAL TASK AUDIT TIMELINE ─────────────────── */}
            <div className="pt-4 border-t border-heritage-stone space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Section F: Audit Timeline & Task History
              </h3>

              <div className="space-y-2">
                {selectedTask.history && selectedTask.history.length > 0 ? (
                  selectedTask.history.map((ev, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone/60 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-heritage-maroon dark:text-heritage-gold">{ev.event_type}</span>
                        <span className="text-[10px] font-mono text-heritage-aged">{new Date(ev.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-heritage-aged">{ev.message}</p>
                      <span className="text-[10px] font-mono text-heritage-aged/80 block">Actor: {ev.actor_name} ({ev.actor_role})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-heritage-aged italic">No historical timeline recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: WORKER PROFILE ───────────────────────────────────────────── */}
      {activeTab === 'PROFILE' && profile && (
        <div className="bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center space-x-4 border-b border-heritage-stone pb-4">
            <div className="w-16 h-16 rounded-2xl bg-heritage-maroon text-heritage-gold flex items-center justify-center font-bold text-xl shadow-heritage">
              BM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">{profile.full_name}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-heritage-gold/20 text-heritage-charcoal">
                  {profile.worker_code}
                </span>
              </div>
              <p className="text-xs text-heritage-aged">{profile.designation} · {profile.department_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-1">
              <span className="text-[10px] font-bold text-heritage-aged uppercase block">Official Work Phone</span>
              <p className="font-mono font-bold text-heritage-charcoal dark:text-heritage-ivory">{profile.phone}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-1">
              <span className="text-[10px] font-bold text-heritage-aged uppercase block">Duty Status</span>
              <p className="font-bold text-emerald-600">{profile.duty_status.replace('_', ' ')}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-1">
              <span className="text-[10px] font-bold text-heritage-aged uppercase block">Reporting Supervisor</span>
              <p className="font-semibold text-heritage-maroon dark:text-heritage-gold">{profile.supervisor_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-1">
              <span className="text-[10px] font-bold text-heritage-aged uppercase block">Assigned Municipal Zone</span>
              <p className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">{profile.assigned_zone}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REJECT ASSIGNMENT DIALOG ──────────────────────────────────── */}
      {showRejectModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-heritage-charcoal max-w-md w-full rounded-2xl border border-heritage-stone p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
              <h3 className="font-serif font-bold text-base text-rose-700 dark:text-rose-400">
                Reject Work Order TSK-{selectedTask.id}
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-heritage-aged hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-heritage-charcoal dark:text-heritage-stone">Reason for Rejection *</label>
                <select
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs font-semibold"
                >
                  <option value="Wrong department">Wrong Department / Assignment</option>
                  <option value="Equipment unavailable">Equipment / Material Unavailable</option>
                  <option value="Worker unavailable">Worker Unavailable / Off Duty</option>
                  <option value="Safety concern">Safety Hazard at Location</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-heritage-charcoal dark:text-heritage-stone">Explanation Notes *</label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={e => setRejectNotes(e.target.value)}
                  placeholder="Explain why this task is being rejected..."
                  className="w-full p-2.5 rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-heritage-stone">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject || !rejectNotes.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  {submittingReject ? 'Submitting…' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
