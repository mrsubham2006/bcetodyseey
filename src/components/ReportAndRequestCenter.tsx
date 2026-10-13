import React, { useState, useEffect, useRef } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';
import {
  AlertTriangle, CheckCircle, Clock, MapPin, Camera, Mic, Send,
  RefreshCw, ArrowLeft, Star, Download, MessageSquare, ThumbsUp,
  Shield, Phone, X, Search, Navigation, Droplets, CloudRain,
  TreePine, ChevronRight, Copy, CheckCircle2, AlertCircle, Wifi,
  Upload, Trash2, Eye, Compass, HelpCircle, FileText, Zap,
  Layers, Volume2, StopCircle, RefreshCcw, Sparkles, Building2,
  Users, Check, ExternalLink, Printer
} from 'lucide-react';

export interface CategoryItem {
  id: number;
  service_type: string;
  code: string;
  name: string;
  name_or?: string;
  group_name: string;
  group_name_or?: string;
  description?: string;
  icon: string;
  target_department?: string;
  default_sla_hours: number;
  requires_location: boolean;
  requires_evidence: boolean;
  custom_questions?: Array<{ id: string; label: string; type: string; options?: string[] }>;
}

export interface EvidenceItem {
  file_id: string;
  url: string;
  filename: string;
  size_bytes: number;
  type: string;
  checksum?: string;
  previewUrl?: string;
}

export interface DuplicateMatch {
  ticket_id: string;
  title: string;
  category: string;
  status: string;
  address: string;
  distance_meters: number;
  last_updated: string;
  report_count: number;
}

export interface ReceiptData {
  ticket_id: string;
  service_type: string;
  title: string;
  category: string;
  description: string;
  status: string;
  address: string;
  latitude: number;
  longitude: number;
  department_assigned: string;
  sla_target_hours: number;
  submitted_at: string;
  citizen_name: string;
  evidence_count: number;
  initial_event: {
    event: string;
    description: string;
    timestamp: string;
    status: string;
  };
  tracking_qr_data: string;
}

