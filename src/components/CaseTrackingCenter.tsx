import React, { useState, useEffect } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon, IkatPatternDivider } from './OdishaMotifs';
import {
  Briefcase, Search, Filter, Clock, MapPin, ChevronRight, CheckCircle2,
  AlertTriangle, AlertCircle, ArrowLeft, RefreshCw, Send, Star, ExternalLink,
  Shield, Check, MessageSquare, ThumbsUp, ThumbsDown, Camera, FileText,
  RotateCcw, Sparkles, Building2, User, Eye, Download, Printer, Compass,
  ChevronDown, ChevronUp, Layers, HelpCircle, PhoneCall
} from 'lucide-react';

interface TimelineEvent {
  id: number;
  event_type: string;
  actor_role: string;
  actor_name?: string;
  public_message: string;
  created_at: string;
  metadata_json?: any;
}

interface EvidencePair {
  before_urls: string[];
  after_urls: string[];
  has_completion_evidence: boolean;
  summary: string;
}

interface CaseItem {
  id: number;
  ticket_id: string;
  title: string;
  category: string;
  status: string;
  status_label: string;
  address: string;
  latitude: number;
  longitude: number;
  department_name: string;
  created_at: string;
  updated_at: string;
  last_event: string;
  needs_citizen_action: boolean;
  media_count: number;
  evidence_pair: EvidencePair;
}

interface CaseDetail extends CaseItem {
  description: string;
  sla_target_hours: number;
  is_overdue: boolean;
  next_step: string;
  waiting_on: string;
  timeline: TimelineEvent[];
  qr_verification: string;
}

