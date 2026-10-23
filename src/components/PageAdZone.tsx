import React, { useEffect, useRef } from 'react';
import {
  ADSENSE_PAGE_FLAGS,
  loadAdsenseScript,
  pushAdRequest,
  resolveAdsenseClient,
  resolveSlotId,
  type AdsensePageKey,
  type AdsenseSlotKey,
} from '../lib/adsense';

interface PageAdZoneProps {
  /** The page-level switch that must be enabled before this unit can load. */
  page: AdsensePageKey;
  /** The matching ad unit slot key in ADSENSE_SLOTS. */
  slot: AdsenseSlotKey;
  placement?: 'banner' | 'compact';
  className?: string;
}

/**
 * A controlled, content-adjacent ad unit for the homepage, calculator and plan
 * screens.
 *
 * It stays completely invisible while its page flag is off or until a real ad
 * unit slot ID is configured. That lets the layout and content be prepared
 * during the AdSense review without requesting an ad on a tool screen.
 */
export const PageAdZone: React.FC<PageAdZoneProps> = ({
  page,
  slot,
  placement = 'banner',
  className = '',
}) => {
  const publisherId = resolveAdsenseClient();
  const slotId = resolveSlotId(slot);
  const insRef = useRef<HTMLModElement | null>(null);

  const isEnabled =
    ADSENSE_PAGE_FLAGS[page] && publisherId.length > 0 && slotId.length > 0;

  useEffect(() => {
    if (!isEnabled) return;

    let cancelled = false;

    loadAdsenseScript(publisherId)
      .then(() => {
        if (!cancelled) pushAdRequest(insRef.current);
      })
      .catch(() => {
        // Ad blockers and offline preview should not break the page.
      });

    return () => {
      cancelled = true;
    };
  }, [isEnabled, publisherId, slotId]);

  if (!isEnabled) return null;

  const padding = placement === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-6';
  const radius = placement === 'compact' ? 'rounded-xl' : 'rounded-2xl';

  return (
    <aside
      className={`bg-lilac/50 border border-line ${radius} ${padding} ${className}`}
      aria-label="Advertisement"
    >
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-soft">
        Advertisement
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
};
