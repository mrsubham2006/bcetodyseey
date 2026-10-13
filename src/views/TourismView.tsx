import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TourismPlace } from '../types';
import { KonarkWheelIcon, IkatPatternDivider } from '../components/OdishaMotifs';
import {
  Compass,
  Clock,
  MapPin,
  Sparkles,
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const TourismView: React.FC = () => {
  const { language, showToast } = useApp();
  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<TourismPlace | null>(null);
  const [activeTab, setActiveTab] = useState<'attractions' | 'itinerary'>('attractions');

  const fetchTourismPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/tourism');
      if (res.ok) setPlaces(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourismPlaces();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Hero Cultural Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-heritage-maroon via-heritage-maroon-dark to-heritage-charcoal text-white shadow-heritage-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-heritage-gold/20 border border-heritage-gold/40 text-heritage-gold text-xs font-semibold mb-3">
            <KonarkWheelIcon size={18} className="text-heritage-gold" />
            <span>ODISHA CULTURAL HERITAGE GATEWAY</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            {language === 'en' ? "Explore Odisha's Sacred Heritage & Smart Corridors" : "ଓଡ଼ିଶାର ଅମର ଐତିହ୍ୟ ଓ ସ୍ମାର୍ଟ ପର୍ଯ୍ୟଟନ"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-heritage-stone/90 leading-relaxed font-sans">
            {language === 'en'
              ? "Timeless temple architecture, coastal sanctuaries, and artisan villages protected by Civic Nexus AI real-time safety advisories."
              : "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର, ଶ୍ରୀ ଜଗନ୍ନାଥ ଧାମ ପୁରୀ ଓ ଏକାମ୍ର କ୍ଷେତ୍ରର ସୁରକ୍ଷିତ ଯାତ୍ରା।"}
          </p>

          <div className="mt-4 flex items-center space-x-3 text-xs">
            <button
              onClick={() => setActiveTab('attractions')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'attractions'
                  ? 'bg-heritage-gold text-heritage-charcoal shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Destinations & Monuments
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-heritage-gold text-heritage-charcoal shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              AI Cultural Itinerary Generator
            </button>
          </div>
        </div>
      </div>

      {/* Sambalpuri Ikat Border */}
      <IkatPatternDivider />

      {activeTab === 'attractions' ? (
        /* Destinations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map(p => (
            <div
              key={p.id}
              className="rounded-2xl overflow-hidden bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-heritage flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-200"
            >
              <div>
                {/* Photo & Category Badge */}
                <div className="relative h-48 overflow-hidden bg-heritage-stone">
                  <img
                    src={p.image_url || "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-heritage-maroon/90 text-heritage-gold backdrop-blur-md">
                    {p.category.replace(/_/g, ' ')}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                    {p.odia_name}
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs font-sans">
                  <h3 className="font-serif font-bold text-base text-heritage-charcoal dark:text-heritage-ivory">
                    {p.name}
                  </h3>
                  <p className="text-heritage-aged dark:text-heritage-stone/80 line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="pt-2 border-t border-heritage-stone/60 space-y-1 text-[11px] text-heritage-charcoal dark:text-heritage-stone">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-heritage-gold" />
                      <span><b>Timings:</b> {p.timings}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Accessibility className="w-3.5 h-3.5 text-heritage-blue" />
                      <span><b>Accessibility:</b> {p.accessibility_notes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Status & Real-Time Detour Alert */}
              <div className="p-4 bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border-t border-heritage-stone/60 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-heritage-green font-bold">
                  <CheckCircle2 className="w-4 h-4 text-heritage-green" />
                  <span>{p.current_safety_status.replace(/_/g, ' ')}</span>
                </span>
                <span className="text-[11px] font-semibold text-heritage-maroon dark:text-heritage-gold hover:underline cursor-pointer">
                  Plan Journey →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* AI Cultural Itinerary Generator */
        <div className="p-6 rounded-2xl bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal shadow-heritage space-y-5">
          <div className="flex items-center space-x-2 text-heritage-maroon dark:text-heritage-gold">
            <Sparkles className="w-5 h-5 text-heritage-gold" />
            <h3 className="font-serif font-bold text-lg">
              AI-Generated 2-Day Odisha Cultural Circuit (Hazard-Aware)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-heritage-maroon text-heritage-gold">
                DAY 1: EKAMRA KSHETRA & PEACE CORRIDOR
              </span>
              <ul className="space-y-2 text-heritage-charcoal dark:text-heritage-stone">
                <li><b>07:00 AM:</b> Sacred Darshan at Lingaraj Temple, Old Town Bhubaneswar.</li>
                <li><b>10:30 AM:</b> Ashokan Rock Edicts & Shanti Stupa at historic Dhauli Hills.</li>
                <li><b>03:00 PM:</b> Ancient rock-cut architecture of Udayagiri and Khandagiri Caves.</li>
                <li className="text-heritage-green font-semibold">
                  ✔ Route Advisory: Clear flow along Daya West Canal Road.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone space-y-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-heritage-maroon text-heritage-gold">
                DAY 2: GOLDEN TRIANGLE & ARTISAN VILLAGE
              </span>
              <ul className="space-y-2 text-heritage-charcoal dark:text-heritage-stone">
                <li><b>06:30 AM:</b> Sunrise at UNESCO World Heritage Konark Sun Temple.</li>
                <li><b>11:00 AM:</b> Master Pattachitra palm-leaf artisans at Raghurajpur Crafts Village.</li>
                <li><b>04:00 PM:</b> Sri Jagannath Temple & Sunset at Golden Beach, Puri.</li>
                <li className="text-heritage-orange font-semibold">
                  ⚠ Route Advisory: Detour active via Vani Vihar bypass avoiding Rasulgarh flood.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
