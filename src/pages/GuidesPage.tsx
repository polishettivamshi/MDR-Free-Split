import { BookOpen, Clock3, FileText, ShieldCheck } from 'lucide-react';
import { GUIDES } from '../content/guides';
import { usePageMeta } from '../lib/seo';
import { GuideCard } from '../components/content/GuideCard';
import { CalculatorCta } from '../components/content/CalculatorCta';

const editorialStandards = [
  {
    icon: FileText,
    title: 'Primary sources first',
    text: 'MDR explanations are checked against NPCI material, government releases and provider guidance before publication.'
  },
  {
    icon: Clock3,
    title: 'Date-stamped updates',
    text: 'Every guide shows when it was last updated. Rules change, so the date matters as much as the explanation.'
  },
  {
    icon: ShieldCheck,
    title: 'Clear limits',
    text: 'We distinguish between a calculation estimate and a merchant’s actual settlement statement. No guarantee is implied.'
  }
];

export const GuidesPage = () => {
  usePageMeta({
    title: 'UPI MDR & Payment Guides — MDR Free Split',
    description:
      'Practical, source-linked guides to UPI MDR, merchant QR codes, installment planning and payment safety in India. Written for payers and small merchants.',
    path: '/guides'
  });

  return (
    <div className="bg-lilac">
      <section className="relative overflow-hidden border-b border-line/60 bg-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="kicker mb-4">MDR Free Split library</div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Understand UPI payments{' '}
              <span className="text-brand-gradient">before you split.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Plain-language guides to merchant MDR, QR payments, installment
              planning and UPI safety. Written for people who want to understand
              the arithmetic before they open a payment app.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                {GUIDES.length} in-depth guides
              </span>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <span>Sources linked in every guide</span>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <span>Updated October 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              Start with the question you have
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Six practical guides, arranged from the basics to safer payments.
            </p>
          </div>
          <p className="text-xs font-medium text-muted-soft">
            All content is free to read
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide, index) => (
            <GuideCard key={guide.slug} guide={guide} featured={index === 0} />
          ))}
        </div>
      </section>

      <section className="border-y border-line/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12">
            <div>
              <div className="kicker mb-4">How this library is written</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Useful detail, not confident guesses
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                The guides are written and maintained by Vamshi Polishetti. 
                They focus on what a payer or small merchant can
                verify: the per-transaction rules, the assumptions behind an
                estimate, and the step where a real payment leaves this site.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {editorialStandards.map((standard) => {
                  const Icon = standard.icon;
                  return (
                    <div
                      key={standard.title}
                      className="rounded-2xl border border-line bg-lilac/60 p-4"
                    >
                      <Icon className="h-4 w-4 text-brand" />
                      <h3 className="mt-3 text-sm font-bold text-ink">
                        {standard.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-muted">
                        {standard.text}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">
                Read more about the project and our{' '}
                <a
                  href="/about"
                  className="font-semibold text-brand-dark underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
                >
                  editorial approach
                </a>
                . Found something that needs correcting?{' '}
                <a
                  href="/contact"
                  className="font-semibold text-brand-dark underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
                >
                  Tell us here
                </a>
                .
              </p>
            </div>

            <CalculatorCta />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <p className="text-xs leading-6 text-muted-soft">
          The guides are general educational content, not financial, tax or legal
          advice. MDR treatment depends on the merchant’s bank or payment service
          provider. Verify the current rates and your own statements before making
          a business decision.
        </p>
      </section>
    </div>
  );
};
