import React from 'react';

/**
 * Dedicated route wrapper for the original Advanced Passport Photo Studio.
 * The editor's photo-processing and export logic remains shared and unchanged;
 * this wrapper gives phone screens a vertically scrolling workspace.
 */
export const LegacyMobileEditionFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="legacy-mobile-edition min-h-screen bg-slate-100 p-2 sm:p-3">
    <style>{`
      @media (max-width: 767px) {
        .legacy-mobile-edition > .legacy-mobile-workspace { min-height: calc(100dvh - 16px); }
        .legacy-mobile-edition .flex.h-full.min-h-0.flex-col.gap-1\\.5 { height: auto !important; min-height: calc(100dvh - 16px) !important; }
        .legacy-mobile-edition .grid.min-h-0.flex-1 { display: flex !important; flex-direction: column !important; overflow: visible !important; }
        .legacy-mobile-edition section { max-height: none !important; overflow: visible !important; }
      }
    `}</style>
    <div className="legacy-mobile-workspace mx-auto w-full max-w-5xl rounded-2xl bg-white p-2 shadow-sm sm:p-4">{children}</div>
  </div>
);
