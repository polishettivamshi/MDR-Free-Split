import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GUIDES } from '../src/content/guides';
import { HOME_FAQS, type HomeFaq } from '../src/content/homeFaqs';
import { LEGAL_DOCS } from '../src/content/legal';
import type { ContentBlock, Guide, GuideFaq } from '../src/content/types';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOGO,
  SITE_NAME,
  SITE_URL,
} from '../site.config';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  throw new Error('dist/index.html is missing. Run `vite build` before the SEO step.');
}

const template = fs.readFileSync(templatePath, 'utf8');
const site = SITE_URL.trim().replace(/\/+$/, '');
const ogImage = absoluteUrl(DEFAULT_OG_IMAGE);
const authorName = 'Vamshi Polishetti';
const defaultLastmod = '2026-10-23';

const siteRef = { '@id': `${site}/#website` };
const organizationRef = { '@id': `${site}/#organization` };

function absoluteUrl(routePath: string): string {
  if (/^https?:\/\//i.test(routePath)) return routePath;
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${site}${normalized}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertMeta(
  html: string,
  attribute: 'name' | 'property',
  key: string,
  content: string
): string {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(
    `<meta\\s+[^>]*?\\b${attribute}="${escapeRegExp(key)}"[^>]*>`,
    'i'
  );

  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertCanonical(html: string, href: string): string {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  const pattern = /<link\s+[^>]*rel="canonical"[^>]*>/i;

  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function removeCanonical(html: string): string {
  return html.replace(/\s*<link\s+[^>]*rel="canonical"[^>]*>/i, '');
}

function removeScriptById(html: string, id: string): string {
  const pattern = new RegExp(
    `\\s*<script\\b[^>]*\\bid="${escapeRegExp(id)}"[^>]*>[\\s\\S]*?<\\/script>`,
    'i'
  );
  return html.replace(pattern, '');
}

function injectJsonLd(html: string, id: string, data: Record<string, unknown>): string {
  const serialized = JSON.stringify(data).replaceAll('<', '\\u003c');
  return html.replace(
    '</head>',
    `    <script type="application/ld+json" id="${id}">${serialized}</script>\n  </head>`
  );
}

function faqPage(faqs: Array<GuideFaq | HomeFaq>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

function breadcrumbSchema(items: Array<{ name: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        ...(item.path ? { item: absoluteUrl(item.path) } : {}),
      })),
    ],
  };
}

function webPageSchema(route: RouteDefinition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.title,
    description: route.description,
    url: absoluteUrl(route.path),
    inLanguage: 'en-IN',
    isPartOf: siteRef,
    ...(route.updatedAt ? { dateModified: route.updatedAt } : {}),
    about: {
      '@type': 'Thing',
      name: 'UPI MDR, split payments and merchant QR safety',
    },
  };
}

function collectionPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'UPI MDR & Split Payment Guides',
    description:
      'Source-linked guides to UPI MDR, split payments, merchant QR safety and UPI payment safety in India.',
    url: absoluteUrl('/guides'),
    inLanguage: 'en-IN',
    isPartOf: siteRef,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: GUIDES.length,
      itemListElement: GUIDES.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guide.title,
        url: absoluteUrl(`/guides/${guide.slug}`),
      })),
    },
  };
}

function guideWordCount(guide: Guide): number {
  const text = guide.blocks
    .map((block) => {
      if (block.type === 'p' || block.type === 'h2' || block.type === 'h3') {
        return block.text;
      }
      if (block.type === 'ul' || block.type === 'ol') return block.items.join(' ');
      if (block.type === 'callout') return `${block.title} ${block.text}`;
      if (block.type === 'table') {
        return [block.caption ?? '', ...block.headers, ...block.rows.flat()].join(' ');
      }
      return '';
    })
    .join(' ');

  return text.split(/\s+/).filter(Boolean).length;
}

