import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ShieldCheck, Compass, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

interface SatelliteLocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
  ward?: string;
  city?: string;
  pincode?: string;
  captureMode?: 'AUTO_GPS' | 'MANUAL_ENTRY';
  accuracyMeters?: number;
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number, details?: { address: string; landmark: string; city: string; pincode: string }) => void;
  height?: string;
}

export const SatelliteLocationMap: React.FC<SatelliteLocationMapProps> = ({
  latitude,
  longitude,
  address = 'Rasulgarh Junction Underpass, NH-16, Ward 28, Bhubaneswar',
  landmark = 'Rasulgarh Overbridge Sluice Channel',
  ward = 'BMC Ward 28 (North-Central)',
  city = 'Bhubaneswar',
  pincode = '751010',
  captureMode = 'AUTO_GPS',
  accuracyMeters = 4.5,
  interactive = false,
  onLocationChange,
  height = '300px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [liveAddress, setLiveAddress] = useState<string>(address);
  const [liveLandmark, setLiveLandmark] = useState<string>(landmark);
  const [liveCity, setLiveCity] = useState<string>(city);
  const [livePincode, setLivePincode] = useState<string>(pincode);

  useEffect(() => {
    setLiveAddress(address);
    setLiveLandmark(landmark);
    setLiveCity(city);
    setLivePincode(pincode);
  }, [address, landmark, city, pincode]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.residential || 'Location Pin';
        const area = addr.suburb || addr.neighbourhood || addr.county || addr.city_district || 'Urban Sector';
        const cty = addr.city || addr.town || addr.village || addr.district || 'Bhubaneswar';
        const pc = addr.postcode || '751010';
        const fullAddr = data.display_name || `${road}, ${area}, ${cty} - ${pc}`;

        setLiveAddress(fullAddr);
        setLiveLandmark(road);
        setLiveCity(cty);
        setLivePincode(pc);

        if (onLocationChange) {
          onLocationChange(lat, lng, {
            address: fullAddr,
            landmark: road,
            city: cty,
            pincode: pc
          });
        }
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map with Esri World Imagery Satellite Tiles
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 17,
        scrollWheelZoom: interactive,
      });

      // Esri Satellite Layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, USDA, USGS | Civic Nexus AI Odisha',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add labels overlay (Esri Transportation/Labels layer for street/place names)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);

      // Custom pulsing gold/red pin icon
      const customIcon = L.divIcon({
        className: 'custom-satellite-pin',
        html: `
          <div style="position: relative; display: flex; items-center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(196, 154, 69, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #B83232; border: 2.5px solid #C49A45; width: 30px; height: 30px; border-radius: 50%; box-shadow: 0 0 15px rgba(184, 50, 50, 0.9); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
        draggable: interactive,
      }).addTo(map);

      if (interactive) {
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [latitude, longitude, interactive]);

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-heritage-gold/60 bg-heritage-charcoal shadow-heritage-lg flex flex-col">
      {/* Map Satellite Canvas Header Bar */}
      <div className="bg-gradient-to-r from-heritage-charcoal-dark via-heritage-charcoal to-heritage-charcoal-dark px-4 py-2.5 text-white flex items-center justify-between text-xs border-b border-heritage-gold/30">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-heritage-gold" />
          <span className="font-serif font-bold tracking-wide uppercase text-xs text-heritage-gold">
            Exact Location Satellite Telemetry
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {geocoding && (
            <span className="flex items-center space-x-1 text-[11px] text-heritage-gold font-semibold animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Reverse Geocoding…</span>
            </span>
          )}
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
            captureMode === 'AUTO_GPS'
              ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 shadow-sm'
              : 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-sm'
          }`}>
            {captureMode === 'AUTO_GPS' ? '📍 AUTO GPS STAMP' : '✍️ MANUAL ENTRY'}
          </span>
        </div>
      </div>

      {/* Satellite Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full relative z-10"
      />

      {/* Official Exact Location Stamp Box */}
      <div className="bg-heritage-charcoal-dark text-heritage-ivory p-4 space-y-3 border-t-2 border-heritage-gold/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-heritage-charcoal/80 p-3 rounded-xl border border-heritage-gold/30">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-heritage-gold text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold" />
              <span>Verified Address & Location Stamp</span>
            </div>
            <p className="font-bold text-xs sm:text-sm text-white leading-snug">
              {liveAddress}
            </p>
          </div>
          <div className="shrink-0 text-right font-mono text-xs font-bold text-heritage-gold bg-heritage-charcoal px-3 py-1.5 rounded-lg border border-heritage-gold/40 shadow-sm">
            <span>{latitude.toFixed(6)}° N</span>
            <br />
            <span>{longitude.toFixed(6)}° E</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
          <div className="bg-heritage-charcoal/50 p-2 rounded-lg border border-white/5">
            <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Landmark / Suburb</span>
            <span className="font-semibold text-heritage-stone truncate block">{liveLandmark || 'Near Main Road'}</span>
          </div>
          <div className="bg-heritage-charcoal/50 p-2 rounded-lg border border-white/5">
            <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Municipal Ward / Zone</span>
            <span className="font-semibold text-heritage-gold truncate block">{ward}</span>
          </div>
          <div className="bg-heritage-charcoal/50 p-2 rounded-lg border border-white/5">
            <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">City & Postal Code</span>
            <span className="font-semibold text-heritage-stone truncate block">{liveCity} - {livePincode}</span>
          </div>
          <div className="bg-heritage-charcoal/50 p-2 rounded-lg border border-white/5">
            <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Fix Quality</span>
            <span className="font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>±{accuracyMeters}m Verified</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
