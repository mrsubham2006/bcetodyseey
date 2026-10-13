import React, { useState, useEffect } from 'react';
import { useCitizen } from '../context/CitizenContext';
import { KonarkWheelIcon } from './OdishaMotifs';
import {
  HelpCircle, Search, FileText, Shield, Users, Compass, Smartphone,
  PhoneCall, AlertTriangle, Send, CheckCircle2, AlertCircle, Clock,
  ChevronRight, RefreshCw, MessageSquare, ArrowUpRight, Star,
  CornerDownRight, X, ChevronDown, ChevronUp, Bot, ExternalLink,
  LifeBuoy, Filter, ThumbsUp, ArrowLeft
} from 'lucide-react';

interface HelpCategory {
  category_id: string;
  title: string;
  odia_title: string;
  description: string;
  article_count: number;
  icon_name: string;
}

interface HelpArticle {
  id: number;
  slug: string;
  category: string;
  title: string;
  odia_title?: string;
  snippet: string;
  tags: string[];
  target_module_url?: string;
  helpful_count: number;
  last_updated: string;
}

interface ArticleDetail extends HelpArticle {
  content: string;
  odia_content?: string;
}

interface SupportTicketSummary {
  id: number;
  ticket_code: string;
  category: string;
  title: string;
  status: string;
  priority: string;
  assigned_agent: string;
  linked_record_type?: string;
  linked_record_code?: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  sender_type: string;
  sender_name: string;
  message_text: string;
  attachment_url?: string;
  created_at: string;
}

interface TicketEvent {
  id: number;
  event_type: string;
  actor_name: string;
  details: string;
  created_at: string;
}

interface TicketDetail extends SupportTicketSummary {
  description: string;
  reply_channel: string;
  sla_due_hours: number;
  messages: TicketMessage[];
  events: TicketEvent[];
}