function articleSchema(guide: Guide) {
  const articlePath = `/guides/${guide.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: absoluteUrl(articlePath),
    image: [ogImage],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: 'en-IN',
    articleSection: guide.category,
    keywords: [
      guide.category,
      'UPI MDR',
      'UPI split payment',
      'merchant UPI QR',
      'UPI MDR 2026',
    ].join(', '),
    wordCount: guideWordCount(guide),
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(articlePath),
    },
    isPartOf: siteRef,
    about: {
      '@type': 'Thing',
      name: 'UPI MDR and split payments',
    },
    author: {
      '@type': 'Person',
      name: authorName,
      url: absoluteUrl('/about'),
      sameAs: ['https://www.linkedin.com/in/polishettivamshi/'],
    },
    publisher: {
      '@type': 'Organization',
      '@id': organizationRef['@id'],
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(SITE_LOGO),
        width: 512,
        height: 512,
      },
    },
  };
}

interface SchemaScript {
  id: string;
  data: Record<string, unknown>;
}

interface SitemapEntry {
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

interface RouteDefinition {
  path: string;
  output: string;
  title: string;
  description: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: boolean;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  publishedAt?: string;
  updatedAt?: string;
  section?: string;
  isHome?: boolean;
  pageSchema?: boolean;
  schemas?: SchemaScript[];
  sitemap?: SitemapEntry;
}

const staticRoutes: RouteDefinition[] = [
  {
    path: '/',
    output: 'index.html',
    title: 'UPI MDR Calculator & Split Payment Planner | MDR Free Split',
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    isHome: true,
    schemas: [{ id: 'homepage-faq-schema', data: faqPage(HOME_FAQS) }],
    sitemap: { changefreq: 'weekly', priority: '1.0' },
  },
  {
    path: '/guides',
    output: 'guides.html',
    title: 'UPI MDR & Split Payment Guides (2026) — MDR Free Split',
    description:
      'Source-linked guides to UPI MDR, the ₹2,000 threshold, merchant QR safety, split payment planning and UPI safety in India. Written for payers and small merchants.',
    keywords: [
      'UPI MDR guide',
      'UPI split payment guide',
      'UPI MDR 2026',
      'merchant QR code safety',
      'UPI payment safety',
      'how to split a UPI payment',
    ],
    schemas: [
      { id: 'guides-collection-schema', data: collectionPageSchema() },
      {
        id: 'breadcrumb-schema',
        data: breadcrumbSchema([{ name: 'Guides' }]),
      },
    ],
    sitemap: { changefreq: 'weekly', priority: '0.9' },
  },
  {
    path: '/about',
    output: 'about.html',
    title: 'About MDR Free Split — Independent UPI MDR Calculator',
    description:
      'Learn who builds MDR Free Split, what the UPI split calculator does and does not do, how the guides are researched, and how to request a correction.',
    keywords: [
      'about MDR Free Split',
      'independent UPI calculator',
      'UPI MDR calculator India',
      'Vamshi Polishetti',
      'UPI split planner',
    ],
    updatedAt: defaultLastmod,
    pageSchema: true,
    schemas: [
      {
        id: 'breadcrumb-schema',
        data: breadcrumbSchema([{ name: 'About' }]),
      },
    ],
    sitemap: { changefreq: 'monthly', priority: '0.5' },
  },
  {
    path: '/contact',
    output: 'contact.html',
    title: 'Contact MDR Free Split — Corrections & Support',
    description:
      'Contact MDR Free Split about calculator feedback, guide corrections, privacy requests or a broken link. Never send a UPI PIN, OTP or bank credentials.',
    keywords: [
      'contact MDR Free Split',
      'UPI calculator support',
      'UPI guide correction',
      'privacy request',
      'Vamshi Polishetti contact',
    ],
    updatedAt: defaultLastmod,
    pageSchema: true,
    schemas: [
      {
        id: 'breadcrumb-schema',
        data: breadcrumbSchema([{ name: 'Contact' }]),
      },
    ],
    sitemap: { changefreq: 'monthly', priority: '0.5' },
  },
  {
    path: '/split',
    output: 'split.html',
    title: 'Create a UPI Split Plan — MDR Free Split',
    description:
      'Create a local UPI split plan for a merchant QR payment. Choose installments, review the estimate and open each payment in your own UPI app.',
    keywords: [
      'create UPI split plan',
      'UPI payment splitter',
      'merchant QR split',
      'UPI installment calculator',
    ],
    noindex: true,
    canonical: true,
  },
  {
    path: '/plan',
    output: 'plan.html',
    title: 'Split Plan — MDR Free Split',
    description:
      'A locally saved UPI split plan. Open each installment in your own UPI app; this page does not collect or verify payments.',
    keywords: ['UPI split plan', 'saved UPI plan', 'MDR Free Split'],
    noindex: true,
    canonical: false,
  },
];

const legalRoutes: RouteDefinition[] = LEGAL_DOCS.map((doc) => ({
  path: doc.path,
  output: `${doc.path.slice(1)}.html`,
  title: doc.metaTitle,
  description: doc.description,
  keywords: [doc.title, 'MDR Free Split', 'UPI calculator', 'UPI guides'],
  updatedAt: doc.updatedAt,
  pageSchema: true,
  schemas: [
    {
      id: 'breadcrumb-schema',
      data: breadcrumbSchema([{ name: doc.title }]),
    },
  ],
  sitemap: { changefreq: 'yearly', priority: '0.3' },
}));

const guideRoutes: RouteDefinition[] = GUIDES.map((guide) => {
  const articlePath = `/guides/${guide.slug}`;

  return {
    path: articlePath,
    output: `guides/${guide.slug}.html`,
    title: guide.metaTitle,
    description: guide.description,
    keywords: [
      guide.category,
      guide.title,
      'UPI MDR 2026',
      'UPI split payment',
      'merchant UPI QR',
    ],
    type: 'article',
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    section: guide.category,
    schemas: [
      { id: 'guide-article-schema', data: articleSchema(guide) },
      { id: 'guide-faq-schema', data: faqPage(guide.faqs) },
      {
        id: 'breadcrumb-schema',
        data: breadcrumbSchema([
          { name: 'Guides', path: '/guides' },
          { name: guide.title },
        ]),
      },
    ],
    sitemap: { changefreq: 'monthly', priority: '0.8' },
  };
});

// Build page schemas after the route objects exist, so each WebPage uses its
// own title, description and URL.
for (const route of [...staticRoutes, ...legalRoutes, ...guideRoutes]) {
  if (route.pageSchema) {
    route.schemas = [
      ...(route.schemas ?? []),
      { id: 'page-schema', data: webPageSchema(route) },
    ];
  }
}

const routes = [...staticRoutes, ...legalRoutes, ...guideRoutes];

function applyMeta(html: string, route: RouteDefinition): string {
  let output = html;
  const canonical = absoluteUrl(route.path);
  const image = route.image ? absoluteUrl(route.image) : ogImage;
  const imageAlt = route.imageAlt ?? `${SITE_NAME} — ${route.title}`;
  const keywords = (route.keywords?.length ? route.keywords : SITE_KEYWORDS).join(', ');
  const robots = route.noindex ? 'noindex, nofollow' : 'index, follow';

  output = output.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(route.title)}</title>`
  );

  output = upsertMeta(output, 'name', 'description', route.description);
  output = upsertMeta(output, 'name', 'keywords', keywords);
  output = upsertMeta(output, 'name', 'author', authorName);
  output = upsertMeta(output, 'name', 'robots', route.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  output = upsertMeta(output, 'name', 'googlebot', robots);
  output = upsertMeta(output, 'name', 'bingbot', robots);

  output = upsertMeta(output, 'property', 'og:title', route.title);
  output = upsertMeta(output, 'property', 'og:description', route.description);
  output = upsertMeta(output, 'property', 'og:type', route.type ?? 'website');
  output = upsertMeta(output, 'property', 'og:url', canonical);
  output = upsertMeta(output, 'property', 'og:site_name', SITE_NAME);
  output = upsertMeta(output, 'property', 'og:locale', 'en_IN');
  output = upsertMeta(output, 'property', 'og:image', image);
  output = upsertMeta(output, 'property', 'og:image:width', '1200');
  output = upsertMeta(output, 'property', 'og:image:height', '630');
  output = upsertMeta(output, 'property', 'og:image:type', 'image/png');
  output = upsertMeta(output, 'property', 'og:image:alt', imageAlt);

  output = upsertMeta(output, 'name', 'twitter:card', 'summary_large_image');
  output = upsertMeta(output, 'name', 'twitter:title', route.title);
  output = upsertMeta(output, 'name', 'twitter:description', route.description);
  output = upsertMeta(output, 'name', 'twitter:image', image);
  output = upsertMeta(output, 'name', 'twitter:image:alt', imageAlt);

  output = output.replace(
    /\s*<meta\b[^>]*\bproperty="article:[^"]*"[^>]*>/gi,
    ''
  );

  if (route.type === 'article') {
    if (route.publishedAt) {
      output = upsertMeta(output, 'property', 'article:published_time', route.publishedAt);
    }
    if (route.updatedAt) {
      output = upsertMeta(output, 'property', 'article:modified_time', route.updatedAt);
    }
    if (route.section) {
      output = upsertMeta(output, 'property', 'article:section', route.section);
    }
    output = upsertMeta(output, 'property', 'article:author', authorName);
  }

  output = route.canonical === false ? removeCanonical(output) : upsertCanonical(output, canonical);

  return output;
}

