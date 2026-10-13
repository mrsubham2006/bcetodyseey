import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyCase, Hospital } from '../types';
import { KonarkWheelIcon } from '../components/OdishaMotifs';
import {
  Flame,
  AlertOctagon,
  Truck,
  Hospital as HospIcon,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Navigation,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const EmergencyResponseView: React.FC = () => {
  const { language, showToast } = useApp();
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const fetchEmergencyData = async () => {
    setLoading(true);
    try {
      const [emRes, hRes] = await Promise.all([
        fetch('/api/v1/emergency-cases'),
        fetch('/api/v1/hospitals')
      ]);
      if (emRes.ok) setEmergencyCases(await emRes.json());
      if (hRes.ok) setHospitals(await hRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const handleSimulateDispatch = async () => {
    setDispatching(true);
    try {
      const res = await fetch('/api/v1/emergency-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: 1,
          emergency_type: "CRITICAL_CARDIAC_AMBULANCE_TRANSFER",
          severity: "CRITICAL",
          hospital_id: hospitals[0]?.id || 1,
          ambulance_id: "OD-02-AMB-108-LIFELINE"
        })
      });
      if (res.ok) {
        showToast("108 Lifeline Ambulance Dispatched! Destination: AIIMS Bhubaneswar", "success");
        fetchEmergencyData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-heritage-stone dark:border-heritage-charcoal pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-7 h-7 text-heritage-red animate-pulse" />
            <h1 className="font-serif font-bold text-2xl text-heritage-maroon dark:text-heritage-gold">
              {language === 'en' ? "Emergency Response Coordination Desk" : "ଜରୁରୀକାଳୀନ ପ୍ରତିକ୍ରିୟା ସମନ୍ୱୟ କେନ୍ଦ୍ର"}
            </h1>
          </div>
          <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-1 font-sans">
            Multi-agency emergency orchestration: 108 Ambulance Network, Odisha Fire & Emergency Services, and Traffic Escorts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateDispatch}
            disabled={dispatching}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-heritage-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-ping" />
            <span>{dispatching ? "Dispatching..." : "Simulate 108 Emergency Dispatch"}</span>
          </button>

          <button
            onClick={fetchEmergencyData}
            disabled={loading}
            className="p-2 rounded-xl border border-heritage-stone bg-white dark:bg-heritage-charcoal text-xs hover:border-heritage-gold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Emergency Active Dispatch Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyCases.map(em => (
          <div
            key={em.id}
            className="p-5 rounded-2xl bg-white dark:bg-heritage-charcoal border-2 border-heritage-red/60 shadow-heritage space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-heritage-red">CASE-EM-{em.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-heritage-red text-white animate-pulse">
                {em.severity}
              </span>
            </div>

            <div>
              <h4 className="font-serif font-bold text-sm text-heritage-charcoal dark:text-heritage-ivory">
                {em.emergency_type.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-heritage-aged dark:text-heritage-stone/80 mt-0.5">
                Vehicle: <b>{em.ambulance_id || 'OD-02-AMB-108'}</b>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-heritage-stone/30 dark:bg-heritage-charcoal-dark text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-heritage-aged">Hospital Destination:</span>
                <b className="text-heritage-maroon dark:text-heritage-gold">{em.destination_hospital_name}</b>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-heritage-aged">Route Status:</span>
                <b className={em.route_status.includes('REROUTED') ? 'text-heritage-orange' : 'text-heritage-green'}>
                  {em.route_status.replace(/_/g, ' ')}
                </b>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-heritage-aged">Estimated Arrival:</span>
                <b className="font-mono text-sm text-heritage-red">{em.eta_minutes} Minutes</b>
              </div>
            </div>

            <div className="pt-2 border-t border-heritage-stone/60 flex items-center justify-between text-xs">
              <span className="text-heritage-green font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: {em.status}</span>
              </span>
              <span className="text-heritage-aged font-mono text-[10px]">
                {new Date(em.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
