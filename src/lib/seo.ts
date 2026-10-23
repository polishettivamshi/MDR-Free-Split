import { useEffect } from 'react';
import {
  DEFAULT_OG_IMAGE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from '../../site.config';

const SITE_ORIGIN = SITE_URL.trim().replace(/\/+$/, '');
const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
const DEFAULT_AUTHOR = 'Vamshi Polishetti';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  canonical?: boolean;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
  section?: string;
  author?: string;
}

export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
};

const resolvedImage = (image?: string): string =>
  image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE);

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
 * Keep the document head in sync with the current page. The static route files
 * generated after `vite build` already contain the same tags for social
 * crawlers; this hook keeps the head correct after client-side rendering too.
 */
export const usePageMeta = ({
  title,
  description,
  path,
  noindex = false,
  canonical = true,
  type = 'website',
  image,
  imageAlt,
  keywords,
  publishedAt,
  updatedAt,
  section,
  author = DEFAULT_AUTHOR,
}: PageMeta): void => {
  const keywordList = (keywords && keywords.length > 0 ? keywords : SITE_KEYWORDS).join(', ');

  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    const robots = noindex ? 'noindex, nofollow' : DEFAULT_ROBOTS;
    const ogImage = resolvedImage(image);
    const ogImageAlt = imageAlt || `${SITE_NAME} — ${title}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywordList);
    upsertMeta('name', 'author', author);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('name', 'bingbot', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:image:type', 'image/png');
    upsertMeta('property', 'og:image:alt', ogImageAlt);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', ogImageAlt);

    if (type === 'article') {
      if (publishedAt) {
        upsertMeta('property', 'article:published_time', publishedAt);
      }
      if (updatedAt) {
        upsertMeta('property', 'article:modified_time', updatedAt);
      }
      upsertMeta('property', 'article:author', author);
      if (section) upsertMeta('property', 'article:section', section);
    }

    if (canonical) {
      upsertCanonical(canonicalUrl);
    } else {
      document.head.querySelector('link[rel="canonical"]')?.remove();
    }
  }, [
    title,
    description,
    path,
    noindex,
    canonical,
    type,
    image,
    imageAlt,
    keywordList,
    publishedAt,
    updatedAt,
    section,
    author,
  ]);
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
