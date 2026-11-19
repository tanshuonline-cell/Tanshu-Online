import React, { useEffect, useState } from 'react';
import { TANSHU_PROFILE_PHOTO } from '../Header';

/** Small, deliberately downsampled DP overlay for print-sheet previews. */
export const CspDpWatermark: React.FC = () => {
  const [watermarkUrl, setWatermarkUrl] = useState('');
  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const context = canvas.getContext('2d');
      if (!context) return;
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - side) / 2;
      const sourceY = (image.naturalHeight - side) / 2;
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, 160, 160);
      setWatermarkUrl(canvas.toDataURL('image/jpeg', 0.38));
    };
    image.onerror = () => { if (active) setWatermarkUrl(''); };
    image.src = TANSHU_PROFILE_PHOTO;
    return () => { active = false; image.onload = null; image.onerror = null; };
  }, []);
  if (!watermarkUrl) return null;
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden">
    <img src={watermarkUrl} alt="" draggable={false} className="aspect-square w-[32%] max-w-[180px] rounded-full object-cover opacity-[0.16] grayscale blur-[0.35px]" />
  </div>;
};
