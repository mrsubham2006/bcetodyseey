import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Map, AlertTriangle, Building2, Navigation, Landmark, CheckCircle,
  Search, X, Filter, Layers, MapPin, RefreshCw, Info, Star, Droplets,
  Heart, Camera, Bus, Train, Flame, TreePine, Eye, Zap, Clock,
  ChevronRight, ChevronDown, ChevronUp, Waves, Palette, Construction,
  ArrowLeft, ExternalLink, Shield, AlertCircle, Wrench, Archive,
  UserCheck, Lightbulb, Trash2, Brain, Sparkles, Globe, Play,
  CheckCircle2, Circle, Activity
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MapFeature {
  id: string;
  type: string;
  layer: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  status?: string;
  severity?: string;
  icon: string;
  color: string;
  meta?: Record<string, any>;
}

interface LayerInfo {
  id: string;
  label: string;
  label_odia: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  enabled_by_default: boolean;
}

interface AreaSnapshot {
  locality: string;
  total_issues: number;
  open_issues: number;
  resolved_this_month: number;
  avg_resolution_hours: number;
  health_score: number;
  health_label: string;
  active_layers: Record<string, number>;
  top_categories: Array<{ category: string; count: number }>;
  last_updated: string;
}

interface AISearchResult {
  query: string;
  interpreted_intent: string;
  suggested_layers: string[];
  results: MapFeature[];
  ai_summary: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const API = 'http://127.0.0.1:8000/api/v1/explore';

const LAYER_META: Record<string, { icon: React.ElementType; colorClass: string; bgClass: string }> = {
  civic_issues:         { icon: AlertTriangle, colorClass: 'text-red-500',    bgClass: 'bg-red-50 dark:bg-red-950/30' },
  public_facilities:    { icon: Building2,     colorClass: 'text-cyan-500',   bgClass: 'bg-cyan-50 dark:bg-cyan-950/30' },
  road_mobility:        { icon: Navigation,    colorClass: 'text-amber-500',  bgClass: 'bg-amber-50 dark:bg-amber-950/30' },
  heritage_tourism:     { icon: Landmark,      colorClass: 'text-[#8B1A2E]',  bgClass: 'bg-[#8B1A2E]/5' },
  community_improvements:{ icon: CheckCircle,  colorClass: 'text-emerald-500',bgClass: 'bg-emerald-50 dark:bg-emerald-950/30' },
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626', HIGH: '#EA580C', MEDIUM: '#D97706', LOW: '#16A34A',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  REPORTED:    AlertCircle,
  VERIFIED:    Eye,
  ASSIGNED:    UserCheck,
  IN_PROGRESS: Wrench,
  RESOLVED:    CheckCircle2,
  CLOSED:      Archive,
  ACTIVE:      Activity,
  OPERATIONAL: CheckCircle2,
  SAFE_AND_OPEN: Shield,
};

function FeatureIcon({ iconName, size = 16 }: { iconName: string; size?: number }) {
  const iconMap: Record<string, React.ElementType> = {
    AlertTriangle: AlertTriangle, AlertCircle: AlertCircle,
    Eye: Eye, Wrench: Wrench, CheckCircle: CheckCircle, CheckCircle2: CheckCircle2,
    Archive: Archive, UserCheck: UserCheck, Navigation: Navigation,
    Landmark: Landmark, Star: Star, Waves: Waves, Palette: Palette,
    Construction: Construction, Droplets: Droplets, Heart: Heart,
    Camera: Camera, Bus: Bus, Train: Train, Flame: Flame, TreePine: TreePine,
    Lightbulb: Lightbulb, Trash2: Trash2, MapPin: MapPin, Pillar: Landmark,
    GraduationCap: Globe, Brain: Brain,
  };
  const Icon = iconMap[iconName] || MapPin;
  return <Icon size={size} />;
}

// Bhubaneswar ward localities (for the area switcher)
const LOCALITIES = [
  'Bhubaneswar', 'Saheed Nagar', 'Patia', 'Chandrasekharpur', 'Kharvel Nagar',
  'Unit-1 Market', 'Rasulgarh', 'Old Town', 'Nayapalli', 'Vani Vihar',
];

// Haversine distance (km)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LayerToggle({
  layer, enabled, onToggle
}: { layer: LayerInfo; enabled: boolean; onToggle: () => void }) {
  const meta = LAYER_META[layer.id] || LAYER_META.civic_issues;
  const Icon = meta.icon;
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
        ${enabled
          ? `${meta.bgClass} border-current ${meta.colorClass} shadow-sm`
          : 'bg-white dark:bg-heritage-charcoal border-heritage-stone dark:border-heritage-charcoal text-heritage-stone/70 dark:text-heritage-ivory/40'
        }`}
    >
      <Icon size={12} />
      <span>{layer.label}</span>
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${enabled ? 'bg-white/40 dark:bg-black/20' : 'bg-heritage-stone/10'}`}>
        {layer.count}
      </span>
    </button>
  );
}

function HealthMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : score >= 40 ? '#EA580C' : '#DC2626';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="32" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 201} 201`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-xl font-bold text-heritage-charcoal dark:text-heritage-ivory" style={{ color }}>
            {score}
          </span>
          <span className="text-[9px] text-heritage-stone dark:text-heritage-ivory/50 font-medium">/100</span>
        </div>
      </div>
      <span className="mt-1 text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function FeatureCard({
  feature,
  onClick,
  compact = false,
}: {
  feature: MapFeature;
  onClick: () => void;
  compact?: boolean;
}) {
  const StatusIcon = STATUS_ICONS[feature.status || ''] || Circle;
  const sev = feature.severity;
  const sevColor = sev ? SEVERITY_COLORS[sev] : feature.color;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-heritage-charcoal border border-heritage-stone/30 dark:border-heritage-charcoal 
        rounded-xl hover:shadow-md hover:border-heritage-maroon/30 transition-all duration-200 group
        ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: feature.color }}
        >
          <FeatureIcon iconName={feature.icon} size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-heritage-charcoal dark:text-heritage-ivory truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {feature.title}
          </p>
          {feature.subtitle && (
            <p className="text-[11px] text-heritage-stone dark:text-heritage-ivory/50 truncate mt-0.5">
              {feature.subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {feature.status && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-heritage-ivory dark:bg-heritage-charcoal-dark border border-heritage-stone/20">
                <StatusIcon size={10} style={{ color: sevColor }} />
                <span>{feature.status.replace(/_/g, ' ')}</span>
              </span>
            )}
            {sev && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: sevColor }}>
                {sev}
              </span>
            )}
            {feature.meta?.incident_code && (
              <span className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-mono">
                {feature.meta.incident_code}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={14} className="text-heritage-stone dark:text-heritage-ivory/30 mt-1 group-hover:text-heritage-maroon transition-colors" />
      </div>
    </button>
  );
}

function FeatureDetailPanel({
  feature,
  onClose,
}: {
  feature: MapFeature;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const typeMap: Record<string, string> = {
      civic_issue: 'civic_issue',
      public_facility: 'public_facility',
      road_mobility: 'road_mobility',
      heritage_tourism: 'heritage_tourism',
    };
    const ftype = typeMap[feature.type] || feature.type;
    fetch(`${API}/feature/${ftype}/${feature.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => { setDetail(null); setLoading(false); });
  }, [feature.id, feature.type]);

  const StatusIcon = STATUS_ICONS[feature.status || ''] || Circle;
  const sevColor = feature.severity ? SEVERITY_COLORS[feature.severity] : feature.color;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 border-b border-heritage-stone/20 dark:border-heritage-charcoal flex-shrink-0"
        style={{ borderLeftColor: feature.color, borderLeftWidth: 4 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: feature.color }}
              >
                <FeatureIcon iconName={feature.icon} size={13} />
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: feature.color }}
              >
                {feature.layer.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory leading-snug">
              {feature.title}
            </h3>
            {feature.subtitle && (
              <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50 mt-0.5">
                {feature.subtitle}
              </p>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg hover:bg-heritage-ivory dark:hover:bg-heritage-charcoal-dark transition-colors">
            <X size={16} className="text-heritage-stone" />
          </button>
        </div>
        {/* Status + Severity */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {feature.status && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border"
              style={{ borderColor: sevColor, color: sevColor, backgroundColor: sevColor + '15' }}>
              <StatusIcon size={10} />
              {feature.status.replace(/_/g, ' ')}
            </span>
          )}
          {feature.severity && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: sevColor }}>
              {feature.severity} SEVERITY
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-heritage-stone dark:text-heritage-ivory/50">
            <RefreshCw size={14} className="animate-spin" /> Loading details…
          </div>
        )}

        {/* Coordinates */}
        <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
          <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Location</p>
          <p className="text-xs font-mono text-heritage-charcoal dark:text-heritage-ivory">
            {feature.latitude.toFixed(4)}°N, {feature.longitude.toFixed(4)}°E
          </p>
        </div>

        {/* Civic Issue Detail */}
        {detail && feature.type === 'civic_issue' && (
          <>
            {detail.description && (
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {detail.department && (
                <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Department</p>
                  <p className="text-xs font-medium text-heritage-charcoal dark:text-heritage-ivory">{detail.department}</p>
                </div>
              )}
              {detail.priority_score !== undefined && (
                <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Priority</p>
                  <p className="text-xs font-bold text-heritage-maroon">{detail.priority_score.toFixed(0)} / 100</p>
                </div>
              )}
              {detail.report_count !== undefined && (
                <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Reports</p>
                  <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">{detail.report_count}</p>
                </div>
              )}
              {detail.reported_at && (
                <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">Reported</p>
                  <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory">{new Date(detail.reported_at).toLocaleDateString('en-IN')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Heritage / Tourism Detail */}
        {detail && feature.type === 'heritage_tourism' && (
          <>
            {detail.image_url && (
              <div className="rounded-xl overflow-hidden aspect-video bg-heritage-stone/10">
                <img src={detail.image_url} alt={detail.name} className="w-full h-full object-cover" />
              </div>
            )}
            {detail.description && (
              <div className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1">About</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.description}</p>
              </div>
            )}
            {detail.cultural_significance && (
              <div className="bg-[#8B1A2E]/5 border border-[#8B1A2E]/20 rounded-lg p-3">
                <p className="text-[10px] text-[#8B1A2E] font-semibold uppercase tracking-wider mb-1">Cultural Significance</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.cultural_significance}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {detail.timings && (
                <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <Clock size={14} className="text-heritage-gold shrink-0" />
                  <div>
                    <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider">Timings</p>
                    <p className="text-xs font-medium text-heritage-charcoal dark:text-heritage-ivory">{detail.timings}</p>
                  </div>
                </div>
              )}
              {detail.accessibility_notes && (
                <div className="flex items-center gap-2 bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-3">
                  <Shield size={14} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider">Accessibility</p>
                    <p className="text-xs font-medium text-heritage-charcoal dark:text-heritage-ivory">{detail.accessibility_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Road Mobility Detail */}
        {detail && feature.type === 'road_mobility' && (
          <>
            {detail.description && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">Road Alert</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.description}</p>
              </div>
            )}
            {detail.detour && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">Suggested Detour</p>
                <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.detour}</p>
              </div>
            )}
          </>
        )}

        {/* Public Facility Detail */}
        {detail && feature.type === 'public_facility' && detail.info && (
          <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3">
            <p className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold uppercase tracking-wider mb-1">About This Facility</p>
            <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/80 leading-relaxed">{detail.info}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Map Canvas (interactive dot-map of Bhubaneswar)
// ─────────────────────────────────────────────────────────────────────────────

const MAP_BOUNDS = {
  latMin: 20.08, latMax: 20.45,
  lonMin: 85.70, lonMax: 86.00,
};

function projectToCanvas(lat: number, lon: number, w: number, h: number) {
  const x = ((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * w;
  const y = h - ((lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * h;
  return { x, y };
}

interface SVGMapProps {
  features: MapFeature[];
  enabledLayers: Set<string>;
  onFeatureClick: (f: MapFeature) => void;
  selectedId?: string;
  hoveredId?: string;
  onHover: (id?: string) => void;
}

function SVGCityMap({ features, enabledLayers, onFeatureClick, selectedId, hoveredId, onHover }: SVGMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 900, h: 560 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, vx: 0, vy: 0 });
  const [zoom, setZoom] = useState(1);
  const SVG_W = 900, SVG_H = 560;

  const visibleFeatures = features.filter(f => enabledLayers.has(f.layer));

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.91;
    const newW = Math.min(900, Math.max(300, viewBox.w * delta));
    const newH = Math.min(560, Math.max(186, viewBox.h * delta));
    setViewBox(v => ({ ...v, w: newW, h: newH }));
    setZoom(900 / newW);
  }

  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, vx: viewBox.x, vy: viewBox.y });
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    const scaleX = viewBox.w / SVG_W;
    const scaleY = viewBox.h / SVG_H;
    const dx = (e.clientX - dragStart.mx) * scaleX;
    const dy = (e.clientY - dragStart.my) * scaleY;
    setViewBox(v => ({
      ...v,
      x: Math.max(0, Math.min(900 - v.w, dragStart.vx - dx)),
      y: Math.max(0, Math.min(560 - v.h, dragStart.vy - dy)),
    }));
  }
  function handleMouseUp() { setDragging(false); }

  // Grid lines (latitude/longitude grid)
  const gridLines = [];
  for (let lat = 20.1; lat <= 20.45; lat += 0.05) {
    const { y } = projectToCanvas(lat, MAP_BOUNDS.lonMin, SVG_W, SVG_H);
    gridLines.push(<line key={`lat-${lat}`} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#e2d9c8" strokeWidth="0.5" opacity={0.5} />);
  }
  for (let lon = 85.72; lon <= 86.0; lon += 0.05) {
    const { x } = projectToCanvas(MAP_BOUNDS.latMin, lon, SVG_W, SVG_H);
    gridLines.push(<line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={SVG_H} stroke="#e2d9c8" strokeWidth="0.5" opacity={0.5} />);
  }

  // Road arteries (static simplified paths)
  const NH16 = [
    projectToCanvas(20.46, 85.82, SVG_W, SVG_H),
    projectToCanvas(20.30, 85.84, SVG_W, SVG_H),
    projectToCanvas(20.15, 85.84, SVG_W, SVG_H),
  ];
  const NH16d = NH16.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const SH60 = [
    projectToCanvas(20.40, 85.70, SVG_W, SVG_H),
    projectToCanvas(20.29, 85.80, SVG_W, SVG_H),
    projectToCanvas(20.18, 85.83, SVG_W, SVG_H),
  ];
  const SH60d = SH60.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg
      ref={svgRef}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ touchAction: 'none' }}
    >
      {/* Background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F5F0E8" rx={0} />

      {/* Grid */}
      {gridLines}

      {/* Roads */}
      <path d={NH16d} fill="none" stroke="#d4c5a9" strokeWidth="3" strokeLinecap="round" />
      <path d={SH60d} fill="none" stroke="#d4c5a9" strokeWidth="2" strokeLinecap="round" />
      <path d={NH16d} fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity={0.5} />
      <path d={SH60d} fill="none" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" opacity={0.5} />

      {/* City centre label */}
      {(() => {
        const centre = projectToCanvas(20.2961, 85.8245, SVG_W, SVG_H);
        return (
          <>
            <circle cx={centre.x} cy={centre.y} r={20} fill="#8B1A2E" fillOpacity={0.06} />
            <circle cx={centre.x} cy={centre.y} r={4} fill="#8B1A2E" fillOpacity={0.3} />
            <text x={centre.x + 8} y={centre.y - 8} fontSize={9} fill="#8B1A2E" fontWeight="600" opacity={0.7}>
              Bhubaneswar
            </text>
          </>
        );
      })()}

      {/* Feature markers */}
      {visibleFeatures.map(f => {
        const { x, y } = projectToCanvas(f.latitude, f.longitude, SVG_W, SVG_H);
        const isSelected = f.id === selectedId;
        const isHovered = f.id === hoveredId;
        const r = isSelected ? 12 : isHovered ? 10 : 7;
        const pulse = f.severity === 'CRITICAL' || f.severity === 'HIGH';
        return (
          <g
            key={f.id}
            onClick={() => onFeatureClick(f)}
            onMouseEnter={() => onHover(f.id)}
            onMouseLeave={() => onHover(undefined)}
            style={{ cursor: 'pointer' }}
          >
            {pulse && !isSelected && (
              <circle cx={x} cy={y} r={r + 6} fill={f.color} fillOpacity={0.15}>
                <animate attributeName="r" values={`${r + 2};${r + 9};${r + 2}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {isSelected && (
              <circle cx={x} cy={y} r={r + 8} fill={f.color} fillOpacity={0.15} />
            )}
            <circle cx={x} cy={y} r={r} fill={f.color} stroke="white" strokeWidth={isSelected ? 2.5 : 1.5}
              opacity={isSelected ? 1 : 0.88} />
            {(isHovered || isSelected) && (
              <text x={x + r + 4} y={y + 4} fontSize={8} fill="#3D2B1F" fontWeight="600"
                style={{ pointerEvents: 'none' }}>
                {f.title.length > 22 ? f.title.slice(0, 20) + '…' : f.title}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Area Snapshot Panel
// ─────────────────────────────────────────────────────────────────────────────

function AreaSnapshotPanel({ snapshot }: { snapshot: AreaSnapshot | null }) {
  if (!snapshot) return null;
  return (
    <div className="bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 dark:border-heritage-charcoal p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-heritage-charcoal dark:text-heritage-ivory">Area Health</h4>
          <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50">{snapshot.locality}</p>
        </div>
        <HealthMeter score={snapshot.health_score} label={snapshot.health_label} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Total Issues', value: snapshot.total_issues, color: 'text-heritage-charcoal dark:text-heritage-ivory' },
          { label: 'Open', value: snapshot.open_issues, color: 'text-red-500' },
          { label: 'Resolved (30d)', value: snapshot.resolved_this_month, color: 'text-emerald-600' },
          { label: 'Avg Resolution', value: `${snapshot.avg_resolution_hours}h`, color: 'text-amber-500' },
        ].map(item => (
          <div key={item.label} className="bg-heritage-ivory dark:bg-heritage-charcoal-dark rounded-lg p-2 text-center">
            <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
      {snapshot.top_categories.length > 0 && (
        <div>
          <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 font-semibold uppercase tracking-wider mb-1.5">
            Top Issue Types
          </p>
          <div className="space-y-1.5">
            {snapshot.top_categories.slice(0, 3).map((c, idx) => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="text-[10px] font-bold w-4 text-heritage-stone dark:text-heritage-ivory/40">{idx + 1}</span>
                <div className="flex-1 bg-heritage-stone/10 dark:bg-heritage-charcoal-dark rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-heritage-maroon transition-all duration-700"
                    style={{ width: `${Math.min(100, (c.count / (snapshot.top_categories[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-heritage-charcoal dark:text-heritage-ivory truncate max-w-[80px]">
                  {c.category}
                </span>
                <span className="text-[10px] font-bold text-heritage-maroon">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ExploreCityCenter: React.FC = () => {
  // ── state ──────────────────────────────────────────────────────────────────
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(new Set(['civic_issues', 'public_facilities', 'road_mobility']));
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<AreaSnapshot | null>(null);
  const [locality, setLocality] = useState('Bhubaneswar');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showSnapshotPanel, setShowSnapshotPanel] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [searchMode, setSearchMode] = useState(false); // AI search results mode
  const [activeTab, setActiveTab] = useState<'list' | 'nearby'>('list');
  const [nearbyFeatures, setNearbyFeatures] = useState<MapFeature[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  // ── fetch layers catalog ────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/map-layers`).then(r => r.json()).then(setLayers).catch(() => {});
  }, []);

  // ── fetch area snapshot ─────────────────────────────────────────────────────
  const fetchSnapshot = useCallback(() => {
    fetch(`${API}/area-snapshot?locality=${encodeURIComponent(locality)}`)
      .then(r => r.json()).then(setSnapshot).catch(() => {});
  }, [locality]);
  useEffect(() => { fetchSnapshot(); }, [fetchSnapshot]);

  // ── fetch all layers ────────────────────────────────────────────────────────
  const fetchAllLayers = useCallback(async () => {
    setLoading(true);
    try {
      const [civicRes, facRes, roadRes, tourRes, commRes] = await Promise.all([
        fetch(`${API}/civic-issues`).then(r => r.json()),
        fetch(`${API}/public-facilities`).then(r => r.json()),
        fetch(`${API}/road-mobility`).then(r => r.json()),
        fetch(`${API}/heritage-tourism`).then(r => r.json()),
        fetch(`${API}/community-improvements`).then(r => r.json()),
      ]);
      setFeatures([
        ...(Array.isArray(civicRes) ? civicRes : []),
        ...(Array.isArray(facRes) ? facRes : []),
        ...(Array.isArray(roadRes) ? roadRes : []),
        ...(Array.isArray(tourRes) ? tourRes : []),
        ...(Array.isArray(commRes) ? commRes : []),
      ]);
    } catch {
      // graceful no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllLayers(); }, [fetchAllLayers]);

  // ── AI Search ──────────────────────────────────────────────────────────────
  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setSearchMode(true);
    try {
      const res = await fetch(`${API}/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, center_lat: 20.2961, center_lon: 85.8245, radius_km: 20 }),
      });
      const data = await res.json();
      setAiResult(data);
      // Auto-enable the suggested layer
      if (data.suggested_layers?.length) {
        setEnabledLayers(prev => {
          const next = new Set(prev);
          data.suggested_layers.forEach((l: string) => next.add(l));
          return next;
        });
      }
    } catch {
      setAiResult(null);
    } finally {
      setAiLoading(false);
    }
  };

  const clearSearch = () => {
    setAiQuery('');
    setAiResult(null);
    setSearchMode(false);
  };

  // ── Nearby ─────────────────────────────────────────────────────────────────
  const fetchNearby = async () => {
    setLoadingNearby(true);
    try {
      const res = await fetch(`${API}/nearby?lat=20.2961&lon=85.8245&radius_km=5&layers=${[...enabledLayers].join(',')}`);
      const data = await res.json();
      setNearbyFeatures(data);
    } catch {
      setNearbyFeatures([]);
    } finally {
      setLoadingNearby(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'nearby') fetchNearby();
  }, [activeTab, enabledLayers]);

  // ── displayed list ─────────────────────────────────────────────────────────
  const displayFeatures = searchMode && aiResult
    ? aiResult.results
    : features.filter(f => enabledLayers.has(f.layer));

  const listFeatures = activeTab === 'nearby'
    ? nearbyFeatures.filter(f => enabledLayers.has(f.layer))
    : displayFeatures;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-10rem)]">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-heritage-stone/20 dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-heritage-maroon/10 flex items-center justify-center">
              <Globe size={20} className="text-heritage-maroon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-heritage-charcoal dark:text-heritage-ivory">Explore My City</h2>
              <p className="text-xs text-heritage-stone dark:text-heritage-ivory/50">ମୋ ସ୍ୱ ସ୍ୱ ଅନ୍ୱେଷଣ — Interactive Bhubaneswar City Map</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Locality Switcher */}
            <select
              value={locality}
              onChange={e => setLocality(e.target.value)}
              className="text-xs border border-heritage-stone/30 dark:border-heritage-charcoal rounded-lg px-2 py-1.5
                bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-maroon/30 focus:border-heritage-maroon outline-none"
            >
              {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={fetchAllLayers}
              className="p-2 rounded-lg border border-heritage-stone/30 dark:border-heritage-charcoal hover:bg-heritage-ivory dark:hover:bg-heritage-charcoal-dark transition-colors"
              title="Refresh map">
              <RefreshCw size={14} className={`text-heritage-stone dark:text-heritage-ivory/50 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Search bar */}
        <div className="mt-3 flex gap-2">
          <div className="flex-1 relative">
            <Brain size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-heritage-maroon" />
            <input
              type="text"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAISearch()}
              placeholder='Ask the city map… "Show hospitals near Patia" or "road closures today"'
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-heritage-stone/30 dark:border-heritage-charcoal rounded-xl
                bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory
                placeholder-heritage-stone/60 dark:placeholder-heritage-ivory/30
                focus:ring-2 focus:ring-heritage-maroon/40 focus:border-heritage-maroon outline-none transition-all"
            />
          </div>
          <button
            onClick={handleAISearch}
            disabled={aiLoading || !aiQuery.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-heritage-maroon hover:bg-heritage-maroon/90
              disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? 'Searching…' : 'AI Search'}
          </button>
          {searchMode && (
            <button onClick={clearSearch}
              className="px-3 py-2.5 rounded-xl text-sm border border-heritage-stone/30 dark:border-heritage-charcoal hover:bg-heritage-ivory dark:hover:bg-heritage-charcoal-dark transition-colors"
              title="Clear search">
              <X size={14} className="text-heritage-stone dark:text-heritage-ivory/50" />
            </button>
          )}
        </div>

        {/* Layer toggles */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {layers.map(layer => (
            <LayerToggle
              key={layer.id}
              layer={layer}
              enabled={enabledLayers.has(layer.id)}
              onToggle={() => {
                setEnabledLayers(prev => {
                  const next = new Set(prev);
                  if (next.has(layer.id)) next.delete(layer.id); else next.add(layer.id);
                  return next;
                });
              }}
            />
          ))}
        </div>
      </div>

      {/* ── AI Search Result Banner ─────────────────────────────────────────── */}
      {aiResult && searchMode && (
        <div className="flex-shrink-0 mx-5 mt-3 p-3 bg-heritage-maroon/5 border border-heritage-maroon/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-heritage-maroon mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-heritage-maroon mb-0.5">
                Interpreted as: "{aiResult.interpreted_intent}" · {Math.round(aiResult.confidence * 100)}% confidence
              </p>
              <p className="text-xs text-heritage-charcoal dark:text-heritage-ivory/70">{aiResult.ai_summary}</p>
              <p className="text-[10px] text-heritage-stone dark:text-heritage-ivory/40 mt-1">
                {aiResult.results.length} features found
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main body ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 p-5 min-h-0 overflow-hidden">

        {/* ── LEFT: Map + Snapshot ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Map canvas */}
          <div className="relative flex-1 bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 dark:border-heritage-charcoal overflow-hidden shadow-sm"
            style={{ minHeight: 340 }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="text-heritage-maroon animate-spin" />
                  <p className="text-sm text-heritage-stone dark:text-heritage-ivory/50">Loading city data…</p>
                </div>
              </div>
            ) : (
              <SVGCityMap
                features={searchMode && aiResult ? aiResult.results : features}
                enabledLayers={enabledLayers}
                onFeatureClick={f => setSelectedFeature(prev => prev?.id === f.id ? null : f)}
                selectedId={selectedFeature?.id}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            )}

            {/* Map overlay — zoom hint */}
            <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-heritage-charcoal/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[10px] text-heritage-stone dark:text-heritage-ivory/50">
              🖱 Scroll to zoom · Drag to pan · Click markers
            </div>

            {/* Visible features count badge */}
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-heritage-charcoal/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
              <p className="text-[11px] font-bold text-heritage-charcoal dark:text-heritage-ivory">
                {displayFeatures.length} features
              </p>
            </div>
          </div>

          {/* Area Snapshot (collapsible) */}
          <div>
            <button
              onClick={() => setShowSnapshotPanel(p => !p)}
              className="flex items-center gap-2 text-xs font-semibold text-heritage-charcoal dark:text-heritage-ivory mb-2"
            >
              <Activity size={13} className="text-heritage-maroon" />
              Area Health Snapshot
              {showSnapshotPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showSnapshotPanel && <AreaSnapshotPanel snapshot={snapshot} />}
          </div>
        </div>

        {/* ── RIGHT: List panel ────────────────────────────────────────────── */}
        <div className="w-80 shrink-0 flex flex-col gap-3">
          {selectedFeature ? (
            /* Detail view */
            <div className="flex-1 bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 dark:border-heritage-charcoal overflow-hidden">
              <FeatureDetailPanel feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
            </div>
          ) : (
            /* List / Nearby tabs */
            <div className="flex-1 flex flex-col bg-white dark:bg-heritage-charcoal rounded-xl border border-heritage-stone/30 dark:border-heritage-charcoal overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-heritage-stone/20 dark:border-heritage-charcoal shrink-0">
                {(['list', 'nearby'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                      activeTab === tab
                        ? 'text-heritage-maroon border-b-2 border-heritage-maroon bg-heritage-maroon/5'
                        : 'text-heritage-stone dark:text-heritage-ivory/50 hover:text-heritage-charcoal dark:hover:text-heritage-ivory'
                    }`}
                  >
                    {tab === 'list' ? (
                      <span className="flex items-center justify-center gap-1.5"><Filter size={12} /> All Features</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5"><MapPin size={12} /> Near City Centre</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Feature list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {(activeTab === 'nearby' && loadingNearby) && (
                  <div className="flex items-center gap-2 text-sm text-heritage-stone dark:text-heritage-ivory/50 p-2">
                    <RefreshCw size={14} className="animate-spin" /> Loading nearby…
                  </div>
                )}
                {listFeatures.length === 0 && !loading && !loadingNearby && (
                  <div className="text-center py-8">
                    <Globe size={28} className="text-heritage-stone/30 dark:text-heritage-ivory/20 mx-auto mb-2" />
                    <p className="text-xs text-heritage-stone dark:text-heritage-ivory/40">
                      {searchMode ? 'No results for your search' : 'Enable layers to see features'}
                    </p>
                  </div>
                )}
                {listFeatures.slice(0, 40).map(f => (
                  <FeatureCard
                    key={f.id}
                    feature={f}
                    onClick={() => setSelectedFeature(f)}
                    compact
                  />
                ))}
                {listFeatures.length > 40 && (
                  <p className="text-center text-[11px] text-heritage-stone dark:text-heritage-ivory/40 py-2">
                    +{listFeatures.length - 40} more features — use filters to narrow results
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreCityCenter;
