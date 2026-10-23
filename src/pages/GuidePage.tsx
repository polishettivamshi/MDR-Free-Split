import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getGuide, GUIDES, formatGuideDate } from '../content/guides';
import type { ContentBlock, Guide } from '../content/types';
import { absoluteUrl, useJsonLd, usePageMeta } from '../lib/seo';
import { ArticleBlocks, headingId } from '../components/content/ArticleBlocks';
import { Breadcrumbs } from '../components/content/Breadcrumbs';
import { CalculatorCta } from '../components/content/CalculatorCta';
import { GuideCard } from '../components/content/GuideCard';
import { RichText } from '../components/content/RichText';
import { NotFoundPage } from './NotFoundPage';

interface GuideArticleContentProps {
  guide: Guide;
}

const GuideArticleContent = ({ guide }: GuideArticleContentProps) => {
  usePageMeta({
    title: guide.metaTitle,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: 'article',
    updatedAt: guide.updatedAt
  });

  useJsonLd('guide-article-schema', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: 'en-IN',
    articleSection: guide.category,
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/guides/${guide.slug}`)
    },
    author: {
      '@type': 'Person',
      name: 'Vamshi Polishetti',
      url: absoluteUrl('/about')
    },
    publisher: {
      '@type': 'Organization',
      name: 'MDR Free Split',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg')
      }
    }
  });

  useJsonLd('guide-faq-schema', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  });

  const sections = guide.blocks.filter(
    (block): block is Extract<ContentBlock, { type: 'h2' }> =>
      block.type === 'h2'
  );

  const relatedGuides = GUIDES.filter((item) => item.slug !== guide.slug)
    .sort((a, b) => {
      const sameCategoryA = a.category === guide.category ? 1 : 0;
      const sameCategoryB = b.category === guide.category ? 1 : 0;
      return sameCategoryB - sameCategoryA;
    })
    .slice(0, 2);

  return (
    <div className="bg-lilac">
      <section className="border-b border-line/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-9 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Guides', href: '/guides' },
              { label: guide.title }
            ]}
          />

          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-brand-100 bg-brand-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                {guide.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-lilac px-3 py-1 text-[10px] font-semibold text-muted">
                <CalendarDays className="h-3 w-3" />
                Updated {formatGuideDate(guide.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-line bg-lilac px-3 py-1 text-[10px] font-semibold text-muted">
                <Clock3 className="h-3 w-3" />
                {guide.readingMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              {guide.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-black text-white shadow-sm">
                  VP
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    By{' '}
                    <a
                      href="/about"
                      className="underline decoration-brand/30 underline-offset-2 hover:text-brand"
                    >
                      Vamshi Polishetti
                    </a>
                  </p>
                  <p className="text-[10px] text-muted-soft">
                    · MDR Free Split
                  </p>
                </div>
              </div>
              <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Independent guide · Sources linked below
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
          <article className="min-w-0">
            <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_-45px_rgba(17,20,57,0.35)] sm:p-8">
              <details className="group mb-6 rounded-2xl border border-line bg-lilac/60 p-4 lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <span>On this page</span>
                  <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <nav aria-label="On this page" className="mt-3 border-t border-line-soft pt-3">
                  <ol className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.text}>
                        <a
                          href={`#${headingId(section.text)}`}
                          className="flex min-h-10 items-center text-xs leading-5 text-muted transition-colors hover:text-brand"
                        >
                          {section.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>

              <section
                aria-labelledby="key-takeaways"
                className="rounded-2xl border border-brand/15 bg-brand-soft/55 p-4 sm:p-5"
              >
                <h2
                  id="key-takeaways"
                  className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-brand-dark"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Key takeaways
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {guide.takeaways.map((takeaway) => (
                    <li
                      key={takeaway}
                      className="flex items-start gap-2.5 text-sm leading-6 text-ink/80"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-8">
                <ArticleBlocks blocks={guide.blocks} />
              </div>

              <section
                aria-labelledby="faq-heading"
                className="mt-10 border-t border-line pt-8"
              >
                <h2
                  id="faq-heading"
                  className="scroll-mt-24 text-2xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]"
                >
                  Frequently asked questions
                </h2>
                <div className="mt-4 space-y-2.5">
                  {guide.faqs.map((faq) => (
                    <details
                      key={faq.q}
                      className="group overflow-hidden rounded-2xl border border-line bg-white transition-colors open:border-brand/20 open:bg-lilac/30"
                    >
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden sm:px-5">
                        <span>{faq.q}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-line-soft px-4 py-3.5 sm:px-5">
                        <p className="text-sm leading-6 text-muted">
                          <RichText text={faq.a} />
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {guide.sources.length > 0 && (
                <section
                  aria-labelledby="sources-heading"
                  className="mt-10 border-t border-line pt-8"
                >
                  <h2
                    id="sources-heading"
                    className="text-sm font-extrabold uppercase tracking-wider text-ink"
                  >
                    Sources and further reading
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {guide.sources.map((source) => (
                      <li key={source.href}>
                        <a
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-start gap-2 py-1 text-sm leading-6 text-muted transition-colors hover:text-brand-dark"
                        >
                          <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-brand/60" />
                          <span className="underline decoration-line underline-offset-2 group-hover:decoration-brand/40">
                            {source.label}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] leading-5 text-muted-soft">
                    Sources checked in October 2026. Rule summaries are simplified
                    for general readers; the linked primary material and your
                    provider’s agreement take precedence.
                  </p>
                </section>
              )}

              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-lilac/60 p-4 sm:flex-row sm:items-start sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-sm font-black text-white shadow-sm">
                  VP
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    Written by Vamshi Polishetti
                  </p>
                  <p className="mt-1 text-xs leading-6 text-muted">
                    Founder of SmartScaleTech and creator of MDR Free Split. He
                    writes practical explanations of UPI mechanics, merchant fees
                    and safer payment workflows. This guide is general information,
                    not financial, tax or legal advice.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold">
                    <a href="/about" className="py-1 text-brand-dark hover:underline">
                      About the project
                    </a>
                    <a href="/contact" className="py-1 text-brand-dark hover:underline">
                      Contact &amp; corrections
                    </a>
                    <a
                      href="https://www.linkedin.com/in/polishettivamshi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1 text-brand-dark hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-10" aria-labelledby="related-heading">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2
                  id="related-heading"
                  className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
                >
                  Continue reading
                </h2>
                <a
                  href="/guides"
                  className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark"
                >
                  All guides
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {relatedGuides.map((related) => (
                  <GuideCard key={related.slug} guide={related} />
                ))}
              </div>
            </section>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <nav
                aria-label="On this page"
                className="rounded-2xl border border-line bg-white p-4 shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">
                  On this page
                </p>
                <ol className="mt-3 space-y-1.5">
                  {sections.map((section) => (
                    <li key={section.text}>
                      <a
                        href={`#${headingId(section.text)}`}
                        className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-muted transition-colors hover:bg-brand-soft hover:text-brand-dark"
                      >
                        {section.text}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#faq-heading"
                      className="block rounded-lg px-2 py-1.5 text-xs leading-5 text-muted transition-colors hover:bg-brand-soft hover:text-brand-dark"
                    >
                      Frequently asked questions
                    </a>
                  </li>
                </ol>
              </nav>
              <CalculatorCta compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

interface GuidePageProps {
  slug: string;
}

export const GuidePage = ({ slug }: GuidePageProps) => {
  const guide = getGuide(slug);

  if (!guide) {
    return (
      <NotFoundPage
        title="Guide not found"
        message="That guide is not in the library. Browse the available guides or open the calculator."
      />
    );
  }

  return <GuideArticleContent guide={guide} />;
};
