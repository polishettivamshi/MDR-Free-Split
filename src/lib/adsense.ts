/**
 * Google AdSense configuration.
 *
 * This project deliberately does NOT use environment variables: the publisher
 * ID is a PUBLIC identifier that is embedded in every ad tag served to
 * visitors, so it is safe to hardcode. Update `ADSENSE_CLIENT` here when the
 * account changes, then rebuild.
 *
 * The loader is injected only on editorial routes by App.tsx. Calculator,
 * plan, home and legal screens intentionally do not load it.
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
 * Returns an empty string when no valid publisher ID can be determined.
 */
export const resolveAdsenseClient = (): string =>
  isValidAdsenseClient(ADSENSE_CLIENT) ? ADSENSE_CLIENT.trim() : '';

/**
 * Optional ad unit slot IDs.
 *
 * Leave a slot empty to serve the placement through AdSense Auto ads, which is
 * the default and works as soon as the site is approved. To pin a slot to a
 * specific ad unit, create the unit in AdSense (Ad units → New ad unit) and
 * paste its slot ID here.
 */
export const ADSENSE_SLOTS = {
  guides: '',
} as const;

export type AdsenseSlotKey = keyof typeof ADSENSE_SLOTS;

/**
 * Resolve the ad unit slot ID for a given placement.
 * Returns an empty string when Auto ads should be used instead.
 */
export const resolveSlotId = (key: AdsenseSlotKey): string => ADSENSE_SLOTS[key] ?? '';

/**
 * Shape of the global `adsbygoogle` object.
 *
 * Before the loader boots, `window.adsbygoogle` is a plain array used as a
 * queue. Once Google's loader has executed it replaces that array with an
 * object exposing `push()` and `loaded: true`.
 */
interface AdsenseGlobal {
  loaded?: boolean;
  push: (payload: unknown) => void;
}

declare global {
  interface Window {
    adsbygoogle?: AdsenseGlobal;
  }
}

const ADSENSE_SCRIPT_SELECTOR =
  'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

const ADSENSE_LOAD_TIMEOUT_MS = 10000;
const ADSENSE_POLL_INTERVAL_MS = 100;

/**
 * The loader may already exist if another editorial component mounted first.
 * In that case the `load` event has already fired and can no longer be
 * observed — the only reliable signal is the loader having replaced
 * `window.adsbygoogle` with its own object.
 */
const isAdsenseLoaderReady = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.adsbygoogle &&
  window.adsbygoogle.loaded === true;

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
    let pollId: ReturnType<typeof setInterval> | undefined;

    const succeed = () => {
      if (settled) return;
      settled = true;
      if (pollId !== undefined) clearInterval(pollId);
      clearTimeout(timeout);
      resolve();
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      if (pollId !== undefined) clearInterval(pollId);
      clearTimeout(timeout);
      reject(new Error(message));
    };

    // Never leave the caller hanging if the loader never reports back.
    const timeout = setTimeout(() => fail('AdSense script timed out'), ADSENSE_LOAD_TIMEOUT_MS);

    // Poll for the loader to announce itself (covers the "already loaded" case).
    pollId = setInterval(() => {
      if (isAdsenseLoaderReady()) succeed();
    }, ADSENSE_POLL_INTERVAL_MS);

    const existing = document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);

    if (existing) {
      existing.addEventListener('load', () => succeed());
      existing.addEventListener('error', () => fail('AdSense script failed to load'));
      if (isAdsenseLoaderReady()) succeed();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.addEventListener('load', () => succeed());
    script.addEventListener('error', () => fail('AdSense script failed to load'));
    document.head.appendChild(script);
  });

  return loaderPromise;
};

// Guards against pushing the same <ins> twice. React StrictMode double-invokes
// effects in development, and the loader throws "'element' has already been
// filled." when the same element is requested more than once.
const pushedElements = new WeakSet<Element>();

/**
 * Request an ad for a specific <ins> element.
 *
 * `push({ element })` targets the given element explicitly instead of relying
 * on document order. The loader reads `data-ad-client`, `data-ad-slot`,
 * `data-ad-format` and `data-full-width-responsive` straight off the element,
 * so `data-ad-client` must be present or the loader throws
 * "Ad client is missing from the slot.".
 */
export const pushAdRequest = (element: Element | null): void => {
  if (!element) return;
  if (pushedElements.has(element)) return;

  const adsense = window.adsbygoogle;
  if (!adsense || typeof adsense.push !== 'function') {
    console.warn('[AdSense] loader is not ready — ad request skipped');
    return;
  }

  try {
    adsense.push({ element });
    pushedElements.add(element);
  } catch (error) {
    console.error('[AdSense] push failed', error);
  }
};
