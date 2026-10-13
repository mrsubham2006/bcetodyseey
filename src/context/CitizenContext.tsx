import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CitizenSection =
  | 'home'
  | 'report'
  | 'report_details'
  | 'report_location'
  | 'report_evidence'
  | 'report_review'
  | 'cases'
  | 'case_detail'
  | 'city_map'
  | 'city_alerts'
  | 'community'
  | 'tourism'
  | 'inbox'
  | 'records'
  | 'profile'
  | 'help';

export interface CitizenCase {
  id: string;
  ticket_id: string;
  title: string;
  category: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'AWAITING_CITIZEN' | 'COMPLETED' | 'DISPUTED' | 'CLOSED';
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  department?: string;
  created_at: string;
  updated_at: string;
  last_event: string;
  unread_updates: number;
  evidence_urls: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  event: string;
  description: string;
  timestamp: string;
  source: string;
  action_required?: boolean;
}

export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  city: string;
  avatar_initials: string;
  token?: string;
  address_line?: string;
  locality?: string;
  state?: string;
  postal_code?: string;
  preferred_language?: string;
  mobile_verified?: boolean;
  email_verified?: boolean;
}

export interface DraftReport {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  last_saved: string;
  step: number;
}

export interface CitizenNotification {
  id: string;
  type: 'CASE' | 'CITY' | 'MESSAGE';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  case_id?: string;
}

interface RegisterData {
  full_name: string;
  mobile: string;
  email?: string;
  password: string;
  confirm_password: string;
  address_line?: string;
  locality?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  preferred_language?: string;
  consent: boolean;
}

interface CitizenContextType {
  // Auth
  citizenUser: CitizenUser | null;
  token: string | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'register' | 'otp' | 'forgot' | 'reset';
  setShowAuthModal: (v: boolean) => void;
  setAuthMode: (m: 'login' | 'register' | 'otp' | 'forgot' | 'reset') => void;
  loginCitizen: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; pendingMobile?: string }>;
  registerCitizen: (data: RegisterData) => Promise<{ success: boolean; error?: string; dev_otp?: string; mobile?: string; code?: string }>;
  verifyOTP: (mobile: string, otp: string, purpose?: string) => Promise<{ success: boolean; error?: string }>;
  resendOTP: (mobile: string, purpose?: string) => Promise<{ success: boolean; error?: string; dev_otp?: string }>;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; error?: string; mobile?: string; dev_otp?: string }>;
  resetPassword: (mobile: string, otp: string, newPass: string, confirmPass: string) => Promise<{ success: boolean; error?: string }>;
  updateCitizenProfile: (updates: any) => Promise<{ success: boolean; error?: string; otpRequired?: boolean; dev_otp?: string }>;
  logoutCitizen: () => void;
  // Navigation
  activeSection: CitizenSection;
  navigateTo: (section: CitizenSection, params?: any) => void;
  navParams: any;
  // Data
  cases: CitizenCase[];
  drafts: DraftReport[];
  citizenNotifs: CitizenNotification[];
  unreadCitizenNotifs: number;
  refreshCases: () => Promise<void>;
  // Report form
  reportDraft: Partial<DraftReport & { latitude: number; longitude: number; evidence_urls: string[] }>;
  updateReportDraft: (fields: any) => void;
  clearReportDraft: () => void;
  submitReport: () => Promise<{ success: boolean; ticket_id?: string; error?: string }>;
  submitting: boolean;
  // Case actions
  selectedCaseId: string | null;
  selectCase: (id: string) => void;
  markNotifRead: (id: string) => void;
}

const CitizenContext = createContext<CitizenContextType | undefined>(undefined);

