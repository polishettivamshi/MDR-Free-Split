/**
 * Canonical site configuration.
 *
 * Single source of truth for the public URL that is injected into
 * `index.html` (canonical link, Open Graph, JSON-LD), `robots.txt` and
 * `sitemap.xml` at build time.
 *
 * This project deliberately does NOT use environment variables: the value is
 * hardcoded so the deployed build always matches the live domain. Update
 * `SITE_URL` here when the domain changes and rebuild.
 */
export const SITE_NAME = 'MDR Free Split';

export const SITE_URL = 'https://mdr-free-split.vercel.app';

/**
 * Canonical URL without a trailing slash.
 */
export const resolveSiteUrl = (): string => SITE_URL.trim().replace(/\/+$/, '');