function renderInline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
}

function renderBlocks(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'p':
          return `<p>${renderInline(block.text)}</p>`;
        case 'h2':
          return `<h2>${renderInline(block.text)}</h2>`;
        case 'h3':
          return `<h3>${renderInline(block.text)}</h3>`;
        case 'ul':
          return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
        case 'ol':
          return `<ol>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`;
        case 'callout':
          return `<aside class="fallback-callout"><strong>${renderInline(block.title)}</strong><p>${renderInline(block.text)}</p></aside>`;
        case 'table':
          return `<figure><table><thead><tr>${block.headers
            .map((header) => `<th>${renderInline(header)}</th>`)
            .join('')}</tr></thead><tbody>${block.rows
            .map(
              (row) =>
                `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`
            )
            .join('')}</tbody></table>${
            block.caption ? `<figcaption>${renderInline(block.caption)}</figcaption>` : ''
          }</figure>`;
        default:
          return '';
      }
    })
    .join('\n');
}

const fallbackStyle = `
    <style id="seo-fallback-style">
      #seo-fallback { max-width: 820px; margin: 0 auto; padding: 32px 20px 64px; color: #111439; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; line-height: 1.7; }
      #seo-fallback .fallback-brand { display: inline-block; margin-bottom: 28px; color: #111439; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; text-decoration: none; }
      #seo-fallback h1 { margin: 0 0 16px; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
      #seo-fallback h2 { margin: 32px 0 10px; font-size: 1.4rem; font-weight: 800; line-height: 1.25; }
      #seo-fallback h3 { margin: 24px 0 8px; font-size: 1.1rem; font-weight: 800; }
      #seo-fallback p, #seo-fallback li { color: #4b5563; }
      #seo-fallback a { color: #5b4bdb; }
      #seo-fallback ul, #seo-fallback ol { padding-left: 1.2rem; }
      #seo-fallback li { margin: 6px 0; }
      #seo-fallback .fallback-callout { margin: 18px 0; border-left: 3px solid #8b5cf6; border-radius: 0 12px 12px 0; background: #f5f3ff; padding: 12px 16px; }
      #seo-fallback .fallback-callout p { margin: 6px 0 0; }
      #seo-fallback table { width: 100%; margin: 14px 0; border-collapse: collapse; font-size: 0.92rem; }
      #seo-fallback th, #seo-fallback td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; vertical-align: top; }
      #seo-fallback th { background: #f8f7ff; color: #111439; }
      #seo-fallback figcaption { margin-top: 6px; color: #6b7280; font-size: 0.8rem; }
      #seo-fallback .fallback-note { color: #6b7280; font-size: 0.85rem; }
    </style>`;

