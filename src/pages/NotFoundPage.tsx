import { ArrowLeft, ArrowRight, BookOpen, Compass, SearchX } from 'lucide-react';
import { usePageMeta } from '../lib/seo';

interface NotFoundPageProps {
  title?: string;
  message?: string;
}

export const NotFoundPage = ({
  title = 'Page not found',
  message = 'The page you were looking for is not here. It may have moved, or the link may be incomplete.'
}: NotFoundPageProps) => {
  usePageMeta({
    title: `${title} — MDR Free Split`,
    description:
      'That page could not be found. Browse the UPI guides or open the free split calculator.',
    path: window.location.pathname || '/',
    noindex: true,
    canonical: false
  });

  return (
    <div className="bg-lilac">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <SearchX className="h-7 w-7" />
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
          404 · Not found
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
          {message}
        </p>

        <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <a href="/" className="btn-primary min-h-12 px-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </a>
          <a href="/guides" className="btn-secondary min-h-12 px-6 text-sm">
            <BookOpen className="h-4 w-4" />
            Browse guides
          </a>
        </div>

        <div className="mt-10 grid w-full gap-3 text-left sm:grid-cols-2">
          <a
            href="/split"
            className="group rounded-2xl border border-line bg-white p-4 transition-all hover:border-brand/25 hover:shadow-md"
          >
            <Compass className="h-4 w-4 text-brand" />
            <h2 className="mt-2 text-sm font-bold text-ink group-hover:text-brand-dark">
              Open the split calculator
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Scan a merchant QR or enter a UPI ID and plan the installments.
            </p>
          </a>
          <a
            href="/contact"
            className="group rounded-2xl border border-line bg-white p-4 transition-all hover:border-brand/25 hover:shadow-md"
          >
            <ArrowRight className="h-4 w-4 text-brand" />
            <h2 className="mt-2 text-sm font-bold text-ink group-hover:text-brand-dark">
              Report a broken link
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              Tell us which page you expected so we can correct it.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};
