import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Lightbulb, BarChart3, FolderKanban, Calendar, Heart,
  PlusCircle, Search, Filter, ChevronRight, ChevronDown, ChevronUp,
  X, RefreshCw, Star, MessageSquare, ThumbsUp, Send, Clock,
  MapPin, CheckCircle, CheckCircle2, Circle, AlertCircle, Eye,
  Sparkles, Brain, Shield, ExternalLink, UserCheck, Wrench,
  Archive, TreePine, Trash2, Palette, Flame, Globe, Activity,
  ArrowLeft, Info, Tag, Vote, Award, Megaphone, CalendarDays,
  BookOpen, Handshake
} from 'lucide-react';

const API = 'http://127.0.0.1:8000/api/community';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface HubStats {
  total_public_proposals: number;
  active_polls: number;
  active_projects: number;
  upcoming_events: number;
  total_citizen_support_actions: number;
}

interface Proposal {
  id: number;
  proposal_code: string;
  title: string;
  category: string;
  area_ward?: string;
  description: string;
  suggested_solution?: string;
  beneficiaries: string[];
  status: string;
  responsible_authority?: string;
  decision_reason?: string;
  support_count: number;
  feedback_count: number;
  is_public: boolean;
  author_name?: string;
  created_at: string;
  timeline?: Array<{ event_type: string; actor_role: string; actor_name?: string; public_message: string; created_at: string }>;
  public_feedback?: Array<{ display_name: string; comment_text: string; sentiment: string; created_at: string }>;
}

interface PollOption {
  option_id: number;
  label: string;
  label_odia?: string;
  icon?: string;
  display_order: number;
  response_count: number;
  percentage: number;
}

interface ConsultationListItem {
  id: number;
  consultation_code: string;
  title: string;
  purpose?: string;
  organiser_name?: string;
  organiser_role?: string;
  format: string;
  is_anonymous: boolean;
  status: string;
  is_open: boolean;
  closes_at?: string;
  total_responses: number;
  results_visible: boolean;
}

interface ConsultationDetail extends ConsultationListItem {
  eligibility_note?: string;
  usage_statement?: string;
  options: PollOption[];
}

interface ProjectMilestone {
  sequence_no: number;
  title: string;
  description?: string;
  status: string;
  planned_date?: string;
  actual_date?: string;
  notes?: string;
}

interface CommunityProject {
  id: number;
  project_code: string;
  title: string;
  category: string;
  area_ward?: string;
  objective: string;
  scope?: string;
  organiser_name?: string;
  responsible_org?: string;
  status: string;
  cover_image_url?: string;
  start_date?: string;
  target_date?: string;
  follower_count: number;
  public_update?: string;
  milestones: ProjectMilestone[];
}

interface CommunityEvent {
  id: number;
  event_code: string;
  title: string;
  event_type: string;
  description: string;
  organiser_name?: string;
  organiser_verified: boolean;
  location_name: string;
  starts_at: string;
  ends_at?: string;
  max_participants?: number;
  spots_left?: number;
  min_age?: number;
  requires_equipment?: string;
  accessibility_notes?: string;
  status: string;
  cover_image_url?: string;
  registration_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9CA3AF', SUBMITTED: '#3B82F6', UNDER_MODERATION: '#D97706',
  UNDER_REVIEW: '#8B5CF6', PUBLIC_FEEDBACK_OPEN: '#0891B2',
  ACCEPTED: '#16A34A', IN_PROGRESS: '#EA580C', COMPLETED: '#059669',
  DECLINED: '#DC2626', REFERRED: '#6366F1',
  PLANNING: '#3B82F6', COMMUNITY_FEEDBACK: '#0891B2', APPROVED: '#16A34A',
  CANCELLED: '#DC2626', UPCOMING: '#3B82F6', FULL: '#D97706', ACTIVE: '#16A34A', CLOSED: '#9CA3AF',
  PENDING: '#D97706', DELAYED: '#EA580C',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  PUBLIC_SPACES: Globe, ROADS: MapPin, GREENERY: TreePine,
  SANITATION: Trash2, LIGHTING: Lightbulb, ACCESSIBILITY: UserCheck,
  OTHER: Tag,
  TREE_PLANTING: TreePine, PARK_IMPROVEMENT: Globe, CLEANLINESS: Sparkles,
  HERITAGE: Star, CLEANUP: Trash2, AWARENESS: Megaphone,
  WORKSHOP: BookOpen,
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6B7280';
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white inline-flex items-center gap-1"
      style={{ backgroundColor: color }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso?: string) {
  if (!iso) return null;
  const diff = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return Math.ceil(diff);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑section views
// ─────────────────────────────────────────────────────────────────────────────

// ── A. Proposals ─────────────────────────────────────────────────────────────

function ProposalsSection() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sentiment, setSentiment] = useState('SUPPORT');