export const CaseTrackingCenter: React.FC = () => {
  const { citizenUser, isAuthenticated, navigateTo } = useCitizen();

  // Metrics
  const [metrics, setMetrics] = useState({
    active_count: 4,
    needs_action_count: 1,
    resolved_count: 12,
    reopened_count: 1,
    total_count: 18,
  });

  // Case listing state
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);
  const [selectedCaseTicket, setSelectedCaseTicket] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Verification & Review Form
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<'RESOLVED' | 'PARTIALLY_RESOLVED' | 'UNRESOLVED' | 'RECURRED'>('RESOLVED');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Reinspection Form
  const [showReinspectionModal, setShowReinspectionModal] = useState<boolean>(false);
  const [reinspectionReason, setReinspectionReason] = useState<string>('INCOMPLETE_WORK');
  const [reinspectionNotes, setReinspectionNotes] = useState<string>('');
  const [submittingReinspection, setSubmittingReinspection] = useState<boolean>(false);

  // Additional Evidence
  const [additionalNote, setAdditionalNote] = useState<string>('');
  const [uploadingAdditional, setUploadingAdditional] = useState<boolean>(false);

  // Fetch metrics & cases
  const loadData = () => {
    setLoadingCases(true);
    fetch('/api/v1/cases/metrics')
      .then(r => r.json())
      .then(m => setMetrics(m))
      .catch(() => {});

    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status_filter', statusFilter);
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    params.set('sort_by', sortBy);

    fetch(`/api/v1/cases?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCases(data);
        setLoadingCases(false);
      })
      .catch(() => setLoadingCases(false));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, sortBy]);

  // Fetch single case detail
  const loadCaseDetail = (ticketId: string) => {
    setSelectedCaseTicket(ticketId);
    setLoadingDetail(true);
    fetch(`/api/v1/cases/${ticketId}`)
      .then(r => r.json())
      .then(d => {
        setCaseDetail(d);
        setLoadingDetail(false);
      })
      .catch(() => setLoadingDetail(false));
  };

  // Submit Review
  const handleReviewSubmit = async () => {
    if (!caseDetail) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/v1/cases/${caseDetail.ticket_id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: reviewDecision,
          feedback_notes: feedbackNotes,
          rating: rating,
        }),
      });
      if (res.ok) {
        setShowReviewModal(false);
        loadCaseDetail(caseDetail.ticket_id);
        loadData();
      }
    } catch (_) {}
    setSubmittingReview(false);
  };

  // Submit Reinspection
  const handleReinspectionSubmit = async () => {
    if (!caseDetail) return;
    setSubmittingReinspection(true);
    try {
      const res = await fetch(`/api/v1/cases/${caseDetail.ticket_id}/reinspection-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reinspectionReason,
          detailed_notes: reinspectionNotes,
        }),
      });
      if (res.ok) {
        setShowReinspectionModal(false);
        loadCaseDetail(caseDetail.ticket_id);
        loadData();
      }
    } catch (_) {}
    setSubmittingReinspection(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-28 lg:pb-12 space-y-6">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-heritage-charcoal p-5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-heritage-maroon text-heritage-gold shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-heritage-maroon dark:text-heritage-gold">
                My Cases & Live Tracking
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-heritage-gold/20 text-heritage-maroon dark:text-heritage-gold border border-heritage-gold/40">
                Module 03
              </span>
            </div>
            <p className="text-xs text-heritage-aged mt-0.5">
              Amazon/Flipkart-style live tracking, immutable action timeline & citizen work verification
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('report')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark transition-all shadow-sm self-start sm:self-auto"
        >
          <span>File New Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── SCREEN A: METRICS SUMMARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => { setStatusFilter('ACTIVE'); setSelectedCaseTicket(null); }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'ACTIVE'
              ? 'border-heritage-blue bg-heritage-blue/10 ring-2 ring-heritage-blue'
              : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-heritage-aged tracking-wider">Active Cases</span>
            <span className="p-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">WIP</span>
          </div>
          <p className="font-serif text-3xl font-bold text-heritage-blue mt-1">
            {metrics.active_count < 10 ? `0${metrics.active_count}` : metrics.active_count}
          </p>
          <p className="text-[10px] text-heritage-aged mt-0.5">Work in progress by ground units</p>
        </div>

        <div
          onClick={() => { setStatusFilter('AWAITING_CITIZEN'); setSelectedCaseTicket(null); }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'AWAITING_CITIZEN'
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500'
              : 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">Needs My Action</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-600 mt-1">
            {metrics.needs_action_count < 10 ? `0${metrics.needs_action_count}` : metrics.needs_action_count}
          </p>
          <p className="text-[10px] text-amber-800 dark:text-amber-400 mt-0.5">Review before/after proof</p>
        </div>

        <div
          onClick={() => { setStatusFilter('RESOLVED'); setSelectedCaseTicket(null); }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'RESOLVED'
              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500'
              : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-heritage-aged tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-600 mt-1">
            {metrics.resolved_count < 10 ? `0${metrics.resolved_count}` : metrics.resolved_count}
          </p>
          <p className="text-[10px] text-heritage-aged mt-0.5">Officially verified & closed</p>
        </div>

        <div
          onClick={() => { setStatusFilter('REOPENED'); setSelectedCaseTicket(null); }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'REOPENED'
              ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500'
              : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-heritage-aged tracking-wider">Reopened</span>
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="font-serif text-3xl font-bold text-rose-600 mt-1">
            {metrics.reopened_count < 10 ? `0${metrics.reopened_count}` : metrics.reopened_count}
          </p>
          <p className="text-[10px] text-heritage-aged mt-0.5">Under supervisor audit</p>
        </div>
      </div>

      {/* ── CASE DETAIL VIEW OR CASE LISTING ─────────────────────────────────── */}
      {selectedCaseTicket && caseDetail ? (
        /* ── SCREEN C & D: CASE DETAIL & LIVE TRACKING ──────────────────────── */
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setSelectedCaseTicket(null)}
            className="flex items-center space-x-2 text-xs font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Cases</span>
          </button>

          {/* Ticket Hero Banner */}
          <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-heritage-stone/40">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-heritage-stone/40 px-2 py-0.5 rounded">
                    TICKET ID · {caseDetail.ticket_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    caseDetail.status === 'AWAITING_CITIZEN' ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    : caseDetail.status === 'CLOSED' || caseDetail.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800'
                    : caseDetail.status === 'REOPENED' ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                    {caseDetail.status_label}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-xl text-heritage-charcoal dark:text-heritage-ivory mt-1">
                  {caseDetail.title}
                </h2>
                <p className="text-xs text-heritage-aged flex items-center space-x-2 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-heritage-maroon shrink-0" />
                  <span>{caseDetail.address}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                {caseDetail.status === 'AWAITING_CITIZEN' && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm"
                  >
                    Verify Completion Now
                  </button>
                )}
                {caseDetail.status !== 'CLOSED' && (
                  <button
                    onClick={() => setShowReinspectionModal(true)}
                    className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50"
                  >
                    Request Reinspection
                  </button>
                )}
              </div>
            </div>

            {/* Stage Transparency Pill Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-heritage-ivory dark:bg-heritage-charcoal-dark p-4 rounded-xl border border-heritage-stone/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged block">Assigned Department</span>
                <strong className="text-heritage-maroon dark:text-heritage-gold">{caseDetail.department_name}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged block">Currently Waiting On</span>
                <span className="text-heritage-charcoal dark:text-heritage-ivory font-semibold">{caseDetail.waiting_on}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged block">Next Expected Milestone</span>
                <span className="text-heritage-blue font-semibold">{caseDetail.next_step}</span>
              </div>
            </div>

            {/* ASSIGNED FIELD WORKER DISCLOSURE CARD (Requirement Section 17) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-heritage-maroon/5 via-heritage-stone/20 to-heritage-maroon/5 border border-heritage-gold/50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-heritage-stone/40">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-heritage-maroon text-heritage-gold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-heritage-gold uppercase tracking-wider block">
                      ASSIGNED FIELD WORKER
                    </span>
                    <h4 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
                      Bikash Mohapatra (Crew #4)
                    </h4>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-heritage-maroon text-white shadow-sm">
                  {caseDetail.status === 'AWAITING_CITIZEN' || caseDetail.status === 'COMPLETED' || caseDetail.status === 'RESOLVED' ? 'Work Completed' : 'Task In Progress'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">Official Worker ID</span>
                  <span className="font-mono font-semibold text-heritage-charcoal dark:text-heritage-ivory">FW-1024</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">Department</span>
                  <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">{caseDetail.department_name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">Official Work Contact</span>
                  <a href="tel:+919437123456" className="font-mono font-semibold text-heritage-blue hover:underline flex items-center space-x-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>+91 94371 23456</span>
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-heritage-aged uppercase block">Assignment Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Arrived & Dewatering Active</span>
                </div>
              </div>

              <div className="pt-2 border-t border-heritage-stone/30 flex items-center justify-between text-[11px] text-heritage-aged">
                <span>Latest Public Progress Update: Sluice gate unblocked. Dewatering pump operating at 120 L/min capacity.</span>
                <span className="font-mono text-[10px]">Official Work Unit Disclosed</span>
              </div>
            </div>
          </div>

          {/* ── SCREEN D: BEFORE & AFTER EVIDENCE COMPARISON CARDS ───────────── */}
          <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-heritage-maroon" />
                  <span>Work Proof & Photographic Verification</span>
                </h3>
                <p className="text-[11px] text-heritage-aged mt-0.5">
                  Side-by-side comparison of citizen incident reporting versus municipal repair completion.
                </p>
              </div>
              {caseDetail.evidence_pair.has_completion_evidence && (
                <span className="text-[10px] bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-bold">
                  After-Repair Proof Available
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Card */}
              <div className="border border-heritage-stone dark:border-heritage-charcoal rounded-xl overflow-hidden bg-heritage-stone/10">
                <div className="p-2.5 bg-heritage-stone/30 flex items-center justify-between text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                  <span>BEFORE · Citizen Original Evidence</span>
                  <span className="text-[10px] text-heritage-aged">Submitted {caseDetail.created_at}</span>
                </div>
                <div className="h-48 bg-heritage-stone/20 overflow-hidden flex items-center justify-center">
                  {caseDetail.evidence_pair.before_urls.length > 0 ? (
                    <img
                      src={caseDetail.evidence_pair.before_urls[0]}
                      alt="Before evidence"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-heritage-aged text-xs">
                      <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span>No visual photo provided at submission</span>
                    </div>
                  )}
                </div>
              </div>

              {/* After Card */}
              <div className="border border-heritage-stone dark:border-heritage-charcoal rounded-xl overflow-hidden bg-heritage-stone/10">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span>AFTER · Field Team Repair Proof</span>
                  <span className="text-[10px]">Verified Geo-Tag</span>
                </div>
                <div className="h-48 bg-heritage-stone/20 overflow-hidden flex items-center justify-center">
                  {caseDetail.evidence_pair.after_urls.length > 0 ? (
                    <img
                      src={caseDetail.evidence_pair.after_urls[0]}
                      alt="After repair proof"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-heritage-aged text-xs">
                      <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span>Field repair photo pending upload by work crew</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Citizen Action Prompt if Awaiting Review */}
            {caseDetail.status === 'AWAITING_CITIZEN' && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Field Team has reported work completion.
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                    Compare the Before/After proof and tell us if the problem is completely addressed.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-sm shrink-0"
                >
                  Confirm / Dispute Outcome
                </button>
              </div>
            )}
          </div>

          {/* ── AMAZON/FLIPKART-STYLE ORDERED TIMELINE ──────────────────────── */}
          <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
              <Clock className="w-4 h-4 text-heritage-maroon" />
              <span>Immutable Action Timeline & Case Journey</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-heritage-stone dark:before:bg-heritage-charcoal">
              {caseDetail.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative flex items-start space-x-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-heritage-maroon text-heritage-gold flex items-center justify-center text-[10px] font-bold shadow-sm ring-4 ring-white dark:ring-heritage-charcoal">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-heritage-ivory dark:bg-heritage-charcoal-dark p-3.5 rounded-xl border border-heritage-stone/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory text-xs">
                        {event.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-heritage-aged font-mono">{event.created_at}</span>
                    </div>
                    <p className="text-heritage-aged text-xs leading-relaxed">{event.public_message}</p>
                    <div className="pt-1 flex items-center space-x-2 text-[10px] text-heritage-aged">
                      <span className="bg-heritage-stone/40 px-1.5 py-0.5 rounded font-mono">Actor: {event.actor_role}</span>
                      {event.actor_name && <span>· {event.actor_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── SCREEN B: CASE LIST, SEARCH & FILTERS ─────────────────────────── */
        <div className="bg-white dark:bg-heritage-charcoal p-6 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-4">
          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadData()}
                placeholder="Search by ticket ID, issue title, or street..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
              >
                <option value="ALL">All Categories</option>
                <option value="Roads">Roads & Footpaths</option>
                <option value="Water">Water & Drainage</option>
                <option value="Waste">Waste & Sanitation</option>
                <option value="Lighting">Street Lighting</option>
              </select>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active (WIP)</option>
                <option value="AWAITING_CITIZEN">Needs My Action</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </div>
          </div>

          {/* Cases List Cards */}
          {loadingCases ? (
            <div className="py-12 text-center text-xs text-heritage-aged">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-heritage-maroon" />
              <span>Loading civic cases…</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center text-xs text-heritage-aged space-y-2">
              <Briefcase className="w-8 h-8 mx-auto text-heritage-stone" />
              <p className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">No cases match your filters.</p>
              <p className="text-[11px]">Try clearing filters or report a new civic issue.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {cases.map(c => (
                <div
                  key={c.id || c.ticket_id}
                  onClick={() => loadCaseDetail(c.ticket_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-heritage-gold hover:shadow-sm ${
                    c.needs_citizen_action
                      ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold bg-heritage-stone/40 px-2 py-0.5 rounded text-heritage-charcoal dark:text-heritage-ivory">
                          {c.ticket_id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'AWAITING_CITIZEN' ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : c.status === 'CLOSED' || c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'REOPENED' ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                          {c.status_label}
                        </span>
                        <span className="text-[10px] text-heritage-aged">{c.category}</span>
                      </div>
                      <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory mt-1">
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-heritage-aged flex items-center space-x-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-heritage-maroon shrink-0" />
                        <span className="truncate max-w-md">{c.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        <p className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold">{c.department_name}</p>
                        <p className="text-[10px] text-heritage-aged">{c.updated_at}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-heritage-aged" />
                    </div>
                  </div>

                  {c.needs_citizen_action && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">⚠️ Action Required: Field crew submitted repair photos. Please review & confirm outcome.</span>
                      <span className="underline font-bold text-[11px]">Review Proof →</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CITIZEN WORK COMPLETION REVIEW (SCREEN D) ────────────────── */}
      {showReviewModal && caseDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-heritage-charcoal max-w-lg w-full rounded-2xl border border-heritage-stone shadow-heritage p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
              <div>
                <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory">
                  Verify Work Outcome
                </h3>
                <p className="text-xs text-heritage-aged">Ticket: {caseDetail.ticket_id}</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-heritage-aged hover:text-black">
                ✕
              </button>
            </div>

            <p className="text-xs text-heritage-aged">
              Compare the field team evidence and tell us whether the reported civic issue has been resolved to your satisfaction.
            </p>

            <div className="space-y-2">
              {[
                { val: 'RESOLVED', label: 'Yes, the issue is completely resolved', sub: 'Close case and award rating to crew' },
                { val: 'PARTIALLY_RESOLVED', label: 'Partially resolved — some work remains', sub: 'Field unit will return to finish punch-list' },
                { val: 'UNRESOLVED', label: 'No, the problem still exists', sub: 'Reopen case and escalate to Department Supervisor' },
                { val: 'RECURRED', label: 'It was temporarily fixed but recurred', sub: 'Initiate structural recurrence audit' },
              ].map(opt => (
                <div
                  key={opt.val}
                  onClick={() => setReviewDecision(opt.val as any)}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    reviewDecision === opt.val
                      ? 'border-heritage-maroon bg-heritage-maroon/10 font-semibold'
                      : 'border-heritage-stone hover:border-heritage-gold'
                  }`}
                >
                  <p className="text-heritage-charcoal dark:text-heritage-ivory">{opt.label}</p>
                  <p className="text-[10px] text-heritage-aged">{opt.sub}</p>
                </div>
              ))}
            </div>

            {/* Rating Stars if resolved */}
            {reviewDecision === 'RESOLVED' && (
              <div>
                <label className="block text-xs font-semibold text-heritage-aged mb-1">Crew Performance Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-1.5 rounded-lg ${s <= rating ? 'text-amber-500' : 'text-heritage-stone'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional details */}
            <div>
              <label className="block text-xs font-semibold text-heritage-aged mb-1">Additional Feedback / Notes</label>
              <textarea
                rows={3}
                value={feedbackNotes}
                onChange={e => setFeedbackNotes(e.target.value)}
                placeholder="Share your feedback, or explain remaining issues if disputed..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="px-5 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-bold hover:bg-heritage-maroon-dark disabled:opacity-50"
              >
                {submittingReview ? 'Saving Outcome…' : 'Submit Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REINSPECTION & SUPERVISOR ESCALATION (SCREEN E) ───────────── */}
      {showReinspectionModal && caseDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-heritage-charcoal max-w-lg w-full rounded-2xl border border-heritage-stone shadow-heritage p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-stone">
              <div>
                <h3 className="font-serif font-bold text-lg text-rose-700 dark:text-rose-400">
                  Request Supervisory Reinspection
                </h3>
                <p className="text-xs text-heritage-aged">Escalation for {caseDetail.ticket_id}</p>
              </div>
              <button onClick={() => setShowReinspectionModal(false)} className="text-heritage-aged hover:text-black">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-aged mb-1">Reason for Reinspection</label>
              <select
                value={reinspectionReason}
                onChange={e => setReinspectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-semibold"
              >
                <option value="INCOMPLETE_WORK">Work Left Incomplete by Crew</option>
                <option value="POOR_QUALITY">Substandard / Defective Work Quality</option>
                <option value="HAZARD_REMAINS">Public Safety Hazard Still Present</option>
                <option value="RECURRENCE">Issue Returned After Brief Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-aged mb-1">Detailed Explanation for Supervisor *</label>
              <textarea
                rows={4}
                value={reinspectionNotes}
                onChange={e => setReinspectionNotes(e.target.value)}
                placeholder="Explain why the current repair is unsatisfactory. This is reviewed directly by the municipal assistant engineer..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowReinspectionModal(false)}
                className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReinspectionSubmit}
                disabled={submittingReinspection || !reinspectionNotes.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
              >
                {submittingReinspection ? 'Escalating…' : 'Submit Reinspection Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
