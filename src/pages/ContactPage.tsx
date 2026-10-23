import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { usePageMeta } from '../lib/seo';
import { Breadcrumbs } from '../components/content/Breadcrumbs';
import { CalculatorCta } from '../components/content/CalculatorCta';

const canHelp = [
  'A calculation or layout problem on the split calculator.',
  'A broken link, unclear sentence or factual error in a guide.',
  'A privacy request about information you sent us directly.',
  'A question about how the site handles local plans, QR images or camera access.',
  'A thoughtful suggestion for a UPI topic that needs a clearer explanation.'
];

const cannotHelp = [
  'Checking whether a merchant received a payment.',
  'Issuing a refund, reversing a transfer or opening a bank dispute.',
  'Recovering money from a fraudulent QR code or collect request.',
  'Changing a UPI PIN, resetting an account or unlocking a UPI app.',
  'Confirming a merchant’s P2PM/P2M classification or actual MDR invoice.'
];

export const ContactPage = () => {
  usePageMeta({
    title: 'Contact MDR Free Split',
    description:
      'Contact MDR Free Split about calculator feedback, guide corrections, privacy requests or a broken link. Never send a UPI PIN, OTP or bank credentials.',
    path: '/contact'
  });

  return (
    <div className="bg-lilac">
      <section className="border-b border-line/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <Breadcrumbs items={[{ label: 'Contact' }]} />
          <div className="max-w-3xl">
            <div className="kicker mb-4">Contact</div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Questions, corrections{' '}
              <span className="text-brand-gradient">and feedback.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              MDR Free Split is a small independent project. Email is the best way
              to reach us, especially for a specific correction or privacy request.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="mailto:polishettivamshi123@gmail.com"
                className="group rounded-3xl border border-brand/15 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Mail className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-sm font-bold text-ink group-hover:text-brand-dark">
                  Email
                </h2>
                <p className="mt-1 break-all text-sm font-semibold text-brand-dark">
                  polishettivamshi123@gmail.com
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Best for corrections, privacy requests and detailed feedback.
                </p>
              </a>

              <a
                href="tel:+919000859695"
                className="group rounded-3xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-lg sm:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lilac text-brand">
                  <Phone className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-sm font-bold text-ink group-hover:text-brand-dark">
                  Phone
                </h2>
                <p className="mt-1 text-sm font-semibold text-brand-dark">
                  +91 9000859695
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  For general project enquiries. Email is preferred for anything
                  detailed or time-sensitive.
                </p>
              </a>
            </div>

            <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-extrabold tracking-tight text-ink">
                Before you write
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    We can usually help with
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {canHelp.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    We cannot help with
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {cannotHelp.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs leading-5 text-muted">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-900">
                Use your UPI app, bank or merchant for payment-status, refund and
                fraud issues. For cyber-financial fraud in India, report through
                the national cybercrime portal and call 1930 as soon as possible.
              </p>
            </section>

            <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Never send authentication secrets
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                Do not email or message a UPI PIN, OTP, card number, CVV, bank
                password, Aadhaar number or remote-access code. MDR Free Split never
                needs those details to answer a question about this website.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold">
                <a href="/privacy" className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline">
                  Terms of Use
                </a>
                <a href="/about" className="inline-flex min-h-10 items-center py-1 text-brand-dark hover:underline">
                  About the project
                </a>
                <a
                  href="https://www.linkedin.com/in/polishettivamshi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-1 py-1 text-brand-dark hover:underline"
                >
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                </a>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-soft">
                <Clock3 className="h-3.5 w-3.5" />
                Response time
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                We aim to reply to genuine messages within two business days. A
                detailed correction report is easier to act on than a one-line
                message.
              </p>
            </div>
            <CalculatorCta compact />
          </aside>
        </div>
      </div>
    </div>
  );
};