const SERVICE_TYPES = [
  { id: 'PROBLEM', label: 'Report a Problem', labelOr: 'ସମସ୍ୟା ଅଭିଯୋଗ', desc: 'Road damage, garbage overflow, drainage, streetlights & civic faults', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200' },
  { id: 'SERVICE_REQUEST', label: 'Request a Service', labelOr: 'ପୌର ସେବା ଅନୁରୋଧ', desc: 'Avenue tree pruning, mosquito fogging drive, water tanker & municipal services', icon: Sparkles, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { id: 'HAZARD', label: 'Report a Hazard', labelOr: 'ଜରୁରୀ ବିପଦ', desc: 'Life safety hazard: open manhole, fallen electrical lines, unstable structures', icon: Zap, color: 'text-red-700 bg-red-100 dark:bg-red-950/50 border-red-300' },
  { id: 'FACILITY', label: 'Public Facility Issue', labelOr: 'ସାର୍ବଜନୀନ ସୁବିଧା', desc: 'Problems at public parks, civic toilets, bus shelters, urban gyms', icon: Building2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
  { id: 'FEEDBACK', label: 'Feedback / Suggestion', labelOr: 'ମତାମତ ଓ ପରାମର୍ଶ', desc: 'Civic feedback, service quality concerns, appreciation, public recommendations', icon: MessageSquare, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200' },
  { id: 'COMMUNITY_PROPOSAL', label: 'Community Proposal', labelOr: 'ସାମାଜିକ ଉନ୍ନତି', desc: 'Suggest neighbourhood upgrades, rainwater recharge pits, park installations', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
];

export const ReportAndRequestCenter: React.FC = () => {
  const { citizenUser, isAuthenticated, setShowAuthModal, setAuthMode, navigateTo, refreshCases } = useCitizen();

  // Multi-step state (1 to 7)
  // 1: Service Type, 2: Category, 3: Details, 4: Evidence, 5: Location, 6: Review, 7: Receipt
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<string>('PROBLEM');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [catSearch, setCatSearch] = useState<string>('');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationNotice, setDurationNotice] = useState<string>('Today');
  const [impactLevel, setImpactLevel] = useState<string>('Traffic or movement is obstructed');
  const [isRecurring, setIsRecurring] = useState<string>('No, this is a new issue');
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // Location Fields
  const [address, setAddress] = useState<string>('Rasulgarh Square, Bhubaneswar, Odisha');
  const [landmark, setLandmark] = useState<string>('');
  const [locationAccuracy, setLocationAccuracy] = useState<string>('EXACT');
  const [latitude, setLatitude] = useState<number>(20.2961);
  const [longitude, setLongitude] = useState<number>(85.8245);
  const [gettingGPS, setGettingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Evidence Files
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceRecorded, setVoiceRecorded] = useState<boolean>(false);
  const recordingTimerRef = useRef<any>(null);

  // AI Assistance
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiAssistance, setAiAssistance] = useState<{
    suggested_category: string;
    suggested_subcategory: string;
    recommended_department: string;
    confidence: number;
    refined_title: string;
    refined_description: string;
    missing_info_questions: string[];
    is_emergency_hazard: boolean;
    emergency_guidance?: string | null;
  } | null>(null);

  // Duplicates
  const [checkingDuplicates, setCheckingDuplicates] = useState<boolean>(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [dismissDuplicateNotice, setDismissDuplicateNotice] = useState<boolean>(false);

  // Drafts & Idempotency
  const [draftId, setDraftId] = useState<string | null>(() => localStorage.getItem('civic_active_draft_id'));
  const [draftStatus, setDraftStatus] = useState<string>('Saved');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Submission & Receipt
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  // Language display toggle (Odia / English)
  const [preferOdia, setPreferOdia] = useState<boolean>(false);

  // Load categories from API
  useEffect(() => {
    fetch(`/api/v1/report-center/categories?service_type=${serviceType}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0 && !selectedCategory) {
            setSelectedCategory(data[0]);
          }
        }
      })
      .catch(() => {});
  }, [serviceType]);

  // Auto-Save Draft Debounce
  useEffect(() => {
    if (currentStep === 7) return; // don't auto-save after submission
    if (!title && !description) return;

    setDraftStatus('Saving…');
    const timer = setTimeout(() => {
      fetch('/api/v1/report-center/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: draftId,
          service_type: serviceType,
          category: selectedCategory?.name || 'Roads & Footpaths',
          title,
          description,
          duration_notice: durationNotice,
          impact_level: impactLevel,
          is_recurring: isRecurring,
          location_address: address,
          location_landmark: landmark,
          location_accuracy: locationAccuracy,
          latitude,
          longitude,
          evidence_items: evidenceList,
          current_step: currentStep,
          custom_answers: customAnswers
        })
      })
        .then(r => r.json())
        .then(d => {
          if (d.draft_id) {
            setDraftId(d.draft_id);
            localStorage.setItem('civic_active_draft_id', d.draft_id);
            setDraftStatus(`Saved at ${d.last_saved}`);
          }
        })
        .catch(() => {
          setDraftStatus('Local backup active');
        });
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, description, address, selectedCategory, currentStep, evidenceList, customAnswers]);

  // Check duplicate when moving to Location step
  const runDuplicateCheck = () => {
    setCheckingDuplicates(true);
    fetch('/api/v1/report-center/duplicate-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        category: selectedCategory?.name || 'Roads & Footpaths',
        title
      })
    })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setDuplicates(d);
        setCheckingDuplicates(false);
      })
      .catch(() => setCheckingDuplicates(false));
  };

  // AI Assist trigger
  const requestAIAssistance = () => {
    if (!description && !title) return;
    setAiAnalyzing(true);
    fetch('/api/v1/report-center/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${title}. ${description}` })
    })
      .then(r => r.json())
      .then(res => {
        setAiAssistance(res);
        setAiAnalyzing(false);
      })
      .catch(() => setAiAnalyzing(false));
  };

  // GPS Location handler
  const handleGPSLocation = () => {
    setGettingGPS(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please enter address manually.');
      setGettingGPS(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        setAddress(`GPS Pinned: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Bhubaneswar Urban Area)`);
        setLocationAccuracy('EXACT');
        setGettingGPS(false);
        runDuplicateCheck();
      },
      err => {
        setGpsError('GPS signal unavailable or location permission denied. You can manually enter or adjust the address below.');
        setGettingGPS(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Evidence File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingFile(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (draftId) formData.append('draft_id', draftId);

    fetch('/api/v1/report-center/evidence/upload', {
      method: 'POST',
      body: formData
    })
      .then(async res => {
        const d = await res.json();
        if (!res.ok) {
          throw new Error(d.detail || 'File upload failed');
        }
        setEvidenceList(prev => [...prev, {
          file_id: d.file_id,
          url: d.url,
          filename: d.filename,
          size_bytes: d.size_bytes,
          type: d.type,
          checksum: d.checksum,
          previewUrl: URL.createObjectURL(file)
        }]);
        setUploadingFile(false);
      })
      .catch(err => {
        setUploadError(err.message || 'Network error during upload. You can retry safely.');
        setUploadingFile(false);
      });
  };

  const removeEvidence = (fileId: string) => {
    setEvidenceList(prev => prev.filter(f => f.file_id !== fileId));
  };

  // Voice recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setVoiceRecorded(true);
      if (!description) {
        setDescription('Recorded voice complaint attached: High water stagnation obstructing traffic.');
      }
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
  };

  // Final Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      idempotency_key: idempotencyKey,
      draft_id: draftId,
      service_type: serviceType,
      category: selectedCategory?.name || 'Roads & Footpaths',
      title: title.trim(),
      description: description.trim(),
      duration_notice: durationNotice,
      impact_level: impactLevel,
      is_recurring: isRecurring,
      location_address: address.trim(),
      location_landmark: landmark.trim() || undefined,
      location_accuracy: locationAccuracy,
      latitude,
      longitude,
      evidence_items: evidenceList,
      custom_answers: customAnswers,
      declaration_accepted: true,
      reporter_name: citizenUser?.name || 'Verified Citizen',
      reporter_phone: citizenUser?.phone || '+91 94370 00000'
    };

    try {
      const res = await fetch('/api/v1/report-center/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Report submission failed on server.');
      }

      setReceipt(data);
      setCurrentStep(7);
      localStorage.removeItem('civic_active_draft_id');
      await refreshCases();
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error. Your form draft has been preserved. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEvidenceList([]);
    setReceipt(null);
    setIdempotencyKey(`IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    setDraftId(null);
    localStorage.removeItem('civic_active_draft_id');
    setCurrentStep(1);
  };

  // Filter categories by search
  const filteredCategories = categories.filter(c =>
    !catSearch ||
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.group_name.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.name_or && c.name_or.includes(catSearch))
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-28 lg:pb-12 space-y-6">
      {/* ── HEADER WITH ODISHA MOTIF ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-heritage-charcoal p-5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-heritage-maroon text-heritage-gold shadow-sm">
            <KonarkWheelIcon size={26} className="text-heritage-gold animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-heritage-maroon dark:text-heritage-gold">
                Report & Request Center
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-heritage-gold/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-gold/40">
                Module 02
              </span>
            </div>
            <p className="text-xs text-heritage-aged mt-0.5">
              {preferOdia ? 'ସୁରକ୍ଷିତ ନାଗରିକ ଅଭିଯୋଗ ଓ ପୌର ସେବା ପ୍ରବେଶ ପୋର୍ଟାଲ' : 'Intelligent civic reporting, service requests & verified municipal resolution'}
            </p>
          </div>
        </div>

        {/* Header Badges: Language toggle & Draft Autosave Indicator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setPreferOdia(!preferOdia)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-heritage-maroon dark:text-heritage-gold" />
            <span>{preferOdia ? 'English' : 'ଓଡ଼ିଆ'}</span>
          </button>

          {currentStep < 7 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 text-[11px] text-heritage-aged">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{draftStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP PROGRESS BAR (Steps 1 to 6) ─────────────────────────────────── */}
      {currentStep < 7 && (
        <div className="bg-white dark:bg-heritage-charcoal p-4 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Service', labelOr: 'ସେବା' },
              { num: 2, label: 'Category', labelOr: 'ବିଭାଗ' },
              { num: 3, label: 'Details', labelOr: 'ବିବରଣୀ' },
              { num: 4, label: 'Evidence', labelOr: 'ପ୍ରମାଣ' },
              { num: 5, label: 'Location', labelOr: 'ସ୍ଥାନ' },
              { num: 6, label: 'Review', labelOr: 'ସମୀକ୍ଷା' },
            ].map(s => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <div key={s.num} className="flex-1 flex flex-col items-center relative">
                  <div
                    onClick={() => isPast && setCurrentStep(s.num)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-heritage-maroon text-white ring-4 ring-heritage-gold/30 shadow-md scale-105'
                        : isPast
                        ? 'bg-heritage-green text-white shadow-sm'
                        : 'bg-heritage-stone/40 dark:bg-heritage-charcoal-dark text-heritage-aged border border-heritage-stone'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 text-white" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1.5 hidden sm:block ${isActive ? 'text-heritage-maroon dark:text-heritage-gold' : 'text-heritage-aged'}`}>
                    {preferOdia ? s.labelOr : s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: SERVICE TYPE SELECTION ─────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
              {preferOdia ? 'ଆପଣ କେଉଁ ସେବା ପାଇଁ ଆବେଦନ କରିବାକୁ ଚାହାଁନ୍ତି?' : 'How can we help you today?'}
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Choose an option to get the specialized civic form tailored to your municipal issue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {SERVICE_TYPES.map(st => {
              const Icon = st.icon;
              const isSelected = serviceType === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setServiceType(st.id);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/5 shadow-heritage ring-2 ring-heritage-maroon/20'
                      : 'border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold bg-white dark:bg-heritage-charcoal'
                  }`}
                >
                  <div>
                    <div className={`p-2.5 rounded-xl w-fit mb-3 border ${st.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                      {preferOdia ? st.labelOr : st.label}
                    </h3>
                    <p className="text-[11px] text-heritage-aged mt-1 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-heritage-maroon dark:text-heritage-gold">
                    <span>{isSelected ? 'Selected ✓' : 'Select'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark shadow-sm transition-all"
            >
              <span>Continue to Categories</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: SMART CATEGORY SELECTION ────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
              {preferOdia ? 'ସମସ୍ୟା ବର୍ଗ ଏବଂ ବିଭାଗ ଚୟନ କରନ୍ତୁ' : 'Smart Category Selection'}
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Select the municipal domain. AI automatically suggests suitable departments & resolution SLAs.
            </p>
          </div>

          {/* Search Category */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
            <input
              type="text"
              value={catSearch}
              onChange={e => setCatSearch(e.target.value)}
              placeholder="Search category, e.g. pothole, waterlogging, waste, light, drain..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
            />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {filteredCategories.map(cat => {
              const isSelected = selectedCategory?.code === cat.code;
              return (
                <div
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'border-heritage-maroon bg-heritage-maroon/10 dark:border-heritage-gold dark:bg-heritage-gold/10 ring-1 ring-heritage-maroon'
                      : 'border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold bg-white dark:bg-heritage-charcoal'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged">
                        {preferOdia && cat.group_name_or ? cat.group_name_or : cat.group_name}
                      </span>
                      <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory mt-0.5">
                        {preferOdia && cat.name_or ? cat.name_or : cat.name}
                      </h4>
                      <p className="text-[10px] text-heritage-aged mt-0.5 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold shrink-0 ml-2" />
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-heritage-aged pt-2 border-t border-heritage-stone/40">
                    <span className="text-heritage-blue font-medium truncate max-w-[150px]">{cat.target_department}</span>
                    <span className="font-mono bg-heritage-stone/30 px-1.5 py-0.5 rounded">SLA: {cat.default_sla_hours}h</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Helper Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start space-x-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Not sure of the exact technical category?</span> No worries! In the next step, our AI engine will read your description and auto-recommend the correct department.
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!selectedCategory}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark disabled:opacity-50"
            >
              <span>Continue to Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: ISSUE DETAILS FORM & AI ASSISTANCE ─────────────────────── */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
                {preferOdia ? 'ସମସ୍ୟାର ବିସ୍ତୃତ ବିବରଣୀ ଦିଅନ୍ତୁ' : 'Describe the Issue'}
              </h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Selected Category: <span className="font-semibold text-heritage-maroon dark:text-heritage-gold">{selectedCategory?.name}</span>
              </p>
            </div>
            <button
              onClick={requestAIAssistance}
              disabled={aiAnalyzing || (!title && !description)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-heritage-gold/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-gold/50 text-xs font-semibold hover:bg-heritage-gold/30 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiAnalyzing ? 'Analyzing…' : 'AI Assistant'}</span>
            </button>
          </div>

          {/* AI Feedback Box if available */}
          {aiAssistance && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2 text-xs">
              {aiAssistance.is_emergency_hazard && (
                <div className="p-2.5 rounded-xl bg-red-100 text-red-800 font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{aiAssistance.emergency_guidance}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold text-heritage-charcoal dark:text-heritage-ivory">
                <span>AI Recommendation: {aiAssistance.suggested_category} → {aiAssistance.suggested_subcategory}</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono">{(aiAssistance.confidence * 100).toFixed(0)}% Match</span>
              </div>
              <p className="text-[11px] text-heritage-aged">Department: <strong className="text-heritage-maroon dark:text-heritage-gold">{aiAssistance.recommended_department}</strong></p>
              {aiAssistance.missing_info_questions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-semibold text-[11px] text-amber-900 dark:text-amber-300 mb-1">Helpful details to include:</p>
                  <ul className="list-disc list-inside text-[11px] text-heritage-aged space-y-0.5">
                    {aiAssistance.missing_info_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => {
                    setTitle(aiAssistance.refined_title);
                    setDescription(aiAssistance.refined_description);
                  }}
                  className="px-3 py-1 rounded-lg bg-heritage-maroon text-white text-[11px] font-semibold hover:bg-heritage-maroon-dark"
                >
                  Apply AI Title & Summary
                </button>
              </div>
            </div>
          )}

          {/* Issue Title Input */}
          <div>
            <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Deep pothole causing skidding near Rasulgarh underpass"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
            />
          </div>

          {/* Issue Description & Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone">
                Detailed Description *
              </label>
              <span className="text-[10px] text-heritage-aged">{description.length} characters</span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the hazard, physical condition, and impact on pedestrians or vehicles. Odia, Hindi, or English input supported..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none resize-none"
            />

            {/* Voice-to-Text Button */}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : voiceRecorded
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/50'
                }`}
              >
                {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold" />}
                <span>
                  {isRecording
                    ? `Recording voice note (${recordingSeconds}s)… Click to stop`
                    : voiceRecorded
                    ? 'Voice Note Attached ✓'
                    : 'Record Speech-to-Text Voice Description'}
                </span>
              </button>
              <span className="text-[10px] text-heritage-aged italic">English, Odia & Hindi speech supported</span>
            </div>
          </div>

          {/* Conditional Context Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">When did you notice it?</label>
              <select
                value={durationNotice}
                onChange={e => setDurationNotice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="Today">Today</option>
                <option value="In the last few days">In the last few days</option>
                <option value="Longer ago">Longer ago</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">What is the impact?</label>
              <select
                value={impactLevel}
                onChange={e => setImpactLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="Minor inconvenience">Minor inconvenience</option>
                <option value="Access is difficult">Access is difficult</option>
                <option value="Traffic or movement is obstructed">Traffic or movement is obstructed</option>
                <option value="Possible safety hazard">Possible safety hazard</option>
                <option value="Other / not sure">Other / not sure</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Does this recur?</label>
              <select
                value={isRecurring}
                onChange={e => setIsRecurring(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="No, this is a new issue">No, new issue</option>
                <option value="Yes, it happens repeatedly">Repeated issue</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>

          {/* Dynamic Custom Category Questions if any */}
          {selectedCategory?.custom_questions && selectedCategory.custom_questions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/40 space-y-3">
              <p className="text-[11px] font-bold text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">
                Category-Specific Information ({selectedCategory.name})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCategory.custom_questions.map(q => (
                  <div key={q.id}>
                    <label className="block text-[11px] font-semibold text-heritage-aged mb-1">{q.label}</label>
                    {q.type === 'select' ? (
                      <select
                        value={customAnswers[q.id] || ''}
                        onChange={e => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
                      >
                        <option value="">-- Choose option --</option>
                        {q.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customAnswers[q.id] || ''}
                        onChange={e => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                        placeholder="e.g., Pole #24 or approx detail"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!title.trim() || !description.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark disabled:opacity-50"
            >
              <span>Continue to Evidence</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: EVIDENCE CENTER (PHOTOS, VIDEO & PRIVACY) ──────────────── */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
              {preferOdia ? 'ଫଟୋ ଓ ଭିଡିଓ ପ୍ରମାଣ ସଂଲଗ୍ନ କରନ୍ତୁ' : 'Photo, Video & Evidence Center'}
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Visual proof expedites municipal validation and worker deployment. JPG, PNG, WEBP, MP4 supported.
            </p>
          </div>

          {/* Privacy Guidance Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-start space-x-2.5 text-xs text-blue-900 dark:text-blue-200">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Privacy Protection Advisory:</span> Please avoid capturing citizen faces, personal vehicle registration plates, or private property interiors. The system automatically screens photos and redacts identifiers before public tracking displays.
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-2xl p-7 text-center cursor-pointer hover:border-heritage-gold hover:bg-heritage-stone/10 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/mp4"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold flex items-center justify-center mx-auto mb-2.5">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
              Click to capture or upload evidence photo / video
            </p>
            <p className="text-[11px] text-heritage-aged mt-1">
              File integrity checksum computed automatically · Max 15 MB per file
            </p>
            {uploadingFile && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-heritage-maroon font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading and hashing evidence…</span>
              </div>
            )}
            {uploadError && (
              <p className="text-xs text-rose-600 mt-2 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* Uploaded Evidence Gallery */}
          {evidenceList.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                Attached Files ({evidenceList.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map(item => (
                  <div
                    key={item.file_id}
                    className="p-3 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-heritage-stone/40 overflow-hidden flex items-center justify-center shrink-0">
                        {item.previewUrl ? (
                          <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-heritage-aged" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{item.filename}</p>
                        <p className="text-[10px] text-heritage-aged font-mono">{(item.size_bytes / 1024).toFixed(1)} KB · Verified</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEvidence(item.file_id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove evidence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                setCurrentStep(5);
                runDuplicateCheck();
              }}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark shadow-sm"
            >
              <span>Continue to Location</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: SMART LOCATION PIN & DUPLICATE DETECTION ────────────────── */}
      {currentStep === 5 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
              {preferOdia ? 'ସଠିକ୍ ସ୍ଥାନ ଚିହ୍ନଟ କରନ୍ତୁ' : 'Smart Location & Map Pin'}
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Pinpoint the issue spot. Use GPS, search by landmark, or enter manually. GPS permission is never forced.
            </p>
          </div>

          {/* GPS Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleGPSLocation}
              disabled={gettingGPS}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-heritage-blue text-white text-xs font-semibold hover:bg-heritage-blue/90 disabled:opacity-50 transition-all shadow-sm"
            >
              {gettingGPS ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-heritage-gold" />}
              <span>{gettingGPS ? 'Acquiring GPS Signal…' : 'Use My Current GPS Location'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-heritage-aged">Accuracy:</span>
              {(['EXACT', 'APPROXIMATE', 'NOT_SURE'] as const).map(acc => (
                <button
                  key={acc}
                  onClick={() => setLocationAccuracy(acc)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border ${
                    locationAccuracy === acc
                      ? 'border-heritage-maroon bg-heritage-maroon text-white'
                      : 'border-heritage-stone text-heritage-aged'
                  }`}
                >
                  {acc.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {gpsError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Manual Address & Landmark */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                Street Address / Area *
              </label>
              <input
                type="text"
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  runDuplicateCheck();
                }}
                placeholder="e.g., Rasulgarh Square, Underpass, NH-16, Bhubaneswar"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-charcoal dark:text-heritage-stone mb-1">
                Nearby Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder="e.g., Opposite IOCL Petrol Station, near Durga Puja Ground"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Map Preview Graphic */}
          <div className="p-4 rounded-2xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-heritage-maroon/10 text-heritage-maroon">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                Pinned: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
              </p>
              <p className="text-[11px] text-heritage-aged mt-0.5">{address}</p>
            </div>
            <div className="flex space-x-2 pt-1 text-[10px]">
              <span className="bg-heritage-gold/20 text-heritage-maroon px-2 py-0.5 rounded font-mono">Bhubaneswar Ward 28</span>
              <span className="bg-heritage-blue/20 text-heritage-blue px-2 py-0.5 rounded font-mono">Zone: North Central</span>
            </div>
          </div>

          {/* DUPLICATE DETECTION PROACTIVE SUGGESTION */}
          {duplicates.length > 0 && !dismissDuplicateNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    Similar active report found nearby ({duplicates[0].distance_meters}m away)
                  </span>
                </div>
                <button
                  onClick={() => setDismissDuplicateNotice(true)}
                  className="text-[10px] text-amber-800 hover:underline"
                >
                  Dismiss
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-heritage-charcoal border border-amber-200 text-xs space-y-1">
                <p className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">{duplicates[0].title}</p>
                <p className="text-[11px] text-heritage-aged">{duplicates[0].address}</p>
                <div className="flex items-center space-x-2 text-[10px] pt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Ticket: {duplicates[0].ticket_id}</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">{duplicates[0].status}</span>
                  <span className="text-heritage-aged">Updated {duplicates[0].last_updated}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <button
                  onClick={() => {
                    alert(`Now following existing ticket ${duplicates[0].ticket_id}. You will receive push notifications as repair updates proceed.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                >
                  Follow This Existing Report
                </button>
                <button
                  onClick={() => setDismissDuplicateNotice(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-amber-300 text-amber-900 dark:text-amber-200 font-semibold hover:bg-amber-100/50"
                >
                  This Is a Different Issue
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              disabled={!address.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark disabled:opacity-50"
            >
              <span>Review Report</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: REVIEW, PRIVACY & SECURE SUBMIT ────────────────────────── */}
      {currentStep === 6 && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-5 animate-fade-in">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
              {preferOdia ? 'ଦାଖଲ କରିବା ପୂର୍ବରୁ ସମୀକ୍ଷା କରନ୍ତୁ' : 'Review & Confirm Report'}
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Verify your information before submission. A tamper-proof ticket ID and timeline receipt will be generated.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="space-y-3">
            {/* Card 1: Issue details */}
            <div className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged">Category & Title</span>
                <p className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{title}</p>
                <p className="text-xs text-heritage-aged">{description}</p>
                <div className="flex space-x-2 pt-1 text-[10px] text-heritage-aged">
                  <span>Notice: <strong>{durationNotice}</strong></span>
                  <span>·</span>
                  <span>Impact: <strong>{impactLevel}</strong></span>
                </div>
              </div>
              <button onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline shrink-0 ml-3">Edit</button>
            </div>

            {/* Card 2: Location */}
            <div className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged">Location</span>
                <p className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">{address}</p>
                {landmark && <p className="text-[11px] text-heritage-aged">Landmark: {landmark}</p>}
                <p className="text-[10px] text-heritage-aged font-mono">Coordinates: {latitude}, {longitude} ({locationAccuracy})</p>
              </div>
              <button onClick={() => setCurrentStep(5)} className="text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline shrink-0 ml-3">Edit</button>
            </div>

            {/* Card 3: Evidence */}
            <div className="p-4 rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged">Attached Evidence</span>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory font-semibold">
                  {evidenceList.length > 0 ? `${evidenceList.length} files attached and hashed` : 'No visual evidence attached (Optional)'}
                </p>
                {voiceRecorded && <p className="text-[10px] text-green-600 font-semibold">✓ Voice note transcript attached</p>}
              </div>
              <button onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline shrink-0 ml-3">Edit</button>
            </div>
          </div>

          {/* Privacy & Citizen Declaration */}
          <div className="p-4 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-xs text-heritage-aged space-y-2 border border-heritage-stone/50">
            <div className="flex items-center space-x-2 font-semibold text-heritage-charcoal dark:text-heritage-ivory">
              <Shield className="w-4 h-4 text-heritage-maroon" />
              <span>Citizen Privacy & Submission Declaration</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Your report is authenticated and assigned an official tracking ticket.</li>
              <li>Only authorized municipal engineers and deployed ground workers can access the exact location.</li>
              <li>Double-tap protection and idempotency keys ensure no duplicate tickets are generated.</li>
            </ul>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-heritage-maroon to-heritage-maroon-dark text-white text-xs font-bold hover:brightness-110 shadow-heritage disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering with Server…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-heritage-gold" />
                  <span>Submit Report & Generate Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 7: RECEIPT, TICKET ID & TIMELINE CONFIRMATION ─────────────── */}
      {currentStep === 7 && receipt && (
        <div className="bg-white dark:bg-heritage-charcoal p-6 sm:p-8 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-heritage space-y-6 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              Report Successfully Registered!
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Your civic report has been persisted in CIVIC NEXUS AI and assigned to the municipal dispatch desk.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-gold/50 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-aged">Official Ticket ID</span>
            <div className="flex items-center justify-center space-x-3">
              <span className="font-mono text-2xl font-bold text-heritage-maroon dark:text-heritage-gold tracking-wider">
                {receipt.ticket_id}
              </span>
              <button
                onClick={() => copyToClipboard(receipt.ticket_id)}
                className="p-1.5 rounded-lg bg-heritage-stone/40 hover:bg-heritage-stone text-heritage-charcoal dark:text-heritage-ivory transition-colors"
                title="Copy Ticket ID"
              >
                {showCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-heritage-aged">
              Save or screenshot this ID. You can track ground resolution progress anytime.
            </p>
          </div>

          {/* Receipt Details Table */}
          <div className="max-w-lg mx-auto text-left rounded-xl border border-heritage-stone dark:border-heritage-charcoal divide-y divide-heritage-stone dark:divide-heritage-charcoal text-xs">
            <div className="p-3 flex justify-between bg-heritage-stone/10">
              <span className="text-heritage-aged">Assigned Department</span>
              <strong className="text-heritage-charcoal dark:text-heritage-ivory">{receipt.department_assigned}</strong>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-heritage-aged">SLA Target Resolution</span>
              <span className="font-mono font-semibold text-emerald-600">{receipt.sla_target_hours} Hours</span>
            </div>
            <div className="p-3 flex justify-between bg-heritage-stone/10">
              <span className="text-heritage-aged">Submission Timestamp</span>
              <span>{receipt.submitted_at}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-heritage-aged">Issue Location</span>
              <span className="truncate max-w-[280px]">{receipt.address}</span>
            </div>
            <div className="p-3 flex justify-between bg-heritage-stone/10">
              <span className="text-heritage-aged">Verification QR Token</span>
              <span className="font-mono text-[10px] bg-heritage-stone/40 px-2 py-0.5 rounded">{receipt.tracking_qr_data}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('cases')}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-all shadow-sm"
            >
              <span>Track in My Cases</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory hover:border-heritage-gold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={resetForm}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-heritage-stone text-xs font-semibold text-heritage-aged hover:text-heritage-charcoal transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
