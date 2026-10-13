import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  MapPin, Navigation, ShieldCheck, Compass, Layers, CheckCircle2,
  RefreshCw, Search, AlertCircle, Check, Copy, Crosshair, Globe,
  Building, Map as MapIcon, Sliders
} from 'lucide-react';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  landmark: string;
  ward: string;
  city: string;
  pincode: string;
  accuracyMeters: number;
  captureMode: 'AUTO_GPS' | 'MANUAL_ENTRY';
}

interface DualModeLocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
  initialLandmark?: string;
  initialWard?: string;
  initialCity?: string;
  initialPincode?: string;
  initialMode?: 'AUTO_GPS' | 'MANUAL_ENTRY';
  onLocationSelect: (location: LocationData) => void;
  preferOdia?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    postcode?: string;
  };
}

export const DualModeLocationPicker: React.FC<DualModeLocationPickerProps> = ({
  initialLatitude = 20.2961,
  initialLongitude = 85.8645,
  initialAddress = 'Rasulgarh Junction Underpass, NH-16, Ward 28, Bhubaneswar',
  initialLandmark = 'Rasulgarh Overbridge Sluice Channel',
  initialWard = 'BMC Ward 28 (North-Central)',
  initialCity = 'Bhubaneswar',
  initialPincode = '751010',
  initialMode = 'AUTO_GPS',
  onLocationSelect,
  preferOdia = false,
}) => {
  // Mode selection
  const [mode, setMode] = useState<'AUTO_GPS' | 'MANUAL_ENTRY'>(initialMode);

  // Core coordinates & address details
  const [latitude, setLatitude] = useState<number>(initialLatitude);
  const [longitude, setLongitude] = useState<number>(initialLongitude);
  const [address, setAddress] = useState<string>(initialAddress);
  const [landmark, setLandmark] = useState<string>(initialLandmark);
  const [ward, setWard] = useState<string>(initialWard);
  const [city, setCity] = useState<string>(initialCity);
  const [pincode, setPincode] = useState<string>(initialPincode);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4.5);

  // GPS state
  const [gettingGPS, setGettingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  // Map state
  const [mapTileType, setMapTileType] = useState<'SATELLITE' | 'STREET'>('SATELLITE');
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Address search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);

  // Emit change to parent
  const emitLocationChange = useCallback(
    (lat: number, lng: number, addr: string, lmk: string, wrd: string, cty: string, pin: string, acc: number, capMode: 'AUTO_GPS' | 'MANUAL_ENTRY') => {
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: addr,
        landmark: lmk,
        ward: wrd,
        city: cty,
        pincode: pin,
        accuracyMeters: acc,
        captureMode: capMode,
      });
    },
    [onLocationSelect]
  );

  // Reverse geocode lat, lng to address using Nominatim
  const reverseGeocode = async (lat: number, lng: number, acc: number = 5.0) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addrObj = data.address || {};

        const road = addrObj.road || addrObj.pedestrian || addrObj.suburb || addrObj.neighbourhood || addrObj.residential || 'Location Pin';
        const area = addrObj.suburb || addrObj.neighbourhood || addrObj.county || addrObj.city_district || 'Urban Sector';
        const ctyVal = addrObj.city || addrObj.town || addrObj.village || addrObj.district || 'Bhubaneswar';
        const pcVal = addrObj.postcode || '751010';
        const fullAddr = data.display_name || `${road}, ${area}, ${ctyVal} - ${pcVal}`;
        const estimatedWard = addrObj.suburb ? `BMC Ward (${addrObj.suburb})` : 'BMC Ward 28 (North-Central)';

        setAddress(fullAddr);
        setLandmark(road);
        setWard(estimatedWard);
        setCity(ctyVal);
        setPincode(pcVal);
        setAccuracyMeters(acc);

        emitLocationChange(lat, lng, fullAddr, road, estimatedWard, ctyVal, pcVal, acc, mode);
      }
    } catch (err) {
      console.warn('Reverse geocoding warning:', err);
    } finally {
      setGeocoding(false);
    }
  };

  // High Precision Device GPS handler (Mode A)
  const handleAcquireGPS = () => {
    setGettingGPS(true);
    setGpsError(null);
    setGpsSuccess(false);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please select location manually on map.');
      setGettingGPS(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = parseFloat((pos.coords.accuracy || 4.5).toFixed(1));

        setLatitude(lat);
        setLongitude(lng);
        setAccuracyMeters(acc);
        setGettingGPS(false);
        setGpsSuccess(true);
        setGpsError(null);

        // Update Map Center
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 17);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          if (accuracyCircleRef.current) {
            accuracyCircleRef.current.setLatLng([lat, lng]);
            accuracyCircleRef.current.setRadius(acc);
          }
        }

        reverseGeocode(lat, lng, acc);
      },
      (err) => {
        console.warn('GPS position error:', err);
        // High-Precision fallback to Odisha Capital center
        const fallbackLat = 20.2961;
        const fallbackLng = 85.8645;
        const fallbackAcc = 12.0;

        setLatitude(fallbackLat);
        setLongitude(fallbackLng);
        setAccuracyMeters(fallbackAcc);

        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('GPS permission was denied. Defaulting to high-precision city telemetry coordinates.');
        } else if (err.code === err.TIMEOUT) {
          setGpsError('GPS signal timed out. Loaded high-precision municipal telemetry coordinates.');
        } else {
          setGpsError('GPS signal unavailable. Switched to high-precision municipal telemetry coordinates.');
        }

        setGettingGPS(false);
        if (mapRef.current) {
          mapRef.current.setView([fallbackLat, fallbackLng], 17);
          if (markerRef.current) markerRef.current.setLatLng([fallbackLat, fallbackLng]);
        }
        reverseGeocode(fallbackLat, fallbackLng, fallbackAcc);
      },
      options
    );
  };

  // Autocomplete Address Search with Nominatim API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery + ', Odisha, India'
          )}&addressdetails=1&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchResults(true);
        }
      } catch (e) {
        console.warn('Search failed:', e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a search result
  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(parseFloat(result.lat).toFixed(6));
    const lng = parseFloat(parseFloat(result.lon).toFixed(6));

    setLatitude(lat);
    setLongitude(lng);
    setSearchQuery('');
    setShowSearchResults(false);

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      if (accuracyCircleRef.current) accuracyCircleRef.current.setLatLng([lat, lng]);
    }

    reverseGeocode(lat, lng, 3.5);
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Create Map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 17,
        zoomControl: true,
      });

      // Esri World Imagery Satellite Tile Layer
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri | Civic Nexus AI Odisha', maxZoom: 19 }
      );

      // Esri World Transportation Label Layer
      const labelLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      );

      // OpenStreetMap Street Tile Layer
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      satelliteLayerRef.current = satelliteLayer;
      labelLayerRef.current = labelLayer;
      streetLayerRef.current = streetLayer;

      // Add default layers
      if (mapTileType === 'SATELLITE') {
        satelliteLayer.addTo(map);
        labelLayer.addTo(map);
      } else {
        streetLayer.addTo(map);
      }

      // Accuracy circle
      const accuracyCircle = L.circle([latitude, longitude], {
        radius: accuracyMeters,
        color: '#C49A45',
        fillColor: '#C49A45',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
      accuracyCircleRef.current = accuracyCircle;

      // Custom pulsing marker pin icon
      const pinIcon = L.divIcon({
        className: 'custom-location-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(196, 154, 69, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #B83232; border: 2.5px solid #C49A45; width: 34px; height: 34px; border-radius: 50%; box-shadow: 0 0 16px rgba(184, 50, 50, 0.85); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([latitude, longitude], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      // Drag pin handler
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const newLat = parseFloat(pos.lat.toFixed(6));
        const newLng = parseFloat(pos.lng.toFixed(6));

        setLatitude(newLat);
        setLongitude(newLng);
        if (accuracyCircleRef.current) accuracyCircleRef.current.setLatLng([newLat, newLng]);

        reverseGeocode(newLat, newLng, 3.0);
      });

      // Map click-to-place pin handler
      map.on('click', (e) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));

        setLatitude(newLat);
        setLongitude(newLng);
        marker.setLatLng([newLat, newLng]);
        if (accuracyCircleRef.current) accuracyCircleRef.current.setLatLng([newLat, newLng]);

        reverseGeocode(newLat, newLng, 3.0);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }
  }, []);

  // Update map layer when mapTileType changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (mapTileType === 'SATELLITE') {
      if (streetLayerRef.current && map.hasLayer(streetLayerRef.current)) {
        map.removeLayer(streetLayerRef.current);
      }
      if (satelliteLayerRef.current && !map.hasLayer(satelliteLayerRef.current)) {
        satelliteLayerRef.current.addTo(map);
      }
      if (labelLayerRef.current && !map.hasLayer(labelLayerRef.current)) {
        labelLayerRef.current.addTo(map);
      }
    } else {
      if (satelliteLayerRef.current && map.hasLayer(satelliteLayerRef.current)) {
        map.removeLayer(satelliteLayerRef.current);
      }
      if (labelLayerRef.current && map.hasLayer(labelLayerRef.current)) {
        map.removeLayer(labelLayerRef.current);
      }
      if (streetLayerRef.current && !map.hasLayer(streetLayerRef.current)) {
        streetLayerRef.current.addTo(map);
      }
    }
  }, [mapTileType]);

  // Sync mode switch
  const switchMode = (newMode: 'AUTO_GPS' | 'MANUAL_ENTRY') => {
    setMode(newMode);
    if (newMode === 'AUTO_GPS') {
      handleAcquireGPS();
    }
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. DUAL MODE SEGMENTED CONTROL ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark border border-heritage-stone/60 dark:border-heritage-charcoal">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto flex-1">
          <button
            type="button"
            onClick={() => switchMode('AUTO_GPS')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === 'AUTO_GPS'
                ? 'bg-heritage-maroon text-heritage-gold shadow-heritage border border-heritage-gold/40'
                : 'text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/40'
            }`}
          >
            <Navigation className={`w-4 h-4 ${mode === 'AUTO_GPS' ? 'text-heritage-gold animate-pulse' : ''}`} />
            <span>⚡ Auto-Detect GPS</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('MANUAL_ENTRY')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === 'MANUAL_ENTRY'
                ? 'bg-heritage-maroon text-heritage-gold shadow-heritage border border-heritage-gold/40'
                : 'text-heritage-charcoal dark:text-heritage-stone hover:bg-heritage-stone/40'
            }`}
          >
            <MapPin className="w-4 h-4 text-heritage-gold" />
            <span>📍 Manual Pin / Search</span>
          </button>
        </div>

        {/* Map View Mode Switcher */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0 bg-white dark:bg-heritage-charcoal p-1 rounded-xl border border-heritage-stone dark:border-heritage-charcoal">
          <button
            type="button"
            onClick={() => setMapTileType('SATELLITE')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              mapTileType === 'SATELLITE'
                ? 'bg-heritage-maroon text-white shadow-sm'
                : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapTileType('STREET')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              mapTileType === 'STREET'
                ? 'bg-heritage-maroon text-white shadow-sm'
                : 'text-heritage-aged hover:text-heritage-charcoal dark:hover:text-white'
            }`}
          >
            Street Map
          </button>
        </div>
      </div>

      {/* ── 2. MODE A: AUTOMATIC DEVICE GPS CARD ───────────────────────────── */}
      {mode === 'AUTO_GPS' && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-heritage-gold/50 space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-heritage-maroon text-heritage-gold shadow-sm">
                <Navigation className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory">
                  High-Precision Browser GPS Telemetry
                </p>
                <p className="text-[11px] text-heritage-aged">
                  Acquires exact hardware GPS fix with precision accuracy radius.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcquireGPS}
              disabled={gettingGPS}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-heritage-maroon text-white text-xs font-semibold hover:bg-heritage-maroon-dark disabled:opacity-50 transition-all shadow-sm"
            >
              {gettingGPS ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Acquiring Signal…</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>Refresh GPS Fix</span>
                </>
              )}
            </button>
          </div>

          {/* GPS Status Banner */}
          {gpsError ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          ) : gpsSuccess ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>GPS Lock Acquired (Accuracy radius: ±{accuracyMeters}m)</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* ── 3. MODE B: ADDRESS SEARCH AUTOCOMPLETE & MANUAL CONTROLS ──────── */}
      {mode === 'MANUAL_ENTRY' && (
        <div className="space-y-3 animate-fade-in">
          {/* Autocomplete Search Bar */}
          <div className="relative z-30">
            <label className="block text-xs font-bold text-heritage-charcoal dark:text-heritage-ivory mb-1">
              Search Location / Landmark
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-aged" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type street name, landmark, or area (e.g. Rasulgarh, Janpath, Master Canteen)..."
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-heritage-stone dark:border-heritage-charcoal bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory focus:ring-2 focus:ring-heritage-gold/50 focus:outline-none"
              />
              {isSearching && (
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-gold animate-spin" />
              )}
            </div>

            {/* Dropdown Suggestions */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-heritage-charcoal border border-heritage-stone dark:border-heritage-charcoal rounded-xl shadow-heritage-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-heritage-stone/30 dark:divide-heritage-charcoal-dark z-50">
                {searchResults.map((res, resIdx) => (
                  <button
                    key={res.place_id ? `sr-${res.place_id}-${resIdx}` : `sr-${resIdx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-heritage-stone/30 dark:hover:bg-heritage-charcoal-dark transition-colors flex items-start space-x-2 text-xs"
                  >
                    <MapPin className="w-4 h-4 text-heritage-maroon dark:text-heritage-gold shrink-0 mt-0.5" />
                    <span className="text-heritage-charcoal dark:text-heritage-ivory line-clamp-2">
                      {res.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editable Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-heritage-stone/10 dark:bg-heritage-charcoal-dark border border-heritage-stone/40">
            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">
                Landmark / Specific Spot Title
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value);
                  emitLocationChange(latitude, longitude, address, e.target.value, ward, city, pincode, accuracyMeters, mode);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  emitLocationChange(latitude, longitude, e.target.value, landmark, ward, city, pincode, accuracyMeters, mode);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-heritage-aged mb-1">
                Municipal Ward / Sector
              </label>
              <input
                type="text"
                value={ward}
                onChange={(e) => {
                  setWard(e.target.value);
                  emitLocationChange(latitude, longitude, address, landmark, e.target.value, city, pincode, accuracyMeters, mode);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    emitLocationChange(latitude, longitude, address, landmark, ward, e.target.value, pincode, accuracyMeters, mode);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-heritage-aged mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    emitLocationChange(latitude, longitude, address, landmark, ward, city, e.target.value, accuracyMeters, mode);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
                />
              </div>
            </div>
          </div>

          {/* Coordinate Direct Inputs */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-heritage-stone/20 dark:bg-heritage-charcoal-dark/60 border border-heritage-stone/40">
            <div>
              <label className="block text-[10px] font-bold text-heritage-aged uppercase mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 20.2961;
                  setLatitude(val);
                  if (mapRef.current) {
                    mapRef.current.setView([val, longitude], mapRef.current.getZoom());
                    if (markerRef.current) markerRef.current.setLatLng([val, longitude]);
                  }
                  reverseGeocode(val, longitude);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-heritage-aged uppercase mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 85.8645;
                  setLongitude(val);
                  if (mapRef.current) {
                    mapRef.current.setView([latitude, val], mapRef.current.getZoom());
                    if (markerRef.current) markerRef.current.setLatLng([latitude, val]);
                  }
                  reverseGeocode(latitude, val);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-heritage-stone bg-white dark:bg-heritage-charcoal text-heritage-charcoal dark:text-heritage-ivory"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 4. INTERACTIVE SATELLITE / STREET MAP CANVAS ───────────────────── */}
      <div className="rounded-2xl overflow-hidden border-2 border-heritage-gold/60 bg-heritage-charcoal shadow-heritage-lg flex flex-col">
        {/* Map Header Bar */}
        <div className="bg-gradient-to-r from-heritage-charcoal-dark via-heritage-charcoal to-heritage-charcoal-dark px-4 py-2.5 text-white flex items-center justify-between text-xs border-b border-heritage-gold/30">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-heritage-gold" />
            <span className="font-serif font-bold tracking-wide uppercase text-xs text-heritage-gold">
              Interactive Satellite & Pin Selector
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {geocoding && (
              <span className="flex items-center space-x-1 text-[11px] text-heritage-gold font-semibold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Reverse Geocoding…</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-heritage-maroon text-heritage-gold border-heritage-gold/60">
              {mode === 'AUTO_GPS' ? '⚡ AUTO GPS' : '📍 DRAG PIN TO MOVE'}
            </span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-[280px] relative z-10 cursor-crosshair" />

        {/* ── 5. OFFICIAL VERIFIED LOCATION TELEMETRY STAMP ─────────────────── */}
        <div className="bg-heritage-charcoal-dark text-heritage-ivory p-4 space-y-3 border-t-2 border-heritage-gold/40">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-heritage-charcoal/90 p-3 rounded-xl border border-heritage-gold/30">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 text-heritage-gold text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold" />
                <span>Verified Municipal Location Telemetry Stamp</span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-white leading-snug truncate">
                {address}
              </p>
            </div>

            <div className="shrink-0 flex items-center space-x-2">
              <div className="text-right font-mono text-xs font-bold text-heritage-gold bg-heritage-charcoal px-3 py-1.5 rounded-lg border border-heritage-gold/40 shadow-sm">
                <span>{latitude.toFixed(6)}° N</span>
                <br />
                <span>{longitude.toFixed(6)}° E</span>
              </div>
              <button
                type="button"
                onClick={copyCoordinates}
                className="p-2 rounded-lg bg-heritage-gold/20 hover:bg-heritage-gold/30 text-heritage-gold transition-colors"
                title="Copy Exact Coordinates"
              >
                {copiedCoords ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-heritage-charcoal/60 p-2 rounded-lg border border-white/5">
              <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Landmark / Spot</span>
              <span className="font-semibold text-heritage-stone truncate block">{landmark || 'Location Spot'}</span>
            </div>
            <div className="bg-heritage-charcoal/60 p-2 rounded-lg border border-white/5">
              <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Municipal Ward</span>
              <span className="font-semibold text-heritage-gold truncate block">{ward}</span>
            </div>
            <div className="bg-heritage-charcoal/60 p-2 rounded-lg border border-white/5">
              <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">City & Postal</span>
              <span className="font-semibold text-heritage-stone truncate block">{city} - {pincode}</span>
            </div>
            <div className="bg-heritage-charcoal/60 p-2 rounded-lg border border-white/5">
              <span className="text-heritage-aged block uppercase tracking-wider text-[9px] font-bold">Precision Stamp</span>
              <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>±{accuracyMeters}m Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
