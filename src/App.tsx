import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { useCitizen } from './context/CitizenContext';
import { Navbar } from './components/Navbar';
import { FlagshipRunnerModal } from './components/FlagshipRunnerModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { LandingView } from './views/LandingView';
import { CitizenPortalView } from './views/CitizenPortalView';
import { CitizenAuthView } from './views/CitizenAuthView';
import { CommandCenterView } from './views/CommandCenterView';
import { AIIntelligenceView } from './views/AIIntelligenceView';
import { MunicipalView } from './views/MunicipalView';
import { FieldWorkerMobileView } from './views/FieldWorkerMobileView';
import { EmergencyResponseView } from './views/EmergencyResponseView';
import { HospitalDeskView } from './views/HospitalDeskView';
import { TrafficView } from './views/TrafficView';
import { SmartCameraView } from './views/SmartCameraView';
import { WeatherView } from './views/WeatherView';
import { TourismView } from './views/TourismView';
import { SuperAdminView } from './views/SuperAdminView';
import { KonarkWheelIcon } from './components/OdishaMotifs';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import {
  Home, FileText, Activity, Cpu, Building2, HardHat,
  Flame, Hospital, Navigation, Camera, CloudRain, Compass,
  ShieldCheck, Zap, KeyRound
} from 'lucide-react';
import { UnifiedAccessPortalView } from './views/UnifiedAccessPortalView';

const NAV_ITEMS = [
  { id: 'landing',       labelEn: 'Home',            icon: Home },
  { id: 'portal',        labelEn: 'Access Portal',   icon: KeyRound },
  { id: 'citizen',       labelEn: 'Citizens',         icon: FileText },
  { id: 'command',       labelEn: 'Command',          icon: Activity },
  { id: 'ai_intelligence', labelEn: 'AI Intel',       icon: Cpu },
  { id: 'municipal',     labelEn: 'Municipal',        icon: Building2 },
  { id: 'field_worker',  labelEn: 'Field',            icon: HardHat },
  { id: 'emergency',     labelEn: 'Emergency',        icon: Flame },
  { id: 'hospitals',     labelEn: 'Hospitals',        icon: Hospital },
  { id: 'traffic',       labelEn: 'Traffic',          icon: Navigation },
  { id: 'cameras',       labelEn: 'Cameras',          icon: Camera },
  { id: 'weather',       labelEn: 'Weather',          icon: CloudRain },
  { id: 'tourism',       labelEn: 'Tourism',          icon: Compass },
  { id: 'admin',         labelEn: 'Admin',            icon: ShieldCheck },
];

