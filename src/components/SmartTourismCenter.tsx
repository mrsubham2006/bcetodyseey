import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass, MapPin, Search, Filter, Calendar, Clock, AlertTriangle,
  Bookmark, CheckCircle2, Shield, Sparkles, Navigation, Info, Heart,
  Share2, ChevronRight, X, ExternalLink, RefreshCw, Car, Bus, Train,
  Plane, Eye, Star, AlertCircle, MessageSquare, Send, Check, Footprints,
  SlidersHorizontal, Layers, Award, Landmark, Trees, Waves, Palette, Utensils
} from 'lucide-react';
import { KonarkWheelIcon } from './OdishaMotifs';

interface DestinationSummary {
  id: number;
  destination_code: string;
  name: string;
  odia_name: string;
  hindi_name?: string;
  category: string;
  district: string;
  tagline?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  official_source: string;
  last_verified_at: string;
  timings: string;
  entry_fee: string;
  estimated_visit_duration: string;
  accessibility_status: string;
  safety_status: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
}

interface DestinationDetail extends DestinationSummary {
  description: string;
  cultural_significance?: string;
  history_context?: string;
  gallery_urls: string[];
  best_time_to_visit: string;
  how_to_reach?: string;
  nearest_airport: string;
  nearest_railway?: string;
  facilities: Record<string, boolean>;
  accessibility_details?: string;
  visitor_rules?: string;
  environmental_guidelines?: string;
  active_advisories: Array<{
    id: number;
    advisory_code: string;
    title: string;
    severity: string;
    description: string;
    issuing_authority: string;
  }>;
  upcoming_events: Array<{
    id: number;
    event_code: string;
    title: string;
    start_date: string;
    venue: string;
  }>;
}

interface TourismEvent {
  id: number;
  event_code: string;
  title: string;
  odia_title?: string;
  venue: string;
  district: string;
  category: string;
  start_date: string;
  end_date: string;
  timings: string;
  ticket_info: string;
  organiser: string;
  verified_source: string;
  status: string;
  cover_image_url?: string;
}

interface TourismAdvisory {
  id: number;
  advisory_code: string;
  title: string;
  severity: string;
  category: string;
  district: string;
  description: string;
  alternative_suggestion?: string;
  issuing_authority: string;
  valid_from?: string;
  valid_until?: string;
}

interface HeritageTrail {
  id: string;
  name: string;
  odia_name: string;
  description: string;
  duration: string;
  distance_km: number;
  theme: string;
  highlights: string[];
  image_url: string;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Destinations', labelOr: 'ସମସ୍ତ ସ୍ଥଳ', icon: Compass },
  { id: 'HERITAGE_TEMPLE', label: 'Temples & Heritage', labelOr: 'ମନ୍ଦିର ଓ ଐତିହ୍ୟ', icon: Landmark },
  { id: 'NATURE_WILDLIFE', label: 'Nature & Wildlife', labelOr: 'ପ୍ରକୃତି ଓ ଅଭୟାରଣ୍ୟ', icon: Trees },
  { id: 'BEACHES_COAST', label: 'Beaches & Coast', labelOr: 'ବେଳାଭୂମି ଓ ଉପକୂଳ', icon: Waves },
  { id: 'ARTS_CRAFTS', label: 'Arts & Crafts', labelOr: 'ହସ୍ତତନ୍ତ ଓ ଶିଳ୍ପ', icon: Palette },
];

const DISTRICTS = ['ALL', 'Puri', 'Khordha', 'Mayurbhanj', 'Cuttack', 'Ganjam', 'Sambalpur'];