export const HelpAndSupportCenter: React.FC = () => {
  const { citizenUser, isAuthenticated, navigateTo, setShowAuthModal, setAuthMode } = useCitizen();

  const [activeTab, setActiveTab] = useState<'faqs' | 'my_tickets' | 'new_ticket' | 'assistant'>('faqs');
  const citizenId = citizenUser?.id || 1;

  // Knowledge Base State
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [articleLangOdia, setArticleLangOdia] = useState(false);
  const [markedHelpful, setMarkedHelpful] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState('SUBMISSION_ISSUE');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLinkedCode, setNewLinkedCode] = useState('');
  const [newReplyChannel, setNewReplyChannel] = useState('INBOX');
  const [ticketSubmitLoading, setTicketSubmitLoading] = useState(false);
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = useState<string | null>(null);

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'USER' | 'BOT'; text: string; odia?: string; isEmergency?: boolean; actions?: any[] }>>([
    {
      sender: 'BOT',
      text: 'Namaskar! I am the Civic Help Assistant. I can guide you on report submissions, status inquiries, account security, and travel features in Odia, Hindi, or English. How can I help you today?',
      odia: 'ନମସ୍କାର! ମୁଁ ନାଗରିକ ସହାୟତା ଆସିଷ୍ଟାଣ୍ଟ। ମୁଁ ଆପଣଙ୍କୁ ଅଭିଯୋଗ ଦାଖଲ, କେସ୍ ସ୍ଥିତି ଏବଂ ଗୋପନୀୟତା ବିଷୟରେ ସହାୟତା କରିପାରିବି।'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCHERS
  // ─────────────────────────────────────────────────────────────────────────

  const loadCategoriesAndArticles = async () => {
    try {
      setArticlesLoading(true);
      const [catsRes, artsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/help/categories'),
        fetch('http://127.0.0.1:8000/api/help/articles')
      ]);
      if (catsRes.ok) setCategories(await catsRes.json());
      if (artsRes.ok) setArticles(await artsRes.json());
    } catch (err) {
      console.error('Failed to load help knowledge base:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const searchArticles = async (query: string) => {
    if (!query.trim()) {
      loadCategoriesAndArticles();
      return;
    }
    try {
      setArticlesLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/help/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) setArticles(await res.json());
    } catch (err) {
      console.error('Failed to search articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets?citizen_id=${citizenId}`);
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadTicketDetail = async (code: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets/${code}?citizen_id=${citizenId}`);
      if (res.ok) {
        setSelectedTicket(await res.json());
      }
    } catch (err) {
      console.error('Failed to load ticket detail:', err);
    }
  };

  const openArticle = async (slug: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/help/articles/${slug}`);
      if (res.ok) {
        setSelectedArticle(await res.json());
        setMarkedHelpful(false);
        setArticleLangOdia(false);
      }
    } catch (err) {
      console.error('Failed to open article detail:', err);
    }
  };

  useEffect(() => {
    loadCategoriesAndArticles();
    loadTickets();
  }, [citizenId]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      setTicketSubmitLoading(true);
      setTicketSubmitSuccess(null);

      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          title: newTitle.trim(),
          description: newDescription.trim(),
          linked_record_type: newLinkedCode ? 'REPORT' : undefined,
          linked_record_code: newLinkedCode.trim() || undefined,
          reply_channel: newReplyChannel
        })
      });

      if (!res.ok) throw new Error('Failed to create ticket');
      const created = await res.json();
      setTicketSubmitSuccess(`Support Ticket #${created.ticket_code} created successfully! Our civic help desk responds within 24 hours.`);
      setNewTitle('');
      setNewDescription('');
      setNewLinkedCode('');
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Error submitting support request.');
    } finally {
      setTicketSubmitLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      setReplyLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets/${selectedTicket.ticket_code}/messages?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: replyText.trim() })
      });
      if (res.ok) {
        setReplyText('');
        loadTicketDetail(selectedTicket.ticket_code);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket || !escalateReason.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets/${selectedTicket.ticket_code}/escalations?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: escalateReason.trim() })
      });
      if (res.ok) {
        setShowEscalateModal(false);
        setEscalateReason('');
        loadTicketDetail(selectedTicket.ticket_code);
        loadTickets();
      }
    } catch (err) {
      console.error('Failed to escalate ticket:', err);
    }
  };

  const handleFeedback = async () => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citizen/support-tickets/${selectedTicket.ticket_code}/feedback?citizen_id=${citizenId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment.trim() })
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'USER', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/help/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'BOT',
            text: data.message,
            odia: data.odia_message,
            isEmergency: data.is_emergency,
            actions: data.quick_actions || data.suggested_actions
          }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'BOT',
          text: 'Temporary network disconnect. You can search our FAQs or submit a support ticket directly.'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* ── EMERGENCY TRIAGE BANNER (CRITICAL LIFE-SAFETY SEPARATION) ────────── */}
      <div className="rounded-2xl bg-red-600 text-white p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <span>Immediate Life-Safety Emergency?</span>
              <span className="text-white/80 font-normal">| ଜରୁରୀକାଳୀନ ସେବା</span>
            </h4>
            <p className="text-[11px] text-white/90 mt-0.5">
              Help Desk is for app & civic workflow assistance. For accidents, fire, collapse or crime, dial official emergency services directly:
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
          <a
            href="tel:112"
            className="px-3 py-1.5 rounded-xl bg-white text-red-700 font-mono font-bold text-xs hover:bg-white/90 flex items-center space-x-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>112 (National)</span>
          </a>
          <a
            href="tel:108"
            className="px-3 py-1.5 rounded-xl bg-white text-red-700 font-mono font-bold text-xs hover:bg-white/90 flex items-center space-x-1"
          >
            <PhoneCall className="w-3 h-3" />
            <span>108 (Ambulance)</span>
          </a>
          <a
            href="tel:18003450061"
            className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-mono font-bold text-xs hover:bg-white/30 border border-white/30"
          >
            <span>BMC: 1800-345-0061</span>
          </a>
        </div>
      </div>

      {/* ── HEADER BANNER (Odisha Heritage Aesthetic) ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-heritage-maroon via-heritage-maroon-dark to-[#2b0f15] text-white p-6 sm:p-8 shadow-heritage border border-heritage-gold/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
          <KonarkWheelIcon className="w-72 h-72 text-heritage-gold" />
        </div>

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-heritage-gold/20 text-heritage-gold text-xs font-semibold border border-heritage-gold/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Citizen Help & Support Center | ସହାୟତା କେନ୍ଦ୍ର</span>
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white tracking-wide">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Search approved troubleshooting articles, track your support tickets, or chat with the AI assistant for instant step-by-step guidance.
          </p>

          {/* Instant Search Bar */}
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                searchArticles(e.target.value);
              }}
              placeholder="Search help articles, upload errors, SLA charter, or keywords..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory shadow-lg border border-heritage-gold/40 focus:outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-white/15 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'faqs' as const, label: 'Help Articles & FAQs', labelOr: 'ପ୍ରଶ୍ନୋତ୍ତର', icon: FileText },
            { id: 'new_ticket' as const, label: 'New Support Request', labelOr: 'ନୂତନ ଟିକେଟ୍', icon: MessageSquare },
            { id: 'my_tickets' as const, label: 'My Support Requests', labelOr: 'ମୋର ଅନୁରୋଧ', icon: Clock, count: tickets.length },
            { id: 'assistant' as const, label: 'AI Help Assistant', labelOr: 'ଏଆଇ ଆସିଷ୍ଟାଣ୍ଟ', icon: Bot },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-heritage-gold text-heritage-maroon-dark shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-heritage-maroon text-heritage-gold' : 'bg-white/20 text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: HELP ARTICLES & FAQS ──────────────────────────────────────── */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Categories Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                loadCategoriesAndArticles();
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                selectedCategory === 'ALL'
                  ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10'
                  : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold/40'
              }`}
            >
              <FileText className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold mb-1.5" />
              <span className="block font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">All Topics</span>
              <span className="text-[10px] text-heritage-aged">{articles.length} Guides</span>
            </button>

            {categories.map(c => (
              <button
                key={c.category_id}
                onClick={() => {
                  setSelectedCategory(c.category_id);
                  setArticlesLoading(true);
                  fetch(`http://127.0.0.1:8000/api/help/articles?category=${c.category_id}`)
                    .then(r => r.json())
                    .then(data => setArticles(data))
                    .finally(() => setArticlesLoading(false));
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedCategory === c.category_id
                    ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10'
                    : 'border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold/40'
                }`}
              >
                {c.category_id === 'REPORTS' ? <FileText className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold mb-1.5" /> :
                 c.category_id === 'ACCOUNT' ? <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1.5" /> :
                 c.category_id === 'COMMUNITY' ? <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" /> :
                 c.category_id === 'TOURISM' ? <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1.5" /> :
                 <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1.5" />}
                <span className="block font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory truncate">{c.title}</span>
                <span className="text-[10px] text-heritage-aged">{c.article_count} Articles</span>
              </button>
            ))}
          </div>

          {/* Article Grid */}
          {articlesLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-heritage-gold mx-auto mb-2" />
              <p className="text-xs text-heritage-aged">Loading help knowledge base...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-3xl">
              <HelpCircle className="w-10 h-10 text-heritage-aged opacity-40 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">No articles found</h4>
              <p className="text-xs text-heritage-aged mt-1">Try another search keyword or ask our AI Help Assistant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map(art => (
                <div
                  key={art.id}
                  onClick={() => openArticle(art.slug)}
                  className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold/70 shadow-sm cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-heritage-aged">
                      Updated {new Date(art.last_updated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory group-hover:text-heritage-maroon dark:group-hover:text-heritage-gold transition-colors">
                    {art.title}
                  </h3>

                  {art.odia_title && (
                    <p className="text-xs text-heritage-aged/90 font-serif">
                      {art.odia_title}
                    </p>
                  )}

                  <p className="text-xs text-heritage-aged leading-relaxed line-clamp-2">
                    {art.snippet}
                  </p>

                  <div className="pt-2 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex items-center justify-between text-xs text-heritage-maroon dark:text-heritage-gold font-semibold">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3 opacity-60" />
                      <span className="text-[10px] text-heritage-aged">{art.helpful_count} citizens found helpful</span>
                    </span>
                    <span className="flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Read Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Article Detail Drawer Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-heritage-gold/40 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-heritage-stone/30 dark:border-heritage-charcoal">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-heritage-gold/20 text-heritage-gold block w-fit mb-1">
                      {selectedArticle.category}
                    </span>
                    <h2 className="font-serif font-bold text-lg sm:text-xl text-heritage-charcoal dark:text-heritage-ivory">
                      {articleLangOdia && selectedArticle.odia_title ? selectedArticle.odia_title : selectedArticle.title}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedArticle(null)} className="p-1.5 rounded-full hover:bg-heritage-stone/30 text-heritage-aged">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Translation Pill Toggle */}
                {selectedArticle.odia_content && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-heritage-aged">Language:</span>
                    <button
                      onClick={() => setArticleLangOdia(false)}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${!articleLangOdia ? 'bg-heritage-maroon text-white' : 'bg-heritage-stone/20 text-heritage-aged'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setArticleLangOdia(true)}
                      className={`px-2.5 py-1 rounded-lg font-semibold ${articleLangOdia ? 'bg-heritage-maroon text-white' : 'bg-heritage-stone/20 text-heritage-aged'}`}
                    >
                      ଓଡ଼ିଆ (Odia)
                    </button>
                  </div>
                )}

                {/* Article Body */}
                <div className="text-xs sm:text-sm text-heritage-charcoal/90 dark:text-heritage-ivory/90 leading-relaxed space-y-3 whitespace-pre-line">
                  {articleLangOdia && selectedArticle.odia_content
                    ? selectedArticle.odia_content
                    : selectedArticle.content}
                </div>

                {/* Related Module Shortcut */}
                {selectedArticle.target_module_url && (
                  <div className="p-3.5 rounded-2xl bg-heritage-maroon/5 dark:bg-heritage-gold/10 border border-heritage-maroon/20 dark:border-heritage-gold/20 flex items-center justify-between text-xs">
                    <span className="text-heritage-charcoal dark:text-heritage-ivory font-medium">
                      Ready to apply this solution in the platform?
                    </span>
                    <button
                      onClick={() => {
                        const url = selectedArticle.target_module_url;
                        setSelectedArticle(null);
                        if (url?.includes('report')) navigateTo('report');
                        else if (url?.includes('cases')) navigateTo('cases');
                        else if (url?.includes('profile')) navigateTo('profile');
                        else if (url?.includes('tourism')) navigateTo('tourism');
                        else if (url?.includes('community')) navigateTo('community');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-heritage-maroon text-white font-semibold hover:bg-heritage-maroon-dark transition-colors flex items-center space-x-1"
                    >
                      <span>Open Feature</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Helpful Feedback Button */}
                <div className="pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setMarkedHelpful(true)}
                      disabled={markedHelpful}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${
                        markedHelpful
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-heritage-stone hover:border-heritage-gold'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{markedHelpful ? 'Thank you!' : 'This solved my issue'}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      setActiveTab('new_ticket');
                    }}
                    className="text-heritage-maroon dark:text-heritage-gold font-semibold hover:underline"
                  >
                    Still need help? Open support request →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CREATE NEW SUPPORT REQUEST ───────────────────────────────── */}
      {activeTab === 'new_ticket' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">Open a Support Request</h2>
            <p className="text-xs text-heritage-aged mt-0.5">
              Experiencing a bug, upload failure, missing notification or dispute? Our municipal platform desk will investigate.
            </p>
          </div>

          {ticketSubmitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{ticketSubmitSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-2">
                What do you need help with?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'SUBMISSION_ISSUE', label: 'Report submission or photo upload error' },
                  { id: 'CASE_TRACKING', label: 'Case status clarification or dispute' },
                  { id: 'ACCOUNT_PRIVACY', label: 'Account, sign-in or DPDP privacy questions' },
                  { id: 'NOTIFICATION_INBOX', label: 'Missing alerts or notification settings' },
                  { id: 'TOURISM_COMMUNITY', label: 'Community voting or smart tourism guides' },
                  { id: 'TECHNICAL', label: 'Other platform glitch or performance issue' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                      newCategory === opt.id
                        ? 'border-heritage-maroon dark:border-heritage-gold bg-heritage-maroon/5 dark:bg-heritage-gold/10 font-bold text-heritage-charcoal dark:text-heritage-ivory'
                        : 'border-heritage-stone dark:border-heritage-charcoal text-heritage-aged'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ticketCategory"
                      value={opt.id}
                      checked={newCategory === opt.id}
                      onChange={() => setNewCategory(opt.id)}
                      className="mt-0.5 text-heritage-maroon focus:ring-heritage-gold"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                Short Summary
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Photo upload keeps timing out on Jio 5G"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                Detailed Explanation
              </label>
              <textarea
                rows={4}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Please describe what happened, what device or browser you are using, and any error message displayed..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Linked Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={newLinkedCode}
                  onChange={e => setNewLinkedCode(e.target.value)}
                  placeholder="e.g. CN-1982 or REP-OD-2026-4821"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                />
                <span className="text-[10px] text-heritage-aged mt-0.5 block">Links ticket directly to your existing civic complaint.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                  Reply Preference
                </label>
                <select
                  value={newReplyChannel}
                  onChange={e => setNewReplyChannel(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/40 focus:outline-none"
                >
                  <option value="INBOX">Civic Nexus AI Inbox (Recommended)</option>
                  <option value="EMAIL">Verified Email Notification</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/30 dark:border-heritage-charcoal text-[11px] text-heritage-aged leading-relaxed">
              <span className="font-bold text-heritage-charcoal dark:text-heritage-ivory block mb-1">Declaration:</span>
              I understand that diagnostic information regarding my device and reported complaint reference will be shared with the authorized support desk to investigate this ticket.
            </div>

            <button
              type="submit"
              disabled={ticketSubmitLoading}
              className="px-6 py-2.5 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-2"
            >
              {ticketSubmitLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Support Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 3: MY SUPPORT REQUESTS ───────────────────────────────────────── */}
      {activeTab === 'my_tickets' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold">My Support Requests</h2>
              <p className="text-xs text-heritage-aged mt-0.5">
                Track status, communicate with desk agents, or request escalation for pending issues.
              </p>
            </div>
            <button
              onClick={loadTickets}
              className="px-3.5 py-1.5 rounded-xl border border-heritage-stone text-xs font-semibold hover:border-heritage-gold flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {ticketsLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-heritage-gold mx-auto mb-2" />
              <p className="text-xs text-heritage-aged">Loading support requests...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-heritage-stone dark:border-heritage-charcoal rounded-3xl">
              <Clock className="w-10 h-10 text-heritage-aged opacity-40 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">No support requests yet</h4>
              <p className="text-xs text-heritage-aged mt-1">If you encounter issues, open a request from the New Support Request tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(t => (
                <div
                  key={t.id}
                  onClick={() => loadTicketDetail(t.ticket_code)}
                  className="p-5 rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal hover:border-heritage-gold transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-heritage-maroon dark:text-heritage-gold">
                        {t.ticket_code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        t.status === 'WAITING_CITIZEN' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        t.status === 'ESCALATED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-heritage-stone/30 text-heritage-aged'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-heritage-aged">
                        Category: {t.category.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory group-hover:text-heritage-maroon dark:group-hover:text-heritage-gold transition-colors">
                      {t.title}
                    </h4>

                    {t.linked_record_code && (
                      <p className="text-[11px] text-heritage-aged">
                        Linked Case: <span className="font-mono font-semibold text-heritage-charcoal dark:text-heritage-ivory">{t.linked_record_code}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                    <div className="text-right text-[10px] text-heritage-aged hidden sm:block">
                      <span>Assigned to:</span>
                      <span className="font-medium text-heritage-charcoal dark:text-heritage-ivory block truncate max-w-[160px]">{t.assigned_agent}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-heritage-aged group-hover:text-heritage-gold transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ticket Detail Drawer Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-heritage-gold/40 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between pb-3 border-b border-heritage-stone/30 dark:border-heritage-charcoal">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-heritage-gold">{selectedTicket.ticket_code}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-heritage-stone/20">
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory mt-1">
                      {selectedTicket.title}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-1.5 rounded-full hover:bg-heritage-stone/30 text-heritage-aged">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Conversation History */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged block">
                    Conversation History
                  </span>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-3 rounded-2xl bg-heritage-stone/10 dark:bg-heritage-charcoal-dark border border-heritage-stone/20">
                    {selectedTicket.messages.map(m => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          m.sender_type === 'CITIZEN'
                            ? 'bg-heritage-maroon/10 dark:bg-heritage-gold/10 ml-6 border border-heritage-maroon/20'
                            : 'bg-white dark:bg-heritage-charcoal mr-6 border border-heritage-stone/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-heritage-aged">
                          <span>{m.sender_name} ({m.sender_type})</span>
                          <span>{new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-heritage-charcoal dark:text-heritage-ivory leading-relaxed">{m.message_text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post Reply Box */}
                {selectedTicket.status !== 'CLOSED' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-aged block">
                      Post Citizen Reply
                    </span>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type additional details or clarification..."
                        className="flex-1 px-4 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:outline-none focus:ring-2 focus:ring-heritage-gold"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={replyLoading}
                        className="px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Escalation & Feedback Controls */}
                <div className="pt-3 border-t border-heritage-stone/30 dark:border-heritage-charcoal flex items-center justify-between flex-wrap gap-2 text-xs">
                  {selectedTicket.status !== 'ESCALATED' && selectedTicket.status !== 'CLOSED' && (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Request Supervisor Escalation</span>
                    </button>
                  )}

                  {selectedTicket.status === 'RESOLVED' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-heritage-aged">Rate Resolution:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => {
                            setFeedbackRating(star);
                            handleFeedback();
                          }}
                          className={`p-1 ${feedbackRating >= star ? 'text-amber-500' : 'text-heritage-aged'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Supervisor Escalation Confirmation Modal */}
          {showEscalateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-heritage-charcoal rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-400 space-y-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">Formal Supervisor Escalation</h3>
                </div>

                <p className="text-xs text-heritage-aged leading-relaxed">
                  Under the Bhubaneswar Municipal Citizen Charter, tickets that exceed the 24-48 hour resolution window can be escalated to a Level 2 Zonal Officer.
                </p>

                <div>
                  <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
                    Escalation Reason
                  </label>
                  <input
                    type="text"
                    value={escalateReason}
                    onChange={e => setEscalateReason(e.target.value)}
                    placeholder="e.g. Overdue response on critical streetlight circuit"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button onClick={() => setShowEscalateModal(false)} className="px-4 py-2 rounded-xl border border-heritage-stone text-xs font-semibold">
                    Cancel
                  </button>
                  <button onClick={handleEscalate} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
                    Confirm Escalation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SMART HELP ASSISTANT (AI) ─────────────────────────────────── */}
      {activeTab === 'assistant' && (
        <div className="bg-white dark:bg-heritage-charcoal rounded-3xl border border-heritage-stone dark:border-heritage-charcoal p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <h2 className="font-serif font-bold text-xl text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Smart Civic Help Assistant (AI)</span>
            </h2>
            <p className="text-xs text-heritage-aged mt-0.5">
              Grounded in verified municipal documentation. Detects Odia, Hindi & English and guides you directly to the right citizen workflow.
            </p>
          </div>

          {/* Chat Window */}
          <div className="border border-heritage-stone/40 dark:border-heritage-charcoal rounded-2xl p-4 min-h-[360px] max-h-[500px] overflow-y-auto space-y-3 bg-heritage-stone/5 dark:bg-heritage-charcoal-dark">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl text-xs space-y-2 max-w-xl ${
                  msg.sender === 'USER'
                    ? 'ml-auto bg-heritage-maroon text-white rounded-br-none shadow-sm'
                    : msg.isEmergency
                    ? 'bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-900 dark:text-red-200 rounded-bl-none'
                    : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone/40 text-heritage-charcoal dark:text-heritage-ivory rounded-bl-none shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-1.5 opacity-80 text-[10px] font-bold">
                  {msg.sender === 'BOT' ? <Bot className="w-3 h-3" /> : null}
                  <span>{msg.sender === 'USER' ? 'You' : 'Civic Nexus Assistant'}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                {msg.odia && (
                  <p className="text-[11px] opacity-90 font-serif pt-1 border-t border-current/10">
                    {msg.odia}
                  </p>
                )}

                {/* Quick actions inside bot message */}
                {msg.actions && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.actions.map((act: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (act.action === 'CREATE_TICKET') setActiveTab('new_ticket');
                          else if (act.action === 'VIEW_FAQS') setActiveTab('faqs');
                          else if (act.url?.includes('report')) navigateTo('report');
                          else if (act.url?.includes('cases')) navigateTo('cases');
                          else if (act.tel) window.location.href = `tel:${act.tel}`;
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-heritage-stone/20 dark:bg-heritage-charcoal-dark hover:bg-heritage-gold hover:text-heritage-maroon-dark transition-colors flex items-center space-x-1"
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="p-3 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone/30 w-fit text-xs text-heritage-aged flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-heritage-gold" />
                <span>Consulting approved municipal knowledge base...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSend} className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a question in English or ଓଡ଼ିଆ (e.g. 'Photo not uploading' or 'ଅଭିଯୋଗ ଟ୍ରାକ୍ କିପରି କରିବେ')..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:outline-none focus:ring-2 focus:ring-heritage-gold"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="px-6 py-3 rounded-2xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
