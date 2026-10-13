import React, { useEffect, useRef } from 'react';
import { Incident, Hospital, CameraSource, RoadRestriction } from '../types';
import L from 'leaflet';

interface SmartCityMapProps {
  incidents?: Incident[];
  hospitals?: Hospital[];
  cameras?: CameraSource[];
  restrictions?: RoadRestriction[];
  onSelectIncident?: (incident: Incident) => void;
  selectedIncidentId?: number;
  height?: string;
  showEmergencyCorridor?: boolean;
}

export const SmartCityMap: React.FC<SmartCityMapProps> = ({
  incidents = [],
  hospitals = [],
  cameras = [],
  restrictions = [],
  onSelectIncident,
  selectedIncidentId,
  height = "520px",
  showEmergencyCorridor = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered around Bhubaneswar, Odisha
      const map = L.map(mapContainerRef.current, {
        center: [20.2961, 85.8350],
        zoom: 12,
        scrollWheelZoom: true,
      });

      // Warm Odisha / Carto style basemap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Civic Nexus AI Odisha',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Keep map alive during tabs
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const map = mapInstanceRef.current;

    // Helper for custom colored SVGs
    const createCustomIcon = (bgColor: string, text: string, shape: string = 'pin') => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #FAF7F0; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${text}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // 1. Add Incidents
    incidents.forEach(inc => {
      let color = '#C49A45'; // Medium Gold
      if (inc.severity === 'CRITICAL') color = '#B83232'; // Jagannath Red
      else if (inc.severity === 'HIGH') color = '#D97732'; // Konark Orange
      else if (inc.severity === 'LOW') color = '#355E3B'; // Forest Green
      if (inc.status === 'RESOLVED') color = '#22C55E'; // Success Green

      const marker = L.marker([inc.latitude, inc.longitude], {
        icon: createCustomIcon(color, inc.category.charAt(0))
      });

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #292521; min-width: 190px;">
          <div style="font-weight: 700; color: #722F37; margin-bottom: 3px;">${inc.incident_code}</div>
          <div style="font-weight: 600; margin-bottom: 4px;">${inc.title}</div>
          <div style="margin-bottom: 4px; color: #8B8276;">${inc.address}</div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">${inc.severity}</span>
            <span style="background: #E8DFCF; color: #292521; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${inc.status}</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // 2. Add Hospitals
    hospitals.forEach(h => {
      const hMarker = L.marker([h.latitude, h.longitude], {
        icon: createCustomIcon('#286A83', 'H')
      });
      hMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #292521;">
          <div style="font-weight: bold; color: #286A83;">${h.name}</div>
          <div>${h.location_name}</div>
          <div style="margin-top: 4px; font-size: 11px;">ICU Beds Available: <b>${h.available_icu}</b> / ${h.icu_beds}</div>
          <div style="color: #22C55E; font-weight: 600;">Trauma: ${h.trauma_level}</div>
        </div>
      `);
      markersLayerRef.current?.addLayer(hMarker);
    });

    // 3. Add Cameras
    cameras.forEach(c => {
      const cMarker = L.marker([c.latitude, c.longitude], {
        icon: createCustomIcon('#722F37', 'C')
      });
      cMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #292521;">
          <div style="font-weight: bold; color: #722F37;">${c.camera_code}</div>
          <div>${c.location_name}</div>
          <div style="color: #22C55E; font-size: 10px; font-weight: bold;">● AI CV STREAM ACTIVE</div>
        </div>
      `);
      markersLayerRef.current?.addLayer(cMarker);
    });

    // 4. Add Road Restrictions & Detour Polylines
    restrictions.forEach(r => {
      if (r.status === 'ACTIVE') {
        const line = L.polyline([
          [r.lat_start, r.lng_start],
          [r.lat_end, r.lng_end]
        ], {
          color: '#B83232',
          weight: 7,
          dashArray: '8, 8',
          opacity: 0.85
        });
        line.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 12px; color: #B83232; font-weight: bold;">
            RESTRICTED ROADWAY: ${r.road_name}
            <div style="color: #292521; font-weight: normal; margin-top: 2px;">${r.segment_description}</div>
          </div>
        `);
        markersLayerRef.current?.addLayer(line);
      }
    });

    // 5. Emergency Detour Corridor (Vani Vihar bypass)
    if (showEmergencyCorridor) {
      const detour = L.polyline([
        [20.3120, 85.8580], // Hanspal
        [20.2905, 85.8462], // Vani Vihar Bypass
        [20.2642, 85.8234]  // Capital Hospital
      ], {
        color: '#22C55E',
        weight: 5,
        dashArray: '5, 10',
        opacity: 0.9
      });
      detour.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #22C55E; font-weight: bold;">
          AI RECOMMENDED EMERGENCY GREEN CORRIDOR
          <div style="color: #292521; font-weight: normal; margin-top: 2px;">Bypasses Rasulgarh Flood Bottleneck (Saved 19 Mins)</div>
        </div>
      `);
      markersLayerRef.current?.addLayer(detour);
    }

  }, [incidents, hospitals, cameras, restrictions, showEmergencyCorridor]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-heritage-stone dark:border-heritage-charcoal shadow-heritage">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-heritage-ivory/90 dark:bg-heritage-charcoal-dark/90 backdrop-blur-md px-3 py-2 rounded-xl border border-heritage-stone dark:border-heritage-charcoal text-[11px] font-sans flex items-center space-x-3 shadow-md">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-heritage-red inline-block" />
          <span className="text-heritage-charcoal dark:text-heritage-ivory">Critical</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-heritage-orange inline-block" />
          <span className="text-heritage-charcoal dark:text-heritage-ivory">High</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-heritage-gold inline-block" />
          <span className="text-heritage-charcoal dark:text-heritage-ivory">Medium</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-heritage-blue inline-block" />
          <span className="text-heritage-charcoal dark:text-heritage-ivory">Hospitals</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-0.5 bg-heritage-green inline-block" />
          <span className="text-heritage-charcoal dark:text-heritage-ivory">Green Corridor</span>
        </div>
      </div>
    </div>
  );
};
