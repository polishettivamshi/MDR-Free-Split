import React, { useEffect, useRef } from 'react';
import {
  loadAdsenseScript,
  pushAdRequest,
  resolveAdsenseClient,
  resolveSlotId,
  type AdsenseSlotKey,
} from '../lib/adsense';

interface GoogleAdSlotProps {
  placement?: 'banner' | 'compact';
  /** Ad unit slot to pin this placement to. Defaults to Auto ads. */
  slot?: AdsenseSlotKey;
  className?: string;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  placement = 'banner',
  slot,
  className = ''
}) => {
  // Always resolve a real publisher ID — the env var may be absent in the
  // deployed build, and a missing ID would request `client=undefined`.
  const publisherId = resolveAdsenseClient();
  const slotId = slot ? resolveSlotId(slot) : '';
  const insRef = useRef<HTMLModElement | null>(null);
  const isEnabled = publisherId.length > 0;

  useEffect(() => {
    if (!isEnabled) return;

    let cancelled = false;

    loadAdsenseScript(publisherId)
      .then(() => {
        if (!cancelled) pushAdRequest(insRef.current);
      })
      .catch((error) => {
        console.error('AdSense loader error', error);
      });

    return () => {
      cancelled = true;
    };
  }, [publisherId, isEnabled]);

  const adSlot = (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={publisherId}
      data-ad-slot={slotId || undefined}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );

  const renderBanner = () => (
    <div
      className={`text-center p-6 sm:p-8 bg-lilac/50 border border-line rounded-2xl ${className}`}
    >
      {isEnabled ? adSlot : <p className="text-xs text-muted-soft">Advertisement</p>}
    </div>
  );

  const renderCompact = () => (
    <div
      className={`text-center p-3 sm:p-4 bg-lilac/50 border border-line rounded-xl ${className}`}
    >
      {isEnabled ? adSlot : <p className="text-xs text-muted-soft">Advertisement</p>}
    </div>
  );

  if (!isEnabled) return null;

  return placement === 'banner' ? renderBanner() : renderCompact();
};
