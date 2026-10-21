import React, { useEffect } from 'react';

interface GoogleAdSlotProps {
  placement?: 'banner' | 'compact';
  className?: string;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  placement = 'banner',
  className = ''
}) => {
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [publisherId]);

  const renderBanner = () => (
    <div
      className={`text-center p-6 sm:p-8 bg-slate-50/50 border border-slate-200 rounded-2xl ${className}`}
    >
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={publisherId} />
    </div>
  );

  const renderCompact = () => (
    <div
      className={`text-center p-3 sm:p-4 bg-slate-50/50 border border-slate-200 rounded-xl ${className}`}
    >
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={publisherId} />
    </div>
  );

  return placement === 'banner' ? renderBanner() : renderCompact();
};
