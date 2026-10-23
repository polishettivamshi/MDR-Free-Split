import { CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react';
import type { ContentBlock } from '../content/types';
import { usePageMeta } from '../lib/seo';
import { ArticleBlocks } from '../components/content/ArticleBlocks';
import { Breadcrumbs } from '../components/content/Breadcrumbs';
import { CalculatorCta } from '../components/content/CalculatorCta';

const aboutBlocks: ContentBlock[] = [
  { type: 'h2', text: 'Why this site exists' },
  {
    type: 'p',
    text: 'UPI payments are simple on the surface: scan, check, enter a PIN. The rules underneath are less obvious. Merchant discount rate, the ₹2,000 threshold, small-merchant classifications and category exceptions all affect how a payment is understood. Most people only encounter that complexity when a bill is large or a merchant mentions a fee.'
  },
  {
    type: 'p',
    text: 'MDR Free Split started with a narrow question: can a person plan a merchant UPI bill as a set of smaller, clearly listed payments without handing over card data or creating another account? The result is a local calculator, a saved plan and a set of educational guides. It is intentionally not a payment business.'
  },
  { type: 'h2', text: 'What the calculator does' },
  {
    type: 'ul',
    items: [
      'Reads a merchant UPI QR code from the camera or an uploaded image, or accepts a manually entered UPI ID.',
      'Divides a bill into equal or custom installment amounts and keeps the total exact.',
      'Shows how the standard ₹2,000 threshold and 0.4% base rate affect an estimate.',
      'Saves the plan in your browser for seven days so you can reopen it in the same browser.',
      'Opens an individual installment in your UPI app, or shows a QR code on desktop.'
    ]
  },
  {
    type: 'p',
    text: 'The scanner and image decoder run on your device. Plans are stored in local storage, not in a server database. The site never asks for a UPI PIN, OTP, card number or bank password.'
  },
  { type: 'h2', text: 'What it deliberately does not do' },
  {
    type: 'ul',
    items: [
      'It does not collect, hold, transfer or settle money.',
      'It does not confirm that an installment was paid or that a merchant received funds.',
      'It does not issue invoices, receipts, refunds or payment guarantees.',
      'It does not determine a merchant’s P2PM or P2M classification.',
      'It does not treat splitting a transaction as a way to change a fee category or avoid a lawful obligation.',
      'It does not provide financial, tax, legal or accounting advice.'
    ]
  },
  {
    type: 'callout',
    tone: 'info',
    title: 'A plan is not a payment',
    text: 'When you press an installment button, the site prepares a UPI payment instruction. The actual debit happens only after you review the details and authorize it in your own UPI app.'
  },
  { type: 'h2', text: 'How the guides are researched and updated' },
  {
    type: 'p',
    text: 'The editorial library focuses on practical questions about UPI MDR, QR codes, installment planning and payment safety. Each guide is written in plain language and reviewed against primary or authoritative sources such as NPCI FAQs, government press releases and official cybercrime resources. Sources are linked at the bottom of the relevant guide.'
  },
  {
    type: 'p',
    text: 'Rules can change, and a summary can become stale. Every guide carries a visible “last updated” date. When a source changes, the page is revised or the affected section is marked clearly. The calculator’s assumptions are also disclosed: it uses a simplified standard-rate model and cannot know a merchant’s actual category, provider fees or GST treatment.'
  },
  { type: 'h2', text: 'Independence and funding' },
  {
    type: 'p',
    text: 'MDR Free Split is an independent project built by Vamshi Polishetti. It is not affiliated with NPCI, the Reserve Bank of India, any bank or any UPI app. The calculator is free to use and does not require an account.'
  },
  {
    type: 'p',
    text: 'Editorial guide pages may display advertising through Google AdSense. The calculator and plan screens are kept free of the advertising script. Advertising does not change the calculator’s arithmetic, the choice of guide topics or the conclusions in an article. We do not accept payment for a favourable explanation of a bank, payment provider or merchant.'
  },
  { type: 'h2', text: 'Corrections and contact' },
  {
    type: 'p',
    text: 'If a rate, link, calculation or explanation appears wrong, please tell us. Useful correction requests include the page URL, the sentence or figure in question, and a link to the primary source if you have one. We review specific reports rather than broad requests to remove content.'
  },
  {
    type: 'p',
    text: 'Email **polishettivamshi123@gmail.com** or use the [Contact page](/contact). Please do not send a UPI PIN, OTP, card number, bank password or other authentication secret. The site cannot help with a failed merchant payment, a refund or a transaction dispute; those are handled by the merchant, your bank and the UPI app you used.'
  },
  { type: 'h2', text: 'The company' },
  {
    type: 'p',
    text: 'SmartScaleTech is the studio behind the project. You can see more work at [smartscaletech](https://smartscaletech.vercel.app/) or connect with Vamshi on [LinkedIn](https://www.linkedin.com/in/polishettivamshi/).'
  },
  {
    type: 'p',
    text: 'Read the [Privacy Policy](/privacy), [Terms of Use](/terms) and [Disclaimer](/disclaimer) for the formal details about data, permitted use and the limits of the information on this site.'
  }
];

export const AboutPage = () => {
  usePageMeta({
    title: 'About MDR Free Split — Independent UPI Calculator',
    description:
      'Learn who builds MDR Free Split, what the UPI calculator does and does not do, how the guides are researched, and how to request a correction.',
    path: '/about'
  });

  return (
    <div className="bg-lilac">
      <section className="border-b border-line/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <Breadcrumbs items={[{ label: 'About' }]} />
          <div className="max-w-3xl">
            <div className="kicker mb-4">About the project</div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              A clearer way to plan{' '}
              <span className="text-brand-gradient">UPI payments.</span>
            </h1>
            <p className="mt-4 text-base leading-8 text-muted sm:text-lg">
              MDR Free Split is an independent calculator and knowledge base. It
              helps people understand the arithmetic behind a split and keeps the
              actual payment in the safety of their own UPI app.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-brand" />
                By Vamshi Polishetti
              </span>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand" />
                Last updated 23 Oct 2026
              </span>
              <span className="h-3 w-px bg-line" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Independent project
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
          <article className="min-w-0 rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_-45px_rgba(17,20,57,0.35)] sm:p-8">
            <ArticleBlocks blocks={aboutBlocks} />

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-lilac/60 p-4 sm:flex-row sm:items-start sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-sm font-black text-white shadow-sm">
                VP
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">Vamshi Polishetti</p>
                <p className="mt-1 text-xs leading-6 text-muted">
                  Founder of SmartScaleTech and creator of MDR Free Split. He builds
                  practical web tools and writes about the payment mechanics behind
                  them.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold">
                  <a
                    href="https://www.linkedin.com/in/polishettivamshi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://smartscaletech.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline"
                  >
                    SmartScaleTech
                  </a>
                  <a href="/contact" className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-soft">
                At a glance
              </p>
              <dl className="mt-3 space-y-3 text-xs">
                <div>
                  <dt className="font-semibold text-ink">Publisher</dt>
                  <dd className="mt-0.5 text-muted">Vamshi Polishetti</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Project</dt>
                  <dd className="mt-0.5 text-muted">Independent UPI split calculator</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Content</dt>
                  <dd className="mt-0.5 text-muted">UPI MDR, QR payments and safety guides</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Editorial standard</dt>
                  <dd className="mt-0.5 text-muted">Primary sources, visible update dates and corrections</dd>
                </div>
              </dl>
              <a
                href="mailto:polishettivamshi123@gmail.com"
                className="btn-secondary mt-5 min-h-11 w-full px-4 text-xs"
              >
                <Mail className="h-4 w-4" />
                Email the publisher
              </a>
            </div>
            <div className="mt-4">
              <CalculatorCta compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
