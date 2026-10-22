/**
 * Google AdSense configuration.
 *
 * The publisher ID is a PUBLIC identifier — it is embedded in every ad tag
 * served to visitors, so hardcoding it is safe. We still prefer
 * VITE_ADSENSE_PUBLISHER_ID so the ID can be changed without a code deploy
 * (set it in Vercel → Project Settings → Environment Variables).
 *
 * The hardcoded fallback matters because `.env` is git-ignored: without it the
 * ad script would request `client=undefined` on the deployed build.
 */
export const ADSENSE_CLIENT = 'ca-pub-6633100438556373';

/**
 * AdSense publisher IDs look like `ca-pub-` followed by 16 digits.
 * Anything else means the value is missing or misconfigured.
 */
const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d{16}$/;

export const isValidAdsenseClient = (value: unknown): value is string =>
  typeof value === 'string' && ADSENSE_CLIENT_PATTERN.test(value.trim());

/**
 * Resolve the active AdSense publisher ID.
 * Falls back to the hardcoded public ID when the env var is unavailable.
 * Returns an empty string when no valid publisher ID can be determined.
 */
export const resolveAdsenseClient = (): string => {
  const fromEnv = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  if (isValidAdsenseClient(fromEnv)) return fromEnv.trim();
  if (isValidAdsenseClient(ADSENSE_CLIENT)) return ADSENSE_CLIENT;
  return '';
};

/**
 * Optional ad unit slot IDs.
 *
 * Leave a slot empty to serve the slot through AdSense Auto ads, which is the
 * default and works as soon as the site is approved. To pin a slot to a
 * specific ad unit, create the unit in AdSense (Ad units → New ad unit) and
 * paste its slot ID here.
 */
export const ADSENSE_SLOTS = {
  createSplit: '',
  paymentPlan: '',
} as const;

export type AdsenseSlotKey = keyof typeof ADSENSE_SLOTS;

/**
 * Resolve the ad unit slot ID for a given placement.
 * Returns an empty string when Auto ads should be used instead.
 */
export const resolveSlotId = (key: AdsenseSlotKey): string => ADSENSE_SLOTS[key] ?? '';

declare global {
  interface Window {
    adsbygoogle?: Array<unknown> & { loaded?: boolean };
  }
}

const ADSENSE_SCRIPT_SELECTOR =
  'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

const ADSENSE_LOAD_TIMEOUT_MS = 10000;

let loaderPromise: Promise<void> | null = null;

/**
 * Load the AdSense loader script exactly once per page.
 *
 * The loader must not be removed on unmount: once it has run it owns the
 * `window.adsbygoogle` queue, and tearing the script down breaks any ad
 * unit that is still on the page.
 */
export const loadAdsenseScript = (client: string): Promise<void> => {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    const succeed = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    // Never leave the caller hanging if the loader never reports back.
    const timeout = setTimeout(() => fail('AdSense script timed out'), ADSENSE_LOAD_TIMEOUT_MS);

    const existing = document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);

    if (existing) {
      if (existing.dataset.adSenseLoaded === 'true') {
        clearTimeout(timeout);
        succeed();
        return;
      }
      existing.addEventListener('load', () => {
        clearTimeout(timeout);
        succeed();
      });
      existing.addEventListener('error', () => {
        clearTimeout(timeout);
        fail('AdSense script failed to load');
      });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.addEventListener('load', () => {
      script.dataset.adSenseLoaded = 'true';
      clearTimeout(timeout);
      succeed();
    });
    script.addEventListener('error', () => {
      clearTimeout(timeout);
      fail('AdSense script failed to load');
    });
    document.head.appendChild(script);
  });

  return loaderPromise;
};

// Guards against pushing the same <ins> twice (React StrictMode double-invokes
// effects in development, which would otherwise make the loader throw
// "'element' has already been filled").
const pushedElements = new WeakSet<Element>();

/**
 * Request an ad for a specific <ins> element.
 *
 * The loader accepts `push({ element })`, which targets the given element
 * instead of relying on document order.
 */
export const pushAdRequest = (element: Element | null): void => {
  if (!element) return;
  if (pushedElements.has(element)) return;
  pushedElements.add(element);

  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({ element });
  } catch (error) {
    console.error('AdSense push failed', error);
  }
};