function fallbackShell(content: string): string {
  return `<div id="seo-fallback"><a class="fallback-brand" href="/">MDR Free Split</a><main>${content}</main></div>`;
}

function renderFallback(route: RouteDefinition): string {
  if (route.path === '/') {
    return fallbackShell(`
      <h1>Split your UPI payment into planned installments.</h1>
      <p>${renderInline(SITE_DESCRIPTION)}</p>
      <p><a href="/split">Create a UPI split plan</a> · <a href="/guides">Browse UPI MDR guides</a></p>
      <h2>Popular UPI guides</h2>
      <ul>${GUIDES.slice(0, 3)
        .map(
          (guide) =>
            `<li><a href="/guides/${guide.slug}">${escapeHtml(guide.title)}</a> — ${escapeHtml(guide.description)}</li>`
        )
        .join('')}</ul>
    `);
  }

  if (route.path === '/guides') {
    return fallbackShell(`
      <h1>Understand UPI payments before you split.</h1>
      <p>${escapeHtml(route.description)}</p>
      <ul>${GUIDES.map(
        (guide) =>
          `<li><a href="/guides/${guide.slug}">${escapeHtml(guide.title)}</a> — ${escapeHtml(guide.description)}</li>`
      ).join('')}</ul>
    `);
  }

  const guide = GUIDES.find((item) => route.path === `/guides/${item.slug}`);
  if (guide) {
    return fallbackShell(`
      <article>
        <p><a href="/guides">← All UPI guides</a></p>
        <h1>${escapeHtml(guide.title)}</h1>
        <p>${renderInline(guide.description)}</p>
        <p class="fallback-note">Updated ${escapeHtml(guide.updatedAt)} · ${guide.readingMinutes} min read</p>
        <h2>Key takeaways</h2>
        <ul>${guide.takeaways.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>
        ${renderBlocks(guide.blocks)}
        <h2>Sources</h2>
        <ul>${guide.sources
          .map(
            (source) =>
              `<li><a href="${escapeHtml(source.href)}" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`
          )
          .join('')}</ul>
        <h2>Frequently asked questions</h2>
        ${guide.faqs
          .map(
            (faq) =>
              `<h3>${escapeHtml(faq.q)}</h3><p>${renderInline(faq.a)}</p>`
          )
          .join('')}
      </article>
    `);
  }

  if (route.path === '/about') {
    return fallbackShell(`
      <h1>A clearer way to plan UPI payments.</h1>
      <p>MDR Free Split is an independent UPI MDR calculator and split payment planner. It helps payers and small merchants understand the arithmetic behind a split while keeping the actual payment in their own UPI app.</p>
      <p>Read the <a href="/guides">source-linked guides</a>, check the <a href="/privacy">Privacy Policy</a>, or <a href="/contact">contact the publisher</a>.</p>
    `);
  }

  if (route.path === '/contact') {
    return fallbackShell(`
      <h1>Questions, corrections and feedback.</h1>
      <p>Email <a href="mailto:polishettivamshi123@gmail.com">polishettivamshi123@gmail.com</a> for corrections, privacy requests or feedback about the calculator and guides.</p>
      <p class="fallback-note">Never send a UPI PIN, OTP, card number or bank password.</p>
    `);
  }

  if (route.path === '/split') {
    return fallbackShell(`
      <h1>Scan &amp; Split UPI</h1>
      <p>Scan a merchant UPI QR, enter the bill and create a local installment plan. No account, no PIN entry and no payment collection.</p>
      <p class="fallback-note">This calculator runs in your browser. Enable JavaScript to use the scanner and create a plan.</p>
    `);
  }

  if (route.path === '/plan') {
    return fallbackShell(`
      <h1>Split Plan</h1>
      <p>This plan is stored in the browser where it was created and is kept for seven days. Open the same link in that browser to see the installment list.</p>
      <p><a href="/split">Create a new UPI split plan</a> · <a href="/guides">Read the UPI guides</a></p>
    `);
  }

  const legalDoc = LEGAL_DOCS.find((doc) => doc.path === route.path);
  if (legalDoc) {
    return fallbackShell(`
      <article>
        <h1>${escapeHtml(legalDoc.title)}</h1>
        <p>${renderInline(legalDoc.intro)}</p>
        ${renderBlocks(legalDoc.blocks)}
      </article>
    `);
  }

  return fallbackShell(`
    <h1>${escapeHtml(route.title)}</h1>
    <p>${escapeHtml(route.description)}</p>
    <p><a href="/">Go to the homepage</a> · <a href="/guides">Browse the UPI guides</a></p>
  `);
}