  useEffect(() => {
    fetch(`${API}/proposals`)
      .then(r => r.json())
      .then(d => setProposals(d.proposals || []))
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = async (id: number) => {
    const r = await fetch(`${API}/proposals/${id}`);
    const d = await r.json();
    setSelected(d);
  };

  const handleSupport = async (id: number) => {
    await fetch(`${API}/proposals/${id}/support?citizen_id=1`, { method: 'POST' });
    loadDetail(id);
  };

  const handleFeedback = async (id: number) => {
    if (!feedbackText.trim()) return;
    await fetch(`${API}/proposals/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_text: feedbackText, sentiment, display_name: 'Citizen' }),
    });
    setFeedbackText('');
    loadDetail(id);
  };

  // ── NEW PROPOSAL FORM ─────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState('');
  const [formCat, setFormCat] = useState('PUBLIC_SPACES');
  const [formArea, setFormArea] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formBeneficiaries, setFormBeneficiaries] = useState<string[]>([]);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const BENEFICIARY_OPTIONS = [
    'Neighbourhood residents', 'Children and older adults',
    'People with disabilities', 'Students and youth',
    'Visitors and the wider public',
  ];

  const askAI = async () => {
    if (!formDesc || formDesc.length < 10) return;
    setAiSuggesting(true);
    try {
      const r = await fetch(`${API}/ai-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_idea: formDesc, category: formCat, area: formArea }),
      });
      setAiResult(await r.json());
    } finally {
      setAiSuggesting(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiResult) return;
    if (aiResult.suggested_title && !formTitle) setFormTitle(aiResult.suggested_title);
    if (aiResult.suggested_solution && !formSolution) setFormSolution(aiResult.suggested_solution);
    if (aiResult.suggested_beneficiaries) setFormBeneficiaries(aiResult.suggested_beneficiaries);
  };

  const submitProposal = async (draft: boolean) => {
    if (!formTitle || !formDesc || formDesc.length < 20) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle, category: formCat, area_ward: formArea,
          description: formDesc, suggested_solution: formSolution,
          beneficiaries: formBeneficiaries, is_draft: draft,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setShowForm(false);
        setFormTitle(''); setFormDesc(''); setFormSolution('');
        setFormBeneficiaries([]); setAiResult(null);
        // Refresh list
        const refreshRes = await fetch(`${API}/proposals`);
        setProposals((await refreshRes.json()).proposals || []);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-heritage-maroon hover:underline">
          <ArrowLeft size={14} /> Back to all proposals
        </button>
        <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <StatusBadge status={selected.status} />
              <h3 className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory mt-2 leading-snug">{selected.title}</h3>
              <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50 mt-1">
                {selected.proposal_code} · {selected.category.replace(/_/g, ' ')} · {selected.area_ward || 'Bhubaneswar'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleSupport(selected.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-heritage-maroon/10 text-heritage-maroon hover:bg-heritage-maroon/20 transition-colors">
                <Heart size={13} /> Support ({selected.support_count})
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 mt-4">
            <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
              <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-bold uppercase tracking-wider mb-1">Problem Description</p>
              <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
            </div>
            {selected.suggested_solution && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Suggested Solution</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{selected.suggested_solution}</p>
              </div>
            )}
          </div>

          {selected.beneficiaries?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.beneficiaries.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-heritage-gold/10 text-heritage-charcoal dark:text-heritage-ivory border border-heritage-gold/20">
                  {b}
                </span>
              ))}
            </div>
          )}

          {selected.responsible_authority && (
            <div className="mt-3 flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
              <Shield size={14} className="text-heritage-maroon shrink-0" />
              <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory">
                <span className="font-semibold">Responsible authority:</span> {selected.responsible_authority}
              </p>
            </div>
          )}

          {/* Timeline */}
          {selected.timeline && selected.timeline.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-2 flex items-center gap-1.5">
                <Activity size={13} className="text-heritage-maroon" /> Decision History
              </h4>
              <div className="space-y-2 relative ml-3 border-l-2 border-heritage-stone/20 dark:border-heritage-charcoal pl-4">
                {selected.timeline.map((ev, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-heritage-maroon border-2 border-white dark:border-heritage-charcoal" />
                    <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-mono">
                      {formatDate(ev.created_at)} · {ev.actor_role}
                      {ev.actor_name ? ` — ${ev.actor_name}` : ''}
                    </p>
                    <StatusBadge status={ev.event_type} />
                    <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 mt-0.5">{ev.public_message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Feedback */}
          {selected.public_feedback && selected.public_feedback.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-2 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-heritage-maroon" /> Public Feedback ({selected.feedback_count})
              </h4>
              <div className="space-y-2">
                {selected.public_feedback.map((fb, i) => (
                  <div key={i} className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-heritage-charcoal dark:text-heritage-ivory">{fb.display_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        fb.sentiment === 'SUPPORT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        fb.sentiment === 'CONCERN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>{fb.sentiment}</span>
                    </div>
                    <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 mt-1">{fb.comment_text}</p>
                    <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/30 mt-1">{formatDate(fb.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Feedback */}
          <div className="mt-4 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
            <p className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider mb-2">Share Your Feedback</p>
            <div className="flex gap-1.5 mb-2">
              {(['SUPPORT', 'NEUTRAL', 'CONCERN'] as const).map(s => (
                <button key={s} onClick={() => setSentiment(s)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    sentiment === s
                      ? s === 'SUPPORT' ? 'bg-emerald-500 text-white border-emerald-500'
                        : s === 'CONCERN' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-500 text-white border-gray-500'
                      : 'border-heritage-stone/30 text-heritage-stone dark:text-heritage-ivory/50'
                  }`}>{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                placeholder="Write a constructive comment…"
                className="flex-1 text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                  bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory
                  focus:ring-2 focus:ring-heritage-maroon/30 outline-none"
                onKeyDown={e => e.key === 'Enter' && handleFeedback(selected.id)}
              />
              <button onClick={() => handleFeedback(selected.id)}
                className="px-3 py-2 rounded-lg bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon/90 transition-colors">
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── New Proposal Form ──────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowForm(false)}
          className="flex items-center gap-1.5 text-xs font-semibold text-heritage-maroon hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 p-5">
          <h3 className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
            Propose a Local Improvement
          </h3>
          <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50 mb-4">
            ସ୍ଥାନୀୟ ଉନ୍ନତି ପ୍ରସ୍ତାବ — Submit your idea. Nothing is published without your permission.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider">Title *</label>
              <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Install pedestrian ramps on Janpath footpath"
                className="w-full mt-1 text-sm border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                  bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory
                  focus:ring-2 focus:ring-heritage-maroon/30 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider">Category *</label>
                <select value={formCat} onChange={e => setFormCat(e.target.value)}
                  className="w-full mt-1 text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                    bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory outline-none">
                  {['PUBLIC_SPACES', 'ROADS', 'GREENERY', 'SANITATION', 'LIGHTING', 'ACCESSIBILITY', 'OTHER'].map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider">Area / Ward</label>
                <input value={formArea} onChange={e => setFormArea(e.target.value)}
                  placeholder="e.g. Saheed Nagar, Ward 14"
                  className="w-full mt-1 text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                    bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider">What would you like to improve? *</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={4}
                placeholder="Describe the problem and why it matters…"
                className="w-full mt-1 text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                  bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory
                  focus:ring-2 focus:ring-heritage-maroon/30 outline-none resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider">Suggested Solution</label>
              <textarea value={formSolution} onChange={e => setFormSolution(e.target.value)} rows={2}
                placeholder="What specific improvement do you suggest?"
                className="w-full mt-1 text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-3 py-2
                  bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory outline-none resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider mb-1.5 block">Who would benefit?</label>
              <div className="flex flex-wrap gap-1.5">
                {BENEFICIARY_OPTIONS.map(b => (
                  <button key={b} onClick={() => setFormBeneficiaries(prev =>
                    prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                  )}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      formBeneficiaries.includes(b)
                        ? 'bg-heritage-maroon text-white border-heritage-maroon'
                        : 'border-heritage-stone/30 text-heritage-stone dark:text-heritage-ivory/50 hover:border-heritage-maroon'
                    }`}>{b}</button>
                ))}
              </div>
            </div>

            {/* AI Assist */}
            <div className="border border-heritage-maroon/20 bg-heritage-maroon/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-heritage-maroon flex items-center gap-1">
                  <Brain size={13} /> AI Proposal Assistant
                </span>
                <button onClick={askAI} disabled={aiSuggesting || formDesc.length < 10}
                  className="text-[10px] font-semibold px-3 py-1 rounded-lg bg-heritage-maroon text-white
                    disabled:opacity-40 hover:bg-heritage-maroon/90 transition-colors flex items-center gap-1">
                  {aiSuggesting ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  {aiSuggesting ? 'Thinking…' : 'Get AI Suggestions'}
                </button>
              </div>
              {aiResult && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80">
                    <strong>Title:</strong> {aiResult.suggested_title}
                  </p>
                  <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80">
                    <strong>Dept:</strong> {aiResult.likely_responsible_dept}
                  </p>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 italic">{aiResult.disclaimer}</p>
                  <button onClick={applyAISuggestion}
                    className="text-[10px] font-semibold px-3 py-1 rounded-lg border border-heritage-maroon text-heritage-maroon hover:bg-heritage-maroon/10 transition-colors">
                    Apply suggestions to my form
                  </button>
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => submitProposal(true)} disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-heritage-stone/30 text-heritage-stone
                  hover:bg-heritage-ivory transition-colors disabled:opacity-50">
                Save Draft
              </button>
              <button onClick={() => submitProposal(false)} disabled={submitting || !formTitle || formDesc.length < 20}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-heritage-maroon text-white
                  hover:bg-heritage-maroon/90 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {submitting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Proposal List ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory flex items-center gap-1.5">
          <Lightbulb size={15} className="text-heritage-gold" /> Ideas & Public Proposals
        </h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-heritage-maroon text-white hover:bg-heritage-maroon/90 transition-colors">
          <PlusCircle size={13} /> New Proposal
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-heritage-stone"><RefreshCw size={14} className="animate-spin" /> Loading…</div>
      ) : (
        <div className="space-y-2">
          {proposals.map(p => {
            const CatIcon = CATEGORY_ICONS[p.category] || Tag;
            return (
              <button key={p.id} onClick={() => loadDetail(p.id)}
                className="w-full text-left bg-white dark:bg-heritage-charcoal border border-heritage-stone/30 dark:border-heritage-charcoal
                  rounded-xl p-4 hover:shadow-md hover:border-heritage-maroon/30 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (STATUS_COLORS[p.status] || '#6B7280') + '20', color: STATUS_COLORS[p.status] || '#6B7280' }}>
                    <CatIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={p.status} />
                      <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-mono">{p.proposal_code}</span>
                    </div>
                    <p className="text-sm font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{p.title}</p>
                    <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 mt-0.5 truncate">
                      {p.category.replace(/_/g, ' ')} · {p.area_ward || 'Bhubaneswar'} · by {p.author_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-heritage-maroon font-semibold">
                        <Heart size={10} /> {p.support_count}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-heritage-stone dark:text-heritage-ivory/40">
                        <MessageSquare size={10} /> {p.feedback_count}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-heritage-stone dark:text-heritage-ivory/30 mt-1 group-hover:text-heritage-maroon transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── B. Polls & Public Consultation ───────────────────────────────────────────

function PollsSection() {
  const [polls, setPolls] = useState<ConsultationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ConsultationDetail | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [voteError, setVoteError] = useState('');

  useEffect(() => {
    fetch(`${API}/consultations`).then(r => r.json()).then(setPolls).finally(() => setLoading(false));
  }, []);

  const loadDetail = async (id: number) => {
    const r = await fetch(`${API}/consultations/${id}`);
    setDetail(await r.json());
    setSelectedOption(null); setVoted(false); setVoteError('');
  };

  const submitVote = async () => {
    if (!detail || selectedOption === null) return;
    setVoteError('');
    const r = await fetch(`${API}/consultations/${detail.id}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_options: [selectedOption], citizen_id: 1 }),
    });
    if (r.ok) { setVoted(true); loadDetail(detail.id); }
    else {
      const d = await r.json();
      setVoteError(d.detail || 'Error submitting vote');
    }
  };

  if (detail) {
    const total = detail.options.reduce((s, o) => s + o.response_count, 0);
    const maxCount = Math.max(...detail.options.map(o => o.response_count), 1);
    return (
      <div className="space-y-4">
        <button onClick={() => setDetail(null)} className="flex items-center gap-1.5 text-xs font-semibold text-heritage-maroon hover:underline">
          <ArrowLeft size={14} /> Back to polls
        </button>
        <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={detail.is_open ? 'ACTIVE' : 'CLOSED'} />
            {detail.is_anonymous && <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 flex items-center gap-1"><Shield size={10} /> Anonymous</span>}
            {detail.closes_at && (
              <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 flex items-center gap-1">
                <Clock size={10} /> Closes {formatDate(detail.closes_at)}
                {(() => { const d = daysUntil(detail.closes_at); return d && d > 0 ? ` (${d} days)` : ''; })()}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory leading-snug mb-2">{detail.title}</h3>
          {detail.purpose && <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50 mb-1">{detail.purpose}</p>}
          {detail.organiser_name && (
            <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">
              Organised by: <strong>{detail.organiser_name}</strong> {detail.organiser_role ? `— ${detail.organiser_role}` : ''}
            </p>
          )}
          {detail.eligibility_note && (
            <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 mt-1 italic">{detail.eligibility_note}</p>
          )}

          {/* Options */}
          <div className="mt-4 space-y-2">
            {detail.options.map(o => {
              const isSelected = selectedOption === o.option_id;
              return (
                <button key={o.option_id}
                  onClick={() => !voted && detail.is_open && setSelectedOption(o.option_id)}
                  disabled={voted || !detail.is_open}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    isSelected ? 'border-heritage-maroon bg-heritage-maroon/5' : 'border-heritage-stone/20 hover:border-heritage-maroon/30'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory flex items-center gap-2">
                      {isSelected ? <CheckCircle2 size={14} className="text-heritage-maroon" /> : <Circle size={14} className="text-heritage-stone/30" />}
                      {o.label}
                    </span>
                    <span className="text-xs font-bold text-heritage-maroon">{o.percentage}%</span>
                  </div>
                  {o.label_odia && <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/30 ml-6 mb-1">{o.label_odia}</p>}
                  <div className="ml-6 bg-heritage-stone/10 dark:bg-heritage-charcoal-dark rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-heritage-maroon transition-all duration-700"
                      style={{ width: `${(o.response_count / maxCount) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/30 ml-6 mt-0.5">{o.response_count} responses</p>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/30 mt-2 text-center">{total} total responses</p>

          {detail.is_open && !voted && (
            <button onClick={submitVote} disabled={selectedOption === null}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold bg-heritage-maroon text-white
                disabled:opacity-40 hover:bg-heritage-maroon/90 transition-colors">
              Submit My Vote
            </button>
          )}
          {voted && (
            <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
              <CheckCircle size={18} className="text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Thank you for voting!</p>
            </div>
          )}
          {voteError && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
              <p className="text-xs text-red-700 dark:text-red-400">{voteError}</p>
            </div>
          )}

          {detail.usage_statement && (
            <div className="mt-3 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
              <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">
                <strong>How results will be used:</strong> {detail.usage_statement}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory flex items-center gap-1.5">
        <BarChart3 size={15} className="text-cyan-500" /> Polls & Public Feedback
      </h3>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-heritage-stone"><RefreshCw size={14} className="animate-spin" /> Loading…</div>
      ) : (
        <div className="space-y-2">
          {polls.map(p => (
            <button key={p.id} onClick={() => loadDetail(p.id)}
              className="w-full text-left bg-white dark:bg-heritage-charcoal border border-heritage-stone/30
                rounded-xl p-4 hover:shadow-md hover:border-heritage-maroon/30 transition-all group">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={p.is_open ? 'ACTIVE' : 'CLOSED'} />
                <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-mono">{p.consultation_code}</span>
                {p.closes_at && <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">
                  Closes {formatDate(p.closes_at)}
                </span>}
              </div>
              <p className="text-sm font-semibold text-heritage-charcoal dark:text-heritage-ivory">{p.title}</p>
              <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 mt-0.5">
                {p.organiser_name} · {p.format.replace(/_/g, ' ')} · {p.total_responses} responses
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── C. Community Projects ────────────────────────────────────────────────────

function ProjectsSection() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CommunityProject | null>(null);

  useEffect(() => {
    fetch(`${API}/projects`).then(r => r.json()).then(setProjects).finally(() => setLoading(false));
  }, []);

  if (selected) {
    const completedMilestones = selected.milestones.filter(m => m.status === 'COMPLETED').length;
    const progressPct = selected.milestones.length > 0 ? Math.round((completedMilestones / selected.milestones.length) * 100) : 0;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs font-semibold text-heritage-maroon hover:underline">
          <ArrowLeft size={14} /> Back to projects
        </button>
        <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 overflow-hidden">
          {selected.cover_image_url && (
            <div className="h-40 overflow-hidden">
              <img src={selected.cover_image_url} alt={selected.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={selected.status} />
              <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-mono">{selected.project_code}</span>
            </div>
            <h3 className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory leading-snug">{selected.title}</h3>
            <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50 mt-1">
              {selected.area_ward} · {selected.organiser_name}
              {selected.responsible_org ? ` · ${selected.responsible_org}` : ''}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2 text-center">
                <p className="text-base font-bold text-heritage-maroon">{progressPct}%</p>
                <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">Progress</p>
              </div>
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2 text-center">
                <p className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory">{selected.follower_count}</p>
                <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">Followers</p>
              </div>
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2 text-center">
                <p className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory">{selected.milestones.length}</p>
                <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">Milestones</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 bg-heritage-stone/10 dark:bg-heritage-charcoal-dark rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-heritage-maroon transition-all duration-1000" style={{ width: `${progressPct}%` }} />
            </div>

            {selected.objective && (
              <div className="mt-3 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                <p className="text-[10px] font-bold text-heritage-stone dark:text-heritage-ivory/40 uppercase tracking-wider mb-1">Objective</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{selected.objective}</p>
              </div>
            )}

            {selected.public_update && (
              <div className="mt-3 bg-heritage-maroon/5 border border-heritage-maroon/20 rounded-lg p-3">
                <p className="text-[10px] font-bold text-heritage-maroon uppercase tracking-wider mb-1">Latest Update</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80">{selected.public_update}</p>
              </div>
            )}

            {/* Milestones */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-3 flex items-center gap-1.5">
                <FolderKanban size={13} className="text-heritage-maroon" /> Project Milestones
              </h4>
              <div className="space-y-2 relative ml-3 border-l-2 border-heritage-stone/20 dark:border-heritage-charcoal pl-4">
                {selected.milestones.map((m, i) => {
                  const color = STATUS_COLORS[m.status] || '#6B7280';
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-heritage-charcoal"
                        style={{ backgroundColor: color }} />
                      <div className="flex items-center gap-2 mb-0.5">
                        <StatusBadge status={m.status} />
                        {m.planned_date && (
                          <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">
                            {formatDate(m.planned_date)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">{m.sequence_no}. {m.title}</p>
                      {m.description && <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 mt-0.5">{m.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory flex items-center gap-1.5">
        <FolderKanban size={15} className="text-emerald-500" /> Community Projects
      </h3>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-heritage-stone"><RefreshCw size={14} className="animate-spin" /> Loading…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map(p => {
            const done = p.milestones.filter(m => m.status === 'COMPLETED').length;
            const pct = p.milestones.length > 0 ? Math.round((done / p.milestones.length) * 100) : 0;
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className="text-left bg-white dark:bg-heritage-charcoal border border-heritage-stone/30
                  rounded-xl overflow-hidden hover:shadow-md hover:border-heritage-maroon/30 transition-all group">
                {p.cover_image_url && (
                  <div className="h-28 overflow-hidden"><img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover" /></div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={p.status} />
                    <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">{p.follower_count} followers</span>
                  </div>
                  <p className="text-sm font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{p.title}</p>
                  <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 mt-0.5 truncate">
                    {p.area_ward} · {p.organiser_name}
                  </p>
                  <div className="mt-2 bg-heritage-stone/10 dark:bg-heritage-charcoal-dark rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-heritage-maroon transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 mt-1">{done}/{p.milestones.length} milestones · {pct}% complete</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── D. Events & Volunteering ─────────────────────────────────────────────────

function EventsSection() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CommunityEvent | null>(null);
  const [regResult, setRegResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/events`).then(r => r.json()).then(setEvents).finally(() => setLoading(false));
  }, []);

  const registerForEvent = async (eventId: number) => {
    setRegResult(null);
    const r = await fetch(`${API}/events/${eventId}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizen_id: 1 }),
    });
    const d = await r.json();
    if (r.ok) setRegResult(`✅ Registered! Code: ${d.registration_code}`);
    else setRegResult(`⚠️ ${d.detail}`);
  };

  const EVENT_TYPE_COLORS: Record<string, string> = {
    HERITAGE: '#8B1A2E', AWARENESS: '#0891B2', CLEANUP: '#16A34A', WORKSHOP: '#92400E', TREE_PLANTING: '#065F46',
  };

  if (selected) {
    const days = daysUntil(selected.starts_at);
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelected(null); setRegResult(null); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-heritage-maroon hover:underline">
          <ArrowLeft size={14} /> Back to events
        </button>
        <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 overflow-hidden">
          {selected.cover_image_url && (
            <div className="h-44 overflow-hidden">
              <img src={selected.cover_image_url} alt={selected.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: EVENT_TYPE_COLORS[selected.event_type] || '#6B7280' }}>
                {selected.event_type.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={selected.status} />
              {selected.organiser_verified && (
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-semibold"><CheckCircle size={10} /> Verified</span>
              )}
            </div>
            <h3 className="text-base font-bold text-heritage-charcoal dark:text-heritage-ivory leading-snug">{selected.title}</h3>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
                <CalendarDays size={14} className="text-heritage-maroon shrink-0" />
                <div>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-bold uppercase">Date</p>
                  <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">
                    {formatDate(selected.starts_at)}
                    {days && days > 0 ? ` (${days}d away)` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
                <MapPin size={14} className="text-heritage-maroon shrink-0" />
                <div>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-bold uppercase">Location</p>
                  <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{selected.location_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
                <Users size={14} className="text-heritage-maroon shrink-0" />
                <div>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-bold uppercase">Spots</p>
                  <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">
                    {selected.registration_count}{selected.max_participants ? `/${selected.max_participants}` : ''} registered
                    {selected.spots_left !== undefined && selected.spots_left !== null && ` · ${selected.spots_left} left`}
                  </p>
                </div>
              </div>
              {selected.organiser_name && (
                <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2.5">
                  <Shield size={14} className="text-heritage-maroon shrink-0" />
                  <div>
                    <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-bold uppercase">Organiser</p>
                    <p className="text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory">{selected.organiser_name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
              <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{selected.description}</p>
            </div>

            {selected.requires_equipment && (
              <div className="mt-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Equipment / Requirements</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 mt-0.5">{selected.requires_equipment}</p>
              </div>
            )}
            {selected.accessibility_notes && (
              <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Accessibility</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 mt-0.5">{selected.accessibility_notes}</p>
              </div>
            )}

            {selected.status === 'UPCOMING' && (
              <button onClick={() => registerForEvent(selected.id)}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-heritage-maroon text-white
                  hover:bg-heritage-maroon/90 transition-colors flex items-center justify-center gap-2">
                <Handshake size={16} /> Register to Participate
              </button>
            )}
            {regResult && (
              <div className={`mt-3 rounded-lg p-3 text-center text-xs font-semibold ${
                regResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                  'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
              }`}>{regResult}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory flex items-center gap-1.5">
        <Calendar size={15} className="text-amber-500" /> Events & Volunteering
      </h3>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-heritage-stone"><RefreshCw size={14} className="animate-spin" /> Loading…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map(e => {
            const days = daysUntil(e.starts_at);
            return (
              <button key={e.id} onClick={() => setSelected(e)}
                className="text-left bg-white dark:bg-heritage-charcoal border border-heritage-stone/30
                  rounded-xl overflow-hidden hover:shadow-md hover:border-heritage-maroon/30 transition-all group">
                {e.cover_image_url && (
                  <div className="h-28 overflow-hidden"><img src={e.cover_image_url} alt={e.title} className="w-full h-full object-cover" /></div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: EVENT_TYPE_COLORS[e.event_type] || '#6B7280' }}>
                      {e.event_type.replace(/_/g, ' ')}
                    </span>
                    {days && days > 0 && <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">{days}d away</span>}
                    {e.organiser_verified && <CheckCircle size={10} className="text-emerald-500" />}
                  </div>
                  <p className="text-sm font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate">{e.title}</p>
                  <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 mt-0.5 truncate flex items-center gap-1">
                    <MapPin size={10} /> {e.location_name}
                  </p>
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 mt-1">
                    {e.registration_count} registered
                    {e.spots_left !== undefined && e.spots_left !== null && ` · ${e.spots_left} spots left`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component — Community Hub
// ─────────────────────────────────────────────────────────────────────────────

type HubTab = 'proposals' | 'polls' | 'projects' | 'events';

export const CommunityHub: React.FC = () => {
  const [stats, setStats] = useState<HubStats | null>(null);
  const [activeTab, setActiveTab] = useState<HubTab>('proposals');

  useEffect(() => {
    fetch(`${API}/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const tabs: Array<{ id: HubTab; label: string; labelOr: string; icon: React.ElementType; color: string; countKey: keyof HubStats }> = [
    { id: 'proposals', label: 'Ideas & Proposals', labelOr: 'ଧାରଣା', icon: Lightbulb, color: '#D97706', countKey: 'total_public_proposals' },
    { id: 'polls',     label: 'Polls & Feedback',  labelOr: 'ମତାମତ', icon: BarChart3,  color: '#0891B2', countKey: 'active_polls' },
    { id: 'projects',  label: 'Community Projects', labelOr: 'ପ୍ରକଳ୍ପ', icon: FolderKanban, color: '#16A34A', countKey: 'active_projects' },
    { id: 'events',    label: 'Events & Volunteering', labelOr: 'ଅନୁଷ୍ଠାନ', icon: Calendar, color: '#8B1A2E', countKey: 'upcoming_events' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-heritage-stone/20 dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-heritage-maroon/10 flex items-center justify-center">
            <Users size={20} className="text-heritage-maroon" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-heritage-charcoal dark:text-heritage-ivory">Community & Participation</h2>
            <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50">
              ସାମୁଦାୟିକ ଅଂଶଗ୍ରହଣ — Your voice. Your neighbourhood. Shared progress.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { label: 'Proposals', value: stats.total_public_proposals, icon: Lightbulb, color: '#D97706' },
              { label: 'Active Polls', value: stats.active_polls, icon: BarChart3, color: '#0891B2' },
              { label: 'Projects', value: stats.active_projects, icon: FolderKanban, color: '#16A34A' },
              { label: 'Events', value: stats.upcoming_events, icon: Calendar, color: '#8B1A2E' },
              { label: 'Support Actions', value: stats.total_citizen_support_actions, icon: Heart, color: '#DC2626' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg">
                <s.icon size={13} style={{ color: s.color }} />
                <span className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory">{s.value}</span>
                <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-heritage-stone/10 dark:border-heritage-charcoal">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-heritage-maroon text-heritage-maroon bg-heritage-maroon/5'
                    : 'border-transparent text-heritage-stone dark:text-heritage-ivory/50 hover:text-heritage-charcoal dark:hover:text-heritage-ivory'
                }`}>
                <Icon size={14} style={{ color: isActive ? tab.color : undefined }} />
                {tab.label}
                {stats && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-heritage-maroon/10 text-heritage-maroon' : 'bg-heritage-stone/10 text-heritage-stone'
                  }`}>{stats[tab.countKey]}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 overflow-y-auto">
        {activeTab === 'proposals' && <ProposalsSection />}
        {activeTab === 'polls' && <PollsSection />}
        {activeTab === 'projects' && <ProjectsSection />}
        {activeTab === 'events' && <EventsSection />}
      </div>
    </div>
  );
};

export default CommunityHub;