export const App: React.FC = () => {
  const { toast, language } = useApp();
  const { isAuthenticated: isCitizenAuthenticated } = useCitizen();
  const [activeView, setActiveView] = useState<string>('landing');
  const [citizenAuthTab, setCitizenAuthTab] = useState<'register' | 'login'>('register');
  const [isFlagshipOpen, setIsFlagshipOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);

  // Requirement 1 & 15: Citizen navigation handling
  const handleNavClick = (viewId: string) => {
    if (viewId === 'citizen') {
      if (isCitizenAuthenticated) {
        // Authenticated citizen -> go directly to citizen dashboard
        setActiveView('citizen_dashboard');
      } else {
        // Not authenticated -> open /citizen/auth with Register tab by default
        setCitizenAuthTab('register');
        setActiveView('citizen_auth');
      }
      return;
    }
    setActiveView(viewId);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingView onExplore={(v) => handleNavClick(v)} onOpenFlagship={() => setIsFlagshipOpen(true)} />;
      case 'portal':
        return (
          <UnifiedAccessPortalView
            onSelectPanel={(panel) => {
              if (panel.id === 'citizen') {
                if (isCitizenAuthenticated) {
                  setActiveView('citizen_dashboard');
                } else {
                  setCitizenAuthTab('register');
                  setActiveView('citizen_auth');
                }
              } else {
                setActiveView(panel.targetView);
              }
            }}
          />
        );
      case 'citizen':
      case 'citizen_dashboard':
        // Protected route check: if unauthenticated, redirect to auth
        if (!isCitizenAuthenticated) {
          return (
            <CitizenAuthView
              initialTab={citizenAuthTab}
              onAuthenticated={() => setActiveView('citizen_dashboard')}
            />
          );
        }
        return <CitizenPortalView />;
      case 'citizen_auth':
        // If already authenticated, redirect directly to dashboard
        if (isCitizenAuthenticated) {
          return <CitizenPortalView />;
        }
        return (
          <CitizenAuthView
            initialTab={citizenAuthTab}
            onAuthenticated={() => setActiveView('citizen_dashboard')}
          />
        );
      case 'command':
        return <CommandCenterView />;
      case 'ai_intelligence':
        return <AIIntelligenceView />;
      case 'municipal':
        return <MunicipalView />;
      case 'field_worker':
        return <FieldWorkerMobileView />;
      case 'emergency':
        return <EmergencyResponseView />;
      case 'hospitals':
        return <HospitalDeskView />;
      case 'traffic':
        return <TrafficView />;
      case 'cameras':
        return <SmartCameraView />;
      case 'weather':
        return <WeatherView />;
      case 'tourism':
        return <TourismView />;
      case 'admin':
        return <SuperAdminView />;
      default:
        return <LandingView onExplore={(v) => setActiveView(v)} onOpenFlagship={() => setIsFlagshipOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-heritage-ivory dark:bg-heritage-charcoal-dark text-heritage-charcoal dark:text-heritage-ivory font-sans selection:bg-heritage-gold selection:text-heritage-charcoal flex flex-col transition-colors duration-200">

      {/* Top Header Navbar */}
      <Navbar
        onOpenFlagship={() => setIsFlagshipOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        activeView={activeView}
        onSelectView={(v) => handleNavClick(v)}
      />

      {/* Prominent Heritage Tagline Banner (Replaces previous button strip) */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-heritage-maroon-dark via-heritage-maroon to-heritage-maroon-dark border-b border-heritage-gold/30 shadow-heritage py-2.5 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Tagline Content */}
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <KonarkWheelIcon size={22} className="text-heritage-gold shrink-0 animate-spin-slow hidden xs:block" />
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
              <span className="font-serif font-bold text-heritage-gold tracking-wide text-xs sm:text-sm">
                {language === 'en'
                  ? "When the City Thinks, Every Life Matters"
                  : "ଯେତେବେଳେ ସହର ଚିନ୍ତା କରେ, ପ୍ରତ୍ୟେକ ଜୀବନ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ"}
              </span>
              <span className="hidden md:inline text-heritage-gold/50">•</span>
              <span className="text-heritage-stone/90 text-xs font-sans tracking-normal">
                {language === 'en'
                  ? "The AI Nervous System for a Self-Healing City in Odisha"
                  : "ଏକ ସହର, ଏକ ବୁଦ୍ଧିମତା — ଓଡ଼ିଶା ସ୍ମାର୍ଟ ଶାସନ"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => handleNavClick('portal')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 border ${
                activeView === 'portal'
                  ? 'bg-heritage-gold text-heritage-charcoal border-heritage-gold font-semibold shadow-sm'
                  : 'bg-heritage-maroon-dark/80 text-heritage-stone border-heritage-gold/40 hover:border-heritage-gold hover:text-white'
              }`}
            >
              Unified Access Portal
            </button>
          </div>

        </div>
      </div>

      {/* Full-width Dynamic Main Workspace */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Global Interactive Modals */}
      <FlagshipRunnerModal
        isOpen={isFlagshipOpen}
        onClose={() => setIsFlagshipOpen(false)}
      />

      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        onSelectView={(v) => setActiveView(v)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-heritage-maroon text-white border border-heritage-gold shadow-heritage-lg text-xs font-semibold animate-slide-up">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-heritage-green shrink-0" />
          ) : toast.type === 'error' || toast.type === 'alert' ? (
            <AlertTriangle className="w-4 h-4 text-heritage-orange shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-heritage-gold shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Global Heritage Footer */}
      <footer className="border-t border-heritage-stone dark:border-heritage-charcoal py-5 px-4 bg-heritage-ivory/80 dark:bg-heritage-charcoal-dark/80 text-center text-xs text-heritage-aged transition-all duration-300">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
          <KonarkWheelIcon size={24} className="text-heritage-gold opacity-80" />
          <p className="font-serif font-bold text-heritage-maroon dark:text-heritage-gold">
            CIVIC NEXUS AI — The AI Nervous System for a Self-Healing City
          </p>
          <p className="text-[11px] max-w-xl text-heritage-aged">
            Rooted in Odisha's spirit of community. Powered by artificial intelligence. Built for safer, smarter cities.
          </p>
          <p className="text-[10px] text-heritage-aged/70 font-mono">
            Developed by Team CODE BLAZE • Operational Demonstration Mode Active
          </p>
        </div>
      </footer>

    </div>
  );
};
