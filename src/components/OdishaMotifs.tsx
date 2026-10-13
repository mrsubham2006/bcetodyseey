import React from 'react';

export const KonarkWheelIcon: React.FC<{ className?: string; size?: number }> = ({ className = "text-heritage-gold", size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer Temple Chariot Wheel Rim */}
    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="3" />
    {/* Central Axis Hub */}
    <circle cx="50" cy="50" r="9" fill="currentColor" />
    <circle cx="50" cy="50" r="4" fill="#FAF7F0" />
    {/* 8 Primary Major Spokes */}
    <path d="M50 4 L50 96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M4 50 L96 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17.5 17.5 L82.5 82.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17.5 82.5 L82.5 17.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* 8 Intermediate Minor Spokes */}
    <path d="M26 8 L74 92" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M8 26 L92 74" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M8 74 L92 26" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M26 92 L74 8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

export const IkatPatternDivider: React.FC<{ className?: string }> = ({ className = "my-4" }) => (
  <div className={`w-full flex items-center justify-center space-x-1.5 opacity-80 ${className}`}>
    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-heritage-gold to-heritage-maroon" />
    <div className="flex items-center space-x-1 text-heritage-gold">
      <span className="w-1.5 h-1.5 rotate-45 bg-heritage-maroon inline-block" />
      <span className="w-2.5 h-2.5 rotate-45 bg-heritage-gold inline-block border border-heritage-maroon" />
      <span className="w-1.5 h-1.5 rotate-45 bg-heritage-maroon inline-block" />
    </div>
    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-heritage-gold to-heritage-maroon" />
  </div>
);

export const TempleSilhouetteIcon: React.FC<{ className?: string; size?: number }> = ({ className = "text-heritage-maroon", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Kalasa and Amalaka Finial */}
    <circle cx="32" cy="6" r="3" />
    <path d="M28 9 H36 V12 H28 Z" />
    <ellipse cx="32" cy="14" rx="7" ry="2.5" />
    {/* Rekha Deula curvilinear shikhara tower */}
    <path d="M25 16 C27 24 23 38 20 46 H44 C41 38 37 24 39 16 Z" />
    {/* Jagamohana porch base */}
    <path d="M14 46 L20 46 L22 36 L42 36 L44 46 L50 46 L52 58 H12 Z" />
    <rect x="8" y="58" width="48" height="4" rx="1" />
  </svg>
);
