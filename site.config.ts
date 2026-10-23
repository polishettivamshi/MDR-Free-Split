/**
 * Canonical site configuration.
 *
 * Single source of truth for the public URL used by the app, generated
 * route-level metadata and the post-build SEO script.
 *
 * When the domain changes, update `SITE_URL` here and in the static
 * `index.html`, `public/robots.txt` and `public/sitemap.xml` files, then
 * rebuild. Those static files intentionally contain the production URL so no
 * unresolved placeholder can ever reach a crawler.
 */
export const SITE_NAME = 'MDR Free Split';

export const SITE_URL = 'https://mdr-free-split.vercel.app';

export const SITE_DESCRIPTION =
  'Free UPI MDR calculator and split payment planner. Scan a merchant QR, split a bill into installments, estimate the ₹2,000 threshold and open your own UPI app.';

export const SITE_KEYWORDS = [
  'MDR calculator',
  'UPI split',
  'MDR split',
  'UPI MDR calculator',
  'UPI split payment',
  'split UPI payment',
  'UPI installment calculator',
  'merchant QR code split',
  'UPI payment splitter',
  '0% MDR UPI',
  'UPI MDR 2026',
  'PhonePe split payment',
  'Google Pay split payment',
  'Paytm split payment',
  'BHIM UPI calculator',
  'MDR Free Split',
];

export const DEFAULT_OG_IMAGE = '/og-image.png';
export const SITE_LOGO = '/logo.png';
export const APPLE_TOUCH_ICON = '/apple-touch-icon.png';

/**
 * Canonical URL without a trailing slash.
 */
export const resolveSiteUrl = (): string => SITE_URL.trim().replace(/\/+$/, '');