export const SmartTourismCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'planner' | 'updates' | 'trails' | 'companion' | 'saved'>('discover');
  const [lang, setLang] = useState<'en' | 'or'>('en');

  // Directory state
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [accessibilityFilter, setAccessibilityFilter] = useState<string>('ALL');

  // Detail Modal
  const [selectedDestId, setSelectedDestId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<DestinationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Correction Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [correctionType, setCorrectionType] = useState<string>('TIMINGS');
  const [correctionDesc, setCorrectionDesc] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>(null);

  // Events & Advisories
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [advisories, setAdvisories] = useState<TourismAdvisory[]>([]);

  // Heritage Trails
  const [trails, setTrails] = useState<HeritageTrail[]>([]);

  // Saved Bookmarks
  const [savedDestinations, setSavedDestinations] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Smart Planner State
  const [plannerDays, setPlannerDays] = useState<number>(2);
  const [plannerInterest, setPlannerInterest] = useState<string>('HERITAGE_CULTURE');
  const [plannerPace, setPlannerPace] = useState<string>('BALANCED');
  const [plannerTransport, setPlannerTransport] = useState<string>('PUBLIC_OR_TAXI');
  const [plannerAccessibility, setPlannerAccessibility] = useState<boolean>(false);
  const [plannedStops, setPlannedStops] = useState<any[]>([]);
  const [plannerSummary, setPlannerSummary] = useState<string>('');
  const [plannerLoading, setPlannerLoading] = useState<boolean>(false);
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);

  // AI Companion Chat
  const [companionInput, setCompanionInput] = useState<string>('');
  const [companionMessages, setCompanionMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Namaskar! I am your Odisha Cultural & Travel Companion. Ask me for personalized trip recommendations, temple timings, or verified road conditions between destinations.',
      time: 'Just now'
    }
  ]);
  const [companionLoading, setCompanionLoading] = useState<boolean>(false);

  // ───────────────────────────────────────────────────────────────────────────
  // API FETCHERS
  // ───────────────────────────────────────────────────────────────────────────

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedDistrict !== 'ALL') params.append('district', selectedDistrict);
      if (accessibilityFilter !== 'ALL') params.append('accessibility', accessibilityFilter);

      const res = await fetch(`/api/tourism/destinations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDestinations(data.destinations || []);
      }
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDistrict, accessibilityFilter]);

  const fetchDetail = async (id: number) => {
    setSelectedDestId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/tourism/destinations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      }
    } catch (err) {
      console.error('Failed to load destination detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchEventsAndAdvisories = async () => {
    try {
      const [evRes, advRes, trailRes, itinRes] = await Promise.all([
        fetch('/api/tourism/events'),
        fetch('/api/tourism/advisories'),
        fetch('/api/tourism/heritage-trails'),
        fetch('/api/tourism/itineraries')
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (advRes.ok) setAdvisories(await advRes.json());
      if (trailRes.ok) setTrails(await trailRes.json());
      if (itinRes.ok) setSavedItineraries(await itinRes.json());
    } catch (err) {
      console.error('Failed to load supplementary tourism data:', err);
    }
  };

  const fetchSavedDestinations = async () => {
    try {
      const res = await fetch('/api/tourism/saved-destinations?citizen_id=1');
      if (res.ok) {
        const data = await res.json();
        setSavedDestinations(data);
        setSavedIds(new Set(data.map((item: any) => item.destination_id)));
      }
    } catch (err) {
      console.error('Failed to load saved destinations:', err);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  useEffect(() => {
    fetchEventsAndAdvisories();
    fetchSavedDestinations();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // INTERACTIONS
  // ───────────────────────────────────────────────────────────────────────────

  const toggleBookmark = async (destId: number) => {
    const isSaved = savedIds.has(destId);
    if (isSaved) {
      try {
        const res = await fetch(`/api/tourism/saved-destinations/${destId}?citizen_id=1`, { method: 'DELETE' });
        if (res.ok) {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(destId);
            return next;
          });
          fetchSavedDestinations();
        }
      } catch (err) {
        console.error('Error removing bookmark:', err);
      }
    } else {
      try {
        const res = await fetch(`/api/tourism/saved-destinations?destination_id=${destId}&citizen_id=1`, { method: 'POST' });
        if (res.ok) {
          setSavedIds(prev => new Set(prev).add(destId));
          fetchSavedDestinations();
        }
      } catch (err) {
        console.error('Error saving bookmark:', err);
      }
    }
  };

  const handleGeneratePlan = async () => {
    setPlannerLoading(true);
    try {
      const res = await fetch('/api/tourism/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_days: plannerDays,
          interests: [plannerInterest],
          starting_location: 'Bhubaneswar',
          travel_pace: plannerPace,
          require_accessibility: plannerAccessibility
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPlannedStops(data.stops || []);
        setPlannerSummary(data.summary || '');
      }
    } catch (err) {
      console.error('Planner generation failed:', err);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (plannedStops.length === 0) return;
    try {
      const res = await fetch('/api/tourism/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `My ${plannerDays}-Day Odisha ${plannerInterest.replace('_', ' ')} Trip`,
          duration_days: plannerDays,
          starting_location: 'Bhubaneswar',
          main_interest: plannerInterest,
          travel_pace: plannerPace,
          stops_data: plannedStops
        })
      });
      if (res.ok) {
        alert('Itinerary saved to your travel collection!');
        fetchEventsAndAdvisories();
      }
    } catch (err) {
      console.error('Failed to save itinerary:', err);
    }
  };

  const handleSendCompanionMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companionInput.trim() || companionLoading) return;

    const userText = companionInput.trim();
    setCompanionInput('');
    setCompanionMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setCompanionLoading(true);

    try {
      const res = await fetch('/api/tourism/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          duration_days: 2,
          interests: ['HERITAGE_TEMPLE'],
          travel_pace: 'BALANCED'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const aiText = `${data.itinerary_title}\n\n${data.summary}\n\nKey Stops Suggested: ${data.stops?.slice(0, 3).map((s: any) => s.destination_name).join(' → ')}.`;
        setCompanionMessages(prev => [...prev, { sender: 'ai', text: aiText, time: 'Just now' }]);
      } else {
        setCompanionMessages(prev => [...prev, {
          sender: 'ai',
          text: 'I could not generate recommendations for that query right now. Please explore our verified destination directory or check the Golden Triangle circuit.',
          time: 'Just now'
        }]);
      }
    } catch {
      setCompanionMessages(prev => [...prev, {
        sender: 'ai',
        text: 'The AI Travel Companion is momentarily unavailable. Please check the Discover tab.',
        time: 'Just now'
      }]);
    } finally {
      setCompanionLoading(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestId || !correctionDesc.trim()) return;

    try {
      const res = await fetch('/api/tourism/content-corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_id: selectedDestId,
          reported_by_name: reporterName || 'Tourist Reviewer',
          correction_type: correctionType,
          description: correctionDesc
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCorrectionSuccess(`Report ${data.correction_code} received! Thank you for maintaining civic and tourist accuracy.`);
        setTimeout(() => {
          setShowCorrectionModal(false);
          setCorrectionSuccess(null);
          setCorrectionDesc('');
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to submit correction:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-8 bg-heritage-ivory dark:bg-heritage-charcoal-dark min-h-screen text-heritage-charcoal dark:text-heritage-ivory">
      
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-r from-heritage-maroon via-[#6b1424] to-[#4a0d18] text-white p-6 sm:p-8 shadow-xl border border-heritage-gold/30">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#C49A45 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }} />
        <KonarkWheelIcon size={120} className="absolute -right-6 -bottom-6 text-heritage-gold opacity-15 animate-spin-slow" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-heritage-gold/25 border border-heritage-gold/40 text-heritage-gold text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Odisha Smart Tourism</span>
              </span>
              <span className="text-white/60 text-xs">·</span>
              <span className="text-heritage-gold/90 text-xs font-serif italic">CIVIC NEXUS AI Companion</span>
            </div>
            
            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              {lang === 'en' ? 'Discover Odisha' : 'ଓଡ଼ିଶା ଦର୍ଶନ'}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-light leading-relaxed">
              {lang === 'en'
                ? 'Culture, nature, heritage & experiences — thoughtfully connected with real-time civic updates, accessibility and verified sources.'
                : 'ଐତିହ୍ୟ, ସଂସ୍କୃତି ଓ ପ୍ରକୃତିର ସମନ୍ୱୟ — ସତ୍ୟାପିତ ସୂଚନା ଏବଂ ସୁଗମ ପର୍ଯ୍ୟଟନ ସହ।'}
            </p>
          </div>

          {/* Quick Metrics & Lang toggle */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex bg-black/30 backdrop-blur-md rounded-2xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${lang === 'en' ? 'bg-heritage-gold text-heritage-charcoal shadow-sm' : 'text-white/70 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLang('or')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${lang === 'or' ? 'bg-heritage-gold text-heritage-charcoal shadow-sm' : 'text-white/70 hover:text-white'}`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>
        </div>

        {/* Hero telemetry strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] text-heritage-gold uppercase tracking-wider font-semibold">Verified Destinations</p>
            <p className="text-lg font-bold text-white mt-0.5">{destinations.length || 8} Sites</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] text-heritage-gold uppercase tracking-wider font-semibold">Cultural Festivals</p>
            <p className="text-lg font-bold text-white mt-0.5">{events.length || 3} Scheduled</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] text-heritage-gold uppercase tracking-wider font-semibold">Live Civic Advisories</p>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{advisories.length || 3} Active</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
            <p className="text-[10px] text-heritage-gold uppercase tracking-wider font-semibold">Curated Trails</p>
            <p className="text-lg font-bold text-white mt-0.5">{trails.length || 3} Circuits</p>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVIGATION TABS ────────────────────────────────────────────── */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-6 border-b border-heritage-stone dark:border-heritage-charcoal scrollbar-none">
        {[
          { id: 'discover', label: 'Discover Destinations', labelOr: 'ସ୍ଥଳ ଅନ୍ୱେଷଣ', icon: Compass },
          { id: 'planner', label: 'Smart Trip Planner', labelOr: 'ଯାତ୍ରା ଯୋଜନା', icon: Navigation },
          { id: 'updates', label: 'Live Travel & Civic Alerts', labelOr: 'ସତର୍କତା ଓ ଘଟଣାବଳୀ', icon: AlertTriangle, badge: advisories.length },
          { id: 'trails', label: 'Heritage Trails', labelOr: 'ଐତିହ୍ୟ ପରିକ୍ରମା', icon: Footprints },
          { id: 'companion', label: 'AI Travel Companion', labelOr: 'ଏଆଇ ସହାୟକ', icon: Sparkles },
          { id: 'saved', label: 'My Travel Collection', labelOr: 'ମୋ ସଂଗ୍ରହ', icon: Bookmark, badge: savedIds.size },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-heritage-maroon text-white shadow-heritage'
                  : 'bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory hover:bg-heritage-gold/10 border border-heritage-stone dark:border-heritage-charcoal'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-heritage-gold' : 'text-heritage-maroon dark:text-heritage-gold'}`} />
              <span>{lang === 'en' ? tab.label : tab.labelOr}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-heritage-gold text-heritage-charcoal' : 'bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DISCOVER DESTINATIONS ────────────────────────────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search temples, beaches, wetlands, craft villages, districts..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-aged hover:text-heritage-charcoal">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* District Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-heritage-aged whitespace-nowrap">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:outline-none font-medium"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d === 'ALL' ? 'All Districts' : d}</option>
                  ))}
                </select>
              </div>

              {/* Accessibility Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-heritage-aged whitespace-nowrap">Accessibility:</span>
                <select
                  value={accessibilityFilter}
                  onChange={e => setAccessibilityFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal-dark bg-heritage-ivory/50 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory focus:outline-none font-medium"
                >
                  <option value="ALL">Any Accessibility</option>
                  <option value="VERIFIED_ACCESSIBLE">♿ Verified Accessible</option>
                  <option value="PARTIALLY_ACCESSIBLE">Partially Accessible</option>
                </select>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex space-x-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isCatActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                      isCatActive
                        ? 'bg-heritage-gold text-heritage-charcoal font-bold shadow-sm'
                        : 'bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory hover:bg-heritage-stone/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? cat.label : cat.labelOr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destinations Grid */}
          {loading ? (
            <div className="p-12 text-center text-heritage-aged">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-heritage-maroon dark:text-heritage-gold" />
              <p className="text-xs">Loading verified Odisha destinations...</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-heritage-charcoal rounded-2xl border border-dashed border-heritage-stone dark:border-heritage-charcoal">
              <Compass className="w-10 h-10 mx-auto text-heritage-aged/50 mb-3" />
              <h3 className="font-bold text-sm">No destinations matched your criteria</h3>
              <p className="text-xs text-heritage-aged mt-1">Try resetting the search query or category filters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedDistrict('ALL'); setAccessibilityFilter('ALL'); }}
                className="mt-4 px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {destinations.map(d => {
                const isSaved = savedIds.has(d.id);
                return (
                  <div
                    key={d.id}
                    className="group rounded-3xl overflow-hidden bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:shadow-xl hover:border-heritage-gold/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Image & Floating Tags */}
                    <div className="relative h-48 overflow-hidden bg-heritage-charcoal">
                      <img
                        src={d.image_url || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'}
                        alt={d.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Top bar over image */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {d.district} District
                        </span>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(d.id); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                            isSaved
                              ? 'bg-heritage-gold text-heritage-maroon shadow-md'
                              : 'bg-black/40 text-white hover:bg-white hover:text-heritage-maroon'
                          }`}
                          title={isSaved ? 'Remove from My Travel Collection' : 'Save to My Travel Collection'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom strip over image */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-heritage-gold uppercase tracking-wider bg-heritage-maroon/90 px-2.5 py-0.5 rounded-md border border-heritage-gold/30">
                            {d.category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-1.5 mt-1 text-white text-[11px]">
                            <Star className="w-3.5 h-3.5 fill-heritage-gold text-heritage-gold" />
                            <span className="font-bold">{d.rating.toFixed(1)}</span>
                            <span className="text-white/60 text-[10px]">({d.review_count})</span>
                          </div>
                        </div>

                        {d.accessibility_status === 'VERIFIED_ACCESSIBLE' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                            <span>♿</span>
                            <span>Accessible</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory group-hover:text-heritage-maroon dark:group-hover:text-heritage-gold transition-colors">
                          {d.name}
                        </h3>
                        <p className="text-xs font-semibold text-heritage-maroon dark:text-heritage-gold font-serif mt-0.5">
                          {d.odia_name}
                        </p>
                        
                        {d.tagline && (
                          <p className="text-[11px] text-heritage-aged mt-1.5 line-clamp-2 leading-relaxed">
                            {d.tagline}
                          </p>
                        )}
                      </div>

                      {/* Logistics Info Pills */}
                      <div className="pt-2 border-t border-heritage-stone/60 dark:border-heritage-charcoal-dark space-y-1.5 text-[11px] text-heritage-aged">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-heritage-gold" />
                            <span>{d.timings}</span>
                          </span>
                          <span className="font-semibold text-heritage-charcoal dark:text-heritage-ivory">{d.entry_fee}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-heritage-aged truncate max-w-[190px]">
                            Source: <strong className="text-heritage-charcoal dark:text-heritage-ivory">{d.official_source}</strong>
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Verified</span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 flex space-x-2">
                        <button
                          onClick={() => fetchDetail(d.id)}
                          className="flex-1 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all flex items-center justify-center space-x-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-heritage-gold" />
                          <span>Explore Guide</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedDestId(d.id);
                            setShowCorrectionModal(true);
                          }}
                          className="px-3 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal hover:border-heritage-gold text-heritage-aged hover:text-heritage-charcoal text-[11px] font-semibold transition-colors"
                          title="Report inaccuracy"
                        >
                          Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SMART TRIP PLANNER ───────────────────────────────────────── */}
      {activeTab === 'planner' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm">
            <div className="max-w-2xl mb-6">
              <h2 className="font-serif font-black text-xl text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Odisha Itinerary Builder</span>
              </h2>
              <p className="text-xs text-heritage-aged mt-1 leading-relaxed">
                Build a geographically sound, schedule-verified day-by-day travel plan. Real travel buffers and opening schedules prevent impossible itineraries.
              </p>
            </div>

            {/* Planner Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-heritage-ivory/60 dark:bg-heritage-charcoal-dark border border-heritage-stone/80 dark:border-heritage-charcoal mb-6">
              <div>
                <label className="block text-[11px] font-bold text-heritage-aged uppercase tracking-wider mb-1.5">
                  Trip Duration
                </label>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 5].map(days => (
                    <button
                      key={days}
                      onClick={() => setPlannerDays(days)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        plannerDays === days
                          ? 'bg-heritage-maroon text-white shadow-sm'
                          : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory'
                      }`}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-aged uppercase tracking-wider mb-1.5">
                  Core Interest
                </label>
                <select
                  value={plannerInterest}
                  onChange={e => setPlannerInterest(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory font-semibold focus:outline-none"
                >
                  <option value="HERITAGE_CULTURE">Heritage & Temples</option>
                  <option value="NATURE_WILDLIFE">Lakes & Wetlands</option>
                  <option value="ARTS_CRAFTS">Living Crafts & Handlooms</option>
                  <option value="BEACHES_COAST">Coastal & Beaches</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-heritage-aged uppercase tracking-wider mb-1.5">
                  Travel Pace
                </label>
                <div className="flex space-x-1.5">
                  {['RELAXED', 'BALANCED', 'PACKED'].map(pace => (
                    <button
                      key={pace}
                      onClick={() => setPlannerPace(pace)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold capitalize transition-all ${
                        plannerPace === pace
                          ? 'bg-heritage-gold text-heritage-charcoal shadow-sm'
                          : 'bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory'
                      }`}
                    >
                      {pace.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={plannerAccessibility}
                    onChange={e => setPlannerAccessibility(e.target.checked)}
                    className="rounded text-heritage-maroon focus:ring-heritage-gold"
                  />
                  <span>Prioritize Step-Free Access</span>
                </label>

                <button
                  onClick={handleGeneratePlan}
                  disabled={plannerLoading}
                  className="w-full py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-bold shadow-heritage transition-all flex items-center justify-center space-x-1.5"
                >
                  {plannerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />}
                  <span>Generate Itinerary</span>
                </button>
              </div>
            </div>

            {/* Generated Plan Timeline */}
            {plannedStops.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-heritage-stone dark:border-heritage-charcoal animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                      Your Suggested Itinerary ({plannerDays} Days)
                    </h3>
                    <p className="text-xs text-heritage-aged mt-0.5">{plannerSummary}</p>
                  </div>

                  <button
                    onClick={handleSaveItinerary}
                    className="px-4 py-2 rounded-xl bg-heritage-gold hover:bg-heritage-gold-dark text-heritage-charcoal font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Trip Plan</span>
                  </button>
                </div>

                <div className="space-y-4 mt-4">
                  {plannedStops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone/80 dark:border-heritage-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-heritage-gold transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-heritage-maroon text-heritage-gold font-bold text-xs flex items-center justify-center shrink-0">
                          D{stop.day}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                              {stop.destination_name}
                            </h4>
                            <span className="text-[10px] text-heritage-aged font-semibold">({stop.district || 'Odisha'})</span>
                          </div>
                          <p className="text-xs text-heritage-aged mt-0.5">{stop.activity}</p>
                          <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-heritage-aged font-medium">
                            <span>🕒 Window: <strong className="text-heritage-charcoal dark:text-heritage-ivory">{stop.arrival_window}</strong></span>
                            <span>⏳ Duration: {stop.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-[11px] text-heritage-aged pl-11 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-heritage-stone/40 dark:bg-heritage-charcoal-dark font-medium text-heritage-charcoal dark:text-heritage-ivory">
                          Transit Buffer: {stop.travel_buffer || '30 mins'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVE TRAVEL & CIVIC ALERTS ─────────────────────────────────── */}
      {activeTab === 'updates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live Advisories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Active Travel & Civic Advisories</span>
                  </h3>
                  <p className="text-xs text-heritage-aged">Road diversions, weather, and crowd notices verified by authorities</p>
                </div>
                <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg">
                  {advisories.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {advisories.map(adv => (
                  <div
                    key={adv.id}
                    className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border-l-4 border-l-amber-500 border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">
                        {adv.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {adv.severity}
                      </span>
                    </div>

                    <p className="text-xs text-heritage-aged leading-relaxed">
                      {adv.description}
                    </p>

                    {adv.alternative_suggestion && (
                      <div className="p-2.5 rounded-xl bg-heritage-gold/10 text-[11px] text-heritage-charcoal dark:text-heritage-ivory border border-heritage-gold/20">
                        <strong>Recommended Advice: </strong>{adv.alternative_suggestion}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between text-[10px] text-heritage-aged border-t border-heritage-stone/40 dark:border-heritage-charcoal-dark">
                      <span>Authority: <strong>{adv.issuing_authority}</strong></span>
                      <span>District: <strong>{adv.district}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Cultural Festivals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-heritage-charcoal dark:text-heritage-ivory flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-heritage-maroon dark:text-heritage-gold" />
                    <span>Verified Festival Calendar</span>
                  </h3>
                  <p className="text-xs text-heritage-aged">Confirmed dates and ticketing details for cultural events</p>
                </div>
                <span className="text-xs font-bold bg-heritage-maroon/10 text-heritage-maroon dark:text-heritage-gold px-2.5 py-1 rounded-lg">
                  {events.length} Festivals
                </span>
              </div>

              <div className="space-y-3">
                {events.map(ev => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{ev.title}</h4>
                        <p className="text-xs text-heritage-maroon dark:text-heritage-gold font-serif">{ev.odia_title}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {ev.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-heritage-aged">
                      <div>📍 Venue: <strong className="text-heritage-charcoal dark:text-heritage-ivory">{ev.venue}</strong></div>
                      <div>📅 Dates: <strong className="text-heritage-charcoal dark:text-heritage-ivory">{ev.start_date} to {ev.end_date}</strong></div>
                      <div>🕒 Timings: {ev.timings}</div>
                      <div>🎟️ Ticket: {ev.ticket_info}</div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-heritage-aged border-t border-heritage-stone/40 dark:border-heritage-charcoal-dark">
                      <span>Organiser: <strong>{ev.organiser}</strong></span>
                      <span>Verified: <strong>{ev.verified_source}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 4: HERITAGE TRAILS ───────────────────────────────────────────── */}
      {activeTab === 'trails' && (
        <div className="space-y-6 animate-fade-in">
          <div className="max-w-2xl">
            <h2 className="font-serif font-black text-xl text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
              <Footprints className="w-5 h-5" />
              <span>Curated Odisha Heritage Circuits</span>
            </h2>
            <p className="text-xs text-heritage-aged mt-1">
              Thoughtfully curated signature journeys combining architectural landmarks, rural artisan villages, and coastal wetlands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trails.map(trail => (
              <div
                key={trail.id}
                className="rounded-3xl overflow-hidden bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={trail.image_url} alt={trail.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-heritage-gold uppercase tracking-wider">{trail.theme}</span>
                    <h3 className="font-serif font-bold text-base leading-tight mt-0.5">{trail.name}</h3>
                    <p className="text-xs text-white/80 font-serif">{trail.odia_name}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-heritage-aged leading-relaxed">
                    {trail.description}
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-heritage-maroon dark:text-heritage-gold uppercase tracking-wider">Circuit Highlights:</p>
                    <ul className="space-y-1 text-xs text-heritage-charcoal dark:text-heritage-ivory">
                      {trail.highlights.map((h, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-heritage-stone/60 dark:border-heritage-charcoal-dark flex items-center justify-between text-xs text-heritage-aged">
                    <span>⏱️ {trail.duration}</span>
                    <span>🛣️ {trail.distance_km} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: AI TRAVEL COMPANION ───────────────────────────────────────── */}
      {activeTab === 'companion' && (
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-heritage-maroon text-heritage-gold flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                Odisha AI Travel Companion
              </h3>
              <p className="text-xs text-heritage-aged">
                Grounded factual queries regarding temple dress codes, boat timings, and local Odia cuisine circuits.
              </p>
            </div>
          </div>

          {/* Chat transcript */}
          <div className="h-96 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal p-4 overflow-y-auto space-y-3 shadow-inner">
            {companionMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-heritage-maroon text-white font-medium rounded-br-none shadow-sm'
                      : 'bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory border border-heritage-stone dark:border-heritage-charcoal rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-heritage-aged mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {companionLoading && (
              <div className="flex items-center space-x-2 text-xs text-heritage-aged p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-heritage-maroon" />
                <span>Formulating personalized travel itinerary...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendCompanionMessage} className="flex space-x-2">
            <input
              type="text"
              value={companionInput}
              onChange={e => setCompanionInput(e.target.value)}
              placeholder="e.g. Plan a 2-day family trip from Bhubaneswar covering Chilika birds and Konark..."
              className="flex-1 px-4 py-3 text-xs rounded-2xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={companionLoading || !companionInput.trim()}
              className="px-5 py-3 rounded-2xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white font-bold text-xs shadow-heritage transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5 text-heritage-gold" />
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 6: SAVED DESTINATIONS (MY COLLECTION) ───────────────────────── */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-black text-xl text-heritage-maroon dark:text-heritage-gold flex items-center space-x-2">
                <Bookmark className="w-5 h-5" />
                <span>My Saved Travel Collection</span>
              </h2>
              <p className="text-xs text-heritage-aged mt-1">Bookmarked places for your upcoming journey</p>
            </div>
            <span className="text-xs font-bold bg-heritage-gold/20 text-heritage-charcoal dark:text-heritage-gold px-3 py-1 rounded-xl">
              {savedDestinations.length} Places Bookmarked
            </span>
          </div>

          {savedDestinations.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-heritage-charcoal rounded-3xl border border-dashed border-heritage-stone dark:border-heritage-charcoal">
              <Bookmark className="w-10 h-10 mx-auto text-heritage-aged/40 mb-3" />
              <h3 className="font-bold text-sm">No saved destinations yet</h3>
              <p className="text-xs text-heritage-aged mt-1">Click the bookmark icon on any destination card in the Discover tab to save it here.</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-bold"
              >
                Browse Destinations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedDestinations.map(item => (
                <div
                  key={item.id}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex space-x-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400'}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">{item.name}</h4>
                      <p className="text-xs text-heritage-maroon dark:text-heritage-gold font-serif">{item.odia_name}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-heritage-aged">{item.district} District</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2 border-t border-heritage-stone/60 dark:border-heritage-charcoal-dark">
                    <button
                      onClick={() => fetchDetail(item.destination_id)}
                      className="flex-1 py-1.5 rounded-xl bg-heritage-maroon text-white font-bold text-xs"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => toggleBookmark(item.destination_id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: DESTINATION GUIDE & VERIFIED DETAILS ──────────────────────── */}
      {selectedDestId && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header Image */}
            <div className="relative h-60 sm:h-72 shrink-0 bg-heritage-charcoal">
              <img
                src={detailData.image_url || 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'}
                alt={detailData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <button
                onClick={() => { setSelectedDestId(null); setDetailData(null); }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[11px] font-bold text-heritage-gold uppercase tracking-wider bg-heritage-maroon/90 px-2.5 py-0.5 rounded-md border border-heritage-gold/30">
                  {detailData.category.replace('_', ' ')} · {detailData.district}
                </span>
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">
                  {detailData.name}
                </h2>
                <p className="text-sm font-serif text-heritage-gold">
                  {detailData.odia_name}
                </p>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-heritage-charcoal dark:text-heritage-ivory">
              
              {/* Overview & Cultural Significance */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                  Overview & Cultural Context
                </h3>
                <p className="leading-relaxed text-heritage-aged">
                  {detailData.description}
                </p>
                {detailData.cultural_significance && (
                  <div className="p-3.5 rounded-2xl bg-heritage-gold/10 border border-heritage-gold/30 text-heritage-charcoal dark:text-heritage-ivory leading-relaxed">
                    <strong>Cultural Significance: </strong>{detailData.cultural_significance}
                  </div>
                )}
              </div>

              {/* Verified Logistics & Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-heritage-ivory/80 dark:bg-heritage-charcoal-dark border border-heritage-stone dark:border-heritage-charcoal">
                <div>
                  <p className="text-[10px] text-heritage-aged font-bold uppercase">Official Timings</p>
                  <p className="font-semibold text-xs mt-0.5">{detailData.timings}</p>
                </div>
                <div>
                  <p className="text-[10px] text-heritage-aged font-bold uppercase">Entry Fee / Passes</p>
                  <p className="font-semibold text-xs mt-0.5">{detailData.entry_fee}</p>
                </div>
                <div>
                  <p className="text-[10px] text-heritage-aged font-bold uppercase">Estimated Visit Duration</p>
                  <p className="font-semibold text-xs mt-0.5">{detailData.estimated_visit_duration}</p>
                </div>
                <div>
                  <p className="text-[10px] text-heritage-aged font-bold uppercase">Best Season to Visit</p>
                  <p className="font-semibold text-xs mt-0.5">{detailData.best_time_to_visit}</p>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-heritage-stone/40 dark:border-heritage-charcoal flex items-center justify-between text-[11px] text-heritage-aged">
                  <span>Authoritative Source: <strong className="text-heritage-charcoal dark:text-heritage-ivory">{detailData.official_source}</strong></span>
                  <span className="text-emerald-600 font-bold">Verified Live</span>
                </div>
              </div>

              {/* Verified Facilities & Accessibility */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-heritage-maroon dark:text-heritage-gold">
                  Verified Visitor Facilities & Accessibility
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(detailData.facilities || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center space-x-2 p-2 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark text-[11px]">
                      {val ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-heritage-aged" />}
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>

                {detailData.accessibility_details && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <strong>Accessibility Audit: </strong>{detailData.accessibility_details}
                  </div>
                )}
              </div>

              {/* Visitor Rules & Guidelines */}
              {detailData.visitor_rules && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs text-heritage-charcoal dark:text-heritage-ivory">Visitor Decorum & Site Rules:</h4>
                  <p className="text-heritage-aged text-xs leading-relaxed">{detailData.visitor_rules}</p>
                </div>
              )}

              {/* Active Advisories on Destination */}
              {detailData.active_advisories.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Active Civic Notice at Destination</span>
                  </div>
                  <p>{detailData.active_advisories[0].description}</p>
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border-t border-heritage-stone dark:border-heritage-charcoal flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="text-[11px] text-heritage-aged hover:text-heritage-maroon dark:hover:text-heritage-gold font-semibold underline"
              >
                Report Inaccurate Information
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => toggleBookmark(detailData.id)}
                  className="px-4 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory text-xs font-bold hover:border-heritage-gold"
                >
                  {savedIds.has(detailData.id) ? 'Bookmarked' : 'Save Place'}
                </button>
                <button
                  onClick={() => {
                    setSelectedDestId(null);
                    setDetailData(null);
                    setActiveTab('planner');
                  }}
                  className="px-4 py-2 rounded-xl bg-heritage-maroon hover:bg-heritage-maroon-dark text-white text-xs font-bold shadow-heritage"
                >
                  Add to Itinerary
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: CROWDSOURCED CONTENT CORRECTION ───────────────────────────── */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-heritage-maroon dark:text-heritage-gold">
                Report Inaccurate Tourism Info
              </h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-heritage-aged hover:text-heritage-charcoal">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-heritage-aged">
              Help fellow travelers! Submitted updates are verified by the Odisha Tourism desk before changes appear publicly.
            </p>

            {correctionSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center">
                {correctionSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitCorrection} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Issue Category</label>
                  <select
                    value={correctionType}
                    onChange={e => setCorrectionType(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark"
                  >
                    <option value="TIMINGS">Opening / Closing Hours Changed</option>
                    <option value="ENTRY_FEE">Entry Fee / Ticket Link Inaccurate</option>
                    <option value="ACCESSIBILITY">Accessibility Ramp / Facility Barrier</option>
                    <option value="SITE_RULES">Site Rules / Photography Policy</option>
                    <option value="OTHER">Other Information</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Observed Details *</label>
                  <textarea
                    rows={3}
                    value={correctionDesc}
                    onChange={e => setCorrectionDesc(e.target.value)}
                    placeholder="e.g. Visited yesterday, the gate opens at 6:30 AM instead of 6:00 AM..."
                    required
                    className="w-full p-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={e => setReporterName(e.target.value)}
                    placeholder="Tourist / Local Resident"
                    className="w-full p-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-heritage-ivory dark:bg-heritage-charcoal-dark focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-heritage-stone"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-heritage-maroon text-white hover:bg-heritage-maroon-dark"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