const DEMO_CASES: CitizenCase[] = [
  {
    id: 'c1', ticket_id: 'CNX-2026-008421',
    title: 'Pothole causing accidents near Rasulgarh Underpass',
    category: 'Road Damage', status: 'IN_PROGRESS',
    description: 'Large pothole nearly 2 ft wide, causing vehicles to swerve dangerously.',
    address: 'Rasulgarh Underpass, NH-16, Bhubaneswar',
    latitude: 20.2961, longitude: 85.8245,
    department: 'Public Works Department',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_event: 'Municipal team updates repair progress',
    unread_updates: 2,
    evidence_urls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'],
    timeline: [
      { id: 't1', event: 'Report Submitted', description: 'Your complaint was received and assigned code CNX-2026-008421.', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), source: 'Citizen', action_required: false },
      { id: 't2', event: 'AI Verified', description: 'AI confirmed road damage category. Forwarded to Public Works.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), source: 'AI Engine', action_required: false },
      { id: 't3', event: 'Assigned to Department', description: 'Public Works Department accepted the task.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), source: 'Department', action_required: false },
      { id: 't4', event: 'Site Inspection Done', description: 'Field inspector visited and confirmed the pothole depth.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), source: 'Field Worker', action_required: false },
      { id: 't5', event: 'Repair in Progress', description: 'Road patching crew deployed. Expected completion: tomorrow.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), source: 'Department', action_required: false },
    ]
  },
  {
    id: 'c2', ticket_id: 'CNX-2026-007391',
    title: 'Broken streetlight near Master Canteen Square',
    category: 'Streetlight Failure', status: 'AWAITING_CITIZEN',
    description: '3 consecutive streetlights non-functional for past 6 days.',
    address: 'Master Canteen Square, Bhubaneswar',
    latitude: 20.2696, longitude: 85.8409,
    department: 'Electricity Department',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    last_event: 'Department submitted repair evidence — please review',
    unread_updates: 1,
    evidence_urls: [],
    timeline: [
      { id: 't1', event: 'Report Submitted', description: 'Complaint received. Ticket: CNX-2026-007391', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), source: 'Citizen', action_required: false },
      { id: 't2', event: 'Assigned to Electricity Department', description: 'Streetlight unit inspection scheduled.', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), source: 'Department', action_required: false },
      { id: 't3', event: 'Repair Completed', description: 'Lights restored. Please confirm resolution.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), source: 'Field Worker', action_required: true },
    ]
  },
  {
    id: 'c3', ticket_id: 'CNX-2026-006102',
    title: 'Garbage overflow at Unit-4 Market',
    category: 'Garbage Accumulation', status: 'CLOSED',
    description: 'Waste not collected for 4 days causing stench and health risk.',
    address: 'Unit-4 Market, Bhubaneswar',
    latitude: 20.2799, longitude: 85.8421,
    department: 'Sanitation Department',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    last_event: 'Confirmed resolved by citizen',
    unread_updates: 0,
    evidence_urls: [],
    timeline: [
      { id: 't1', event: 'Report Submitted', description: 'Complaint received.', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), source: 'Citizen', action_required: false },
      { id: 't2', event: 'Garbage Cleared', description: 'Sanitation team cleared all accumulated waste.', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), source: 'Department', action_required: false },
      { id: 't3', event: 'Citizen Confirmed', description: 'You confirmed the issue is resolved.', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), source: 'Citizen', action_required: false },
    ]
  },
];

