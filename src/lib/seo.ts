import { useEffect } from 'react';

const SITE_URL = 'https://mdr-free-split.vercel.app';

const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  updatedAt?: string;
}

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path === '/' ? '/' : path}`;

const upsertMeta = (
  attribute: 'name' | 'property',
  key: string,
  content: string
): void => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const upsertCanonical = (href: string): void => {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

/**
 * Keep the document head in sync with the current page. The site uses real
 * URLs with full page loads, so this runs once per page and gives each article
 * its own title, description and canonical URL.
 */
export const usePageMeta = ({
  title,
  description,
  path,
  noindex = false,
  type = 'website',
  updatedAt
}: PageMeta): void => {
  useEffect(() => {
    const canonical = absoluteUrl(path);
    const robots = noindex ? 'noindex, nofollow' : DEFAULT_ROBOTS;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('name', 'bingbot', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:site_name', 'MDR Free Split');
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    if (updatedAt) {
      upsertMeta('property', 'article:modified_time', updatedAt);
    }

    upsertCanonical(canonical);
  }, [title, description, path, noindex, type, updatedAt]);
};

/**
 * Add page-specific JSON-LD without disturbing the static site-level schema
 * in index.html. The script is removed when the page unmounts (for example in
 * React StrictMode's development re-mount).
 */
export const useJsonLd = (id: string, data: Record<string, unknown>): void => {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    document.getElementById(id)?.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [id, serialized]);
};
