import React from 'react';
import { useCitizen } from '../context/CitizenContext';
import { CitizenAuthView } from '../views/CitizenAuthView';
import { X } from 'lucide-react';

export const CitizenAuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, authMode } = useCitizen();

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-heritage-charcoal-dark/80 backdrop-blur-sm transition-opacity"
        onClick={() => setShowAuthModal(false)}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl my-auto animate-fade-in">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <CitizenAuthView
          initialTab={authMode === 'register' ? 'register' : 'login'}
          onAuthenticated={() => {
            setShowAuthModal(false);
          }}
        />
      </div>
    </div>
  );
};