const DEMO_NOTIFS: CitizenNotification[] = [
  { id: 'n1', type: 'CASE', title: 'Action Required — CNX-2026-007391', message: 'Department submitted repair evidence. Please review and confirm resolution.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), is_read: false, case_id: 'c2' },
  { id: 'n2', type: 'CASE', title: 'Repair in Progress — CNX-2026-008421', message: 'Road patching crew deployed at Rasulgarh Underpass. Expected completion: tomorrow.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), is_read: false, case_id: 'c1' },
  { id: 'n3', type: 'CITY', title: 'Water Supply Disruption — Saheed Nagar', message: 'Scheduled maintenance from 6 AM–12 PM on 14 Oct. Store water in advance.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'n4', type: 'CITY', title: 'Cyclone Advisory — Bhubaneswar', message: 'IMD has issued a yellow alert for coastal Odisha. Stay indoors if possible.', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), is_read: true },
];

export const CitizenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [citizenUser, setCitizenUser] = useState<CitizenUser | null>(() => {
    const saved = localStorage.getItem('citizen_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('citizen_token') || null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp' | 'forgot' | 'reset'>('login');
  const [activeSection, setActiveSection] = useState<CitizenSection>('home');
  const [navParams, setNavParams] = useState<any>(null);
  const [cases, setCases] = useState<CitizenCase[]>(DEMO_CASES);
  const [drafts] = useState<DraftReport[]>([]);
  const [citizenNotifs, setCitizenNotifs] = useState<CitizenNotification[]>(DEMO_NOTIFS);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportDraft, setReportDraft] = useState<any>({
    title: '', category: 'Road Damage', description: '',
    address: 'Bhubaneswar, Odisha', latitude: 20.2961, longitude: 85.8245,
    evidence_urls: [], step: 1,
  });

  const isAuthenticated = !!(citizenUser && token);
  const unreadCitizenNotifs = citizenNotifs.filter(n => !n.is_read).length;

  const buildUserFromProfile = (p: any, jwtToken: string): CitizenUser => {
    const name = p.full_name || 'Citizen';
    const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CN';
    return {
      id: String(p.id),
      name,
      email: p.normalized_email || '',
      phone: p.normalized_mobile || '',
      ward: p.locality || p.address_line || 'Bhubaneswar Ward',
      city: p.city || 'Bhubaneswar, Odisha',
      avatar_initials: initials,
      token: jwtToken,
      address_line: p.address_line,
      locality: p.locality,
      state: p.state,
      postal_code: p.postal_code,
      preferred_language: p.preferred_language || 'en',
      mobile_verified: p.mobile_verified,
      email_verified: p.email_verified,
    };
  };

  // Fetch real profile on startup if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/v1/citizen/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => {
        const u = buildUserFromProfile(data, token);
        setCitizenUser(u);
        localStorage.setItem('citizen_user', JSON.stringify(u));
      })
      .catch(() => {
        // Token expired
        logoutCitizen();
      });
    }
  }, [token]);

  // Fetch real citizen reports if authenticated
  const refreshCases = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/citizen/my-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const realReports = await res.json();
        if (Array.isArray(realReports) && realReports.length > 0) {
          const mapped: CitizenCase[] = realReports.map((r: any) => ({
            id: String(r.id),
            ticket_id: r.report_code,
            title: r.title,
            category: r.category,
            status: r.status,
            description: r.description,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
            department: r.department_name || 'Municipal Operations',
            created_at: r.created_at,
            updated_at: r.updated_at,
            last_event: r.last_event || 'Report received',
            unread_updates: r.unread_updates || 0,
            evidence_urls: r.media_urls || [],
            timeline: [
              {
                id: `t_${r.id}`,
                event: 'Report Submitted',
                description: `Complaint logged with code ${r.report_code}`,
                timestamp: r.created_at,
                source: 'Citizen',
                action_required: false
              }
            ]
          }));
          // Merge real reports at top of cases
          setCases([...mapped, ...DEMO_CASES]);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCases();
    }
  }, [isAuthenticated, token]);

  const loginCitizen = async (identifier: string, password: string): Promise<{ success: boolean; error?: string; pendingMobile?: string }> => {
    try {
      const res = await fetch('/api/v1/citizen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.detail && typeof data.detail === 'object') {
          if (data.detail.code === 'PENDING_VERIFICATION') {
            return {
              success: false,
              error: data.detail.message,
              pendingMobile: data.detail.mobile,
            };
          }
          return { success: false, error: data.detail.message || 'Login failed.' };
        }
        return { success: false, error: data.detail || 'Unable to sign in with those credentials. Check your details or recover your account.' };
      }

      const jwtToken = data.access_token;
      const u = buildUserFromProfile(data.citizen, jwtToken);
      setToken(jwtToken);
      setCitizenUser(u);
      localStorage.setItem('citizen_token', jwtToken);
      localStorage.setItem('citizen_user', JSON.stringify(u));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Connection failed. Please check backend server.' };
    }
  };

  const registerCitizen = async (regData: RegisterData): Promise<{ success: boolean; error?: string; dev_otp?: string; mobile?: string; code?: string }> => {
    try {
      const res = await fetch('/api/v1/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.detail && typeof data.detail === 'object') {
          return {
            success: false,
            code: data.detail.code,
            error: data.detail.message,
          };
        }
        return {
          success: false,
          error: typeof data.detail === 'string' ? data.detail : 'Registration failed. Please check your inputs.',
        };
      }

      return {
        success: true,
        dev_otp: data.dev_otp,
        mobile: data.mobile,
      };
    } catch (err: any) {
      return { success: false, error: 'Connection error during registration.' };
    }
  };

  const verifyOTP = async (mobile: string, otp: string, purpose: string = 'MOBILE_VERIFY'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/v1/citizen/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, purpose }),
      });
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: typeof data.detail === 'string' ? data.detail : (data.detail?.message || 'OTP verification failed.'),
        };
      }

      const jwtToken = data.access_token;
      const u = buildUserFromProfile(data.citizen, jwtToken);
      setToken(jwtToken);
      setCitizenUser(u);
      localStorage.setItem('citizen_token', jwtToken);
      localStorage.setItem('citizen_user', JSON.stringify(u));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error while verifying OTP.' };
    }
  };

  const resendOTP = async (mobile: string, purpose: string = 'MOBILE_VERIFY'): Promise<{ success: boolean; error?: string; dev_otp?: string }> => {
    try {
      const res = await fetch(`/api/v1/citizen/resend-otp?mobile=${encodeURIComponent(mobile)}&purpose=${encodeURIComponent(purpose)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Could not resend OTP.' };
      }
      return { success: true, dev_otp: data.dev_otp };
    } catch {
      return { success: false, error: 'Network error during resend OTP.' };
    }
  };

  const forgotPassword = async (identifier: string): Promise<{ success: boolean; error?: string; mobile?: string; dev_otp?: string }> => {
    try {
      const res = await fetch('/api/v1/citizen/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Password recovery request failed.' };
      }
      return { success: true, mobile: data.mobile, dev_otp: data.dev_otp };
    } catch {
      return { success: false, error: 'Network error while requesting password reset.' };
    }
  };

  const resetPassword = async (mobile: string, otp: string, newPass: string, confirmPass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/v1/citizen/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp,
          new_password: newPass,
          confirm_password: confirmPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Password reset failed.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error while resetting password.' };
    }
  };

  const updateCitizenProfile = async (updates: any): Promise<{ success: boolean; error?: string; otpRequired?: boolean; dev_otp?: string }> => {
    if (!token) return { success: false, error: 'Authentication required' };
    try {
      const res = await fetch('/api/v1/citizen/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (res.status === 202) {
        // OTP required for mobile update
        return { success: false, otpRequired: true, dev_otp: data.detail?.dev_otp };
      }

      if (!res.ok) {
        const msg = typeof data.detail === 'object' ? data.detail.message : data.detail;
        return { success: false, error: msg || 'Failed to update profile.' };
      }

      const u = buildUserFromProfile(data, token);
      setCitizenUser(u);
      localStorage.setItem('citizen_user', JSON.stringify(u));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during profile update.' };
    }
  };

  const logoutCitizen = () => {
    setCitizenUser(null);
    setToken(null);
    localStorage.removeItem('citizen_user');
    localStorage.removeItem('citizen_token');
    setActiveSection('home');
  };

  const navigateTo = (section: CitizenSection, params?: any) => {
    setActiveSection(section);
    setNavParams(params ?? null);
    if (section === 'case_detail' && params?.caseId) setSelectedCaseId(params.caseId);
  };

  const updateReportDraft = (fields: any) => setReportDraft((prev: any) => ({ ...prev, ...fields }));
  const clearReportDraft = () => setReportDraft({ title: '', category: 'Road Damage', description: '', address: 'Bhubaneswar, Odisha', latitude: 20.2961, longitude: 85.8245, evidence_urls: [], step: 1 });

  const submitReport = async (): Promise<{ success: boolean; ticket_id?: string; error?: string }> => {
    setSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let endpoint = '/api/v1/reports';

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        endpoint = '/api/v1/citizen/my-reports';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: reportDraft.title,
          category: reportDraft.category,
          description: reportDraft.description,
          address: reportDraft.address,
          latitude: reportDraft.latitude,
          longitude: reportDraft.longitude,
          citizen_name: citizenUser?.name || 'Anonymous',
          citizen_phone: citizenUser?.phone || '',
          media_urls: reportDraft.evidence_urls || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearReportDraft();
        await refreshCases();
        setSubmitting(false);
        return { success: true, ticket_id: data.report_code };
      }
    } catch (_) {}

    clearReportDraft();
    const demoId = `CNX-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    setSubmitting(false);
    return { success: true, ticket_id: demoId };
  };

  const selectCase = (id: string) => setSelectedCaseId(id);
  const markNotifRead = (id: string) => setCitizenNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

  return (
    <CitizenContext.Provider value={{
      citizenUser, token, isAuthenticated, showAuthModal, authMode,
      setShowAuthModal, setAuthMode, loginCitizen, registerCitizen, verifyOTP, resendOTP, forgotPassword, resetPassword, updateCitizenProfile, logoutCitizen,
      activeSection, navigateTo, navParams,
      cases, drafts, citizenNotifs, unreadCitizenNotifs, refreshCases,
      reportDraft, updateReportDraft, clearReportDraft, submitReport, submitting,
      selectedCaseId, selectCase, markNotifRead,
    }}>
      {children}
    </CitizenContext.Provider>
  );
};

export const useCitizen = () => {
  const ctx = useContext(CitizenContext);
  if (!ctx) throw new Error('useCitizen must be used within CitizenProvider');
  return ctx;
};
