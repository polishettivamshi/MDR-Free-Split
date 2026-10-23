import { CalendarDays, Mail } from 'lucide-react';
import type { LegalDoc } from '../content/types';
import { formatGuideDate } from '../content/guides';
import { usePageMeta } from '../lib/seo';
import { ArticleBlocks } from '../components/content/ArticleBlocks';
import { Breadcrumbs } from '../components/content/Breadcrumbs';
import { RichText } from '../components/content/RichText';

interface LegalPageViewProps {
  doc: LegalDoc;
}

export const LegalPageView = ({ doc }: LegalPageViewProps) => {
  usePageMeta({
    title: doc.metaTitle,
    description: doc.description,
    path: doc.path,
    keywords: [doc.title, 'MDR Free Split', 'UPI calculator', 'UPI guides']
  });

  return (
    <div className="bg-lilac">
      <section className="border-b border-line/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <Breadcrumbs items={[{ label: doc.title }]} />
          <div className="max-w-3xl">
            <div className="kicker mb-4">Site information</div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {doc.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-muted sm:text-lg">
              <RichText text={doc.intro} />
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand" />
                Last updated {formatGuideDate(doc.updatedAt)}
              </span>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <a
                href="/contact"
                className="inline-flex items-center gap-1.5 underline decoration-brand/30 underline-offset-2 hover:text-brand"
              >
                <Mail className="h-3.5 w-3.5 text-brand" />
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <article className="rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_-45px_rgba(17,20,57,0.35)] sm:p-8">
          <ArticleBlocks blocks={doc.blocks} />
        </article>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
          <a href="/about" className="py-1 text-brand-dark hover:underline">
            About MDR Free Split
          </a>
          <a href="/guides" className="py-1 text-brand-dark hover:underline">
            Payment guides
          </a>
          <a href="/privacy" className="py-1 text-brand-dark hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="py-1 text-brand-dark hover:underline">
            Terms of Use
          </a>
          <a href="/disclaimer" className="py-1 text-brand-dark hover:underline">
            Disclaimer
          </a>
          <a href="/contact" className="py-1 text-brand-dark hover:underline">
            Contact
          </a>
        </div>
      </div>
    </div>
  );
};
