/**
 * Canonical site configuration.
 *
 * Single source of truth for the public URL that is injected into
 * `index.html` (canonical link, Open Graph, JSON-LD), `robots.txt` and
 * `sitemap.xml` at build time.
 *
 * Override with the `VITE_SITE_URL` environment variable (for example in
 * Vercel → Project Settings → Environment Variables) once a custom domain
 * is live. The value is always normalised without a trailing slash.
 */
export const SITE_NAME = 'MDR Free Split';

export const DEFAULT_SITE_URL = 'https://mdr-free-split.vercel.app';

export const resolveSiteUrl = (
  env: Record<string, string | undefined> = process.env
): string => {
  const raw = env.VITE_SITE_URL || env.SITE_URL || DEFAULT_SITE_URL;
  return raw.trim().replace(/\/+$/, '');
};