function writeRoute(route: RouteDefinition): void {
  let html = template;
  if (!route.isHome) html = removeScriptById(html, 'site-webapp-schema');
  html = applyMeta(html, route);
  for (const schema of route.schemas ?? []) {
    html = injectJsonLd(html, schema.id, schema.data);
  }

  html = html.replace('</head>', `${fallbackStyle}\n  </head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${renderFallback(route)}</div>`
  );

  const target = path.join(distDir, route.output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, 'utf8');
}

const notFoundRoute: RouteDefinition = {
  path: '/404',
  output: '404.html',
  title: 'Page not found — MDR Free Split',
  description:
    'That page could not be found. Browse the UPI guides or open the free UPI MDR calculator and split planner.',
  keywords: ['page not found', 'MDR Free Split'],
  noindex: true,
  canonical: false,
};

for (const route of [...routes, notFoundRoute]) {
  writeRoute(route);
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const sitemapEntries = routes
  .filter((route) => route.sitemap)
  .map((route) => {
    const lastmod = route.updatedAt ?? defaultLastmod;
    return `  <url>
    <loc>${escapeXml(absoluteUrl(route.path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.sitemap!.changefreq}</changefreq>
    <priority>${route.sitemap!.priority}</priority>
  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');

const generatedHtmlFiles = [
  'index.html',
  'guides.html',
  'about.html',
  'contact.html',
  'split.html',
  'plan.html',
  '404.html',
  ...LEGAL_DOCS.map((doc) => `${doc.path.slice(1)}.html`),
  ...GUIDES.map((guide) => `guides/${guide.slug}.html`),
];

for (const file of [...generatedHtmlFiles, 'sitemap.xml', 'robots.txt']) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected build output is missing: ${file}`);
  }
  const contents = fs.readFileSync(filePath, 'utf8');
  if (/%VITE_SITE_URL%|%SITE_URL%/.test(contents)) {
    throw new Error(`Unresolved site URL placeholder in ${file}`);
  }
}

console.log(
  `SEO metadata written for ${routes.length} routes plus 404, and sitemap.xml regenerated.`
);
