import React from 'react';

type TanshuPreviewWatermarkProps = {
  /** Set true only after the server has confirmed an active membership entitlement. */
  isUnlocked?: boolean;
};

/**
 * Screenshot deterrent for unpaid previews.
 * This is intentionally a visual layer only; paid actions and file generation
 * must still be protected by the membership entitlement checks.
 */
export const TanshuPreviewWatermark: React.FC<TanshuPreviewWatermarkProps> = ({ isUnlocked = false }) => {
  if (isUnlocked) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 grid select-none grid-cols-3 grid-rows-4 place-items-center gap-3 overflow-hidden"
      data-testid="tanshu-preview-watermark"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className="whitespace-nowrap rounded-md border border-slate-900/15 bg-white/10 px-2 py-1 text-[clamp(9px,1.15vw,15px)] font-black tracking-[0.12em] text-slate-900/35 shadow-sm"
          style={{
            transform: `rotate(-27deg) translateY(${index % 2 === 0 ? '5px' : '-5px'})`,
            WebkitTextStroke: '0.35px rgba(255,255,255,0.65)',
          }}
        >
          TANSHU ONLINE
        </span>
      ))}
    </div>
  );
};
