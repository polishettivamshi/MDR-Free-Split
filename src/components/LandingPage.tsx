import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Smartphone, QrCode, Layers, ChevronRight, CheckCircle2, Clock3, Store, BookOpen } from 'lucide-react';
import { SplitPlan } from '../types';
import { PLAN_RETENTION_DAYS } from '../lib/localStore';
import { formatINR } from '../lib/upi';
import { FEATURED_GUIDES } from '../content/guides';
import { usePageMeta } from '../lib/seo';
import { DisclaimerNotice } from './DisclaimerNotice';
import { GuideCard } from './content/GuideCard';

interface LandingPageProps {
  recentPlans: SplitPlan[];
}

const steps = [
  {
    num: '1',
    title: 'Scan Merchant QR',
    desc: 'Point your camera or upload a merchant UPI QR code to pre-fill details.',
    icon: QrCode,
    iconWrap: 'bg-linear-to-br from-[#635bff] to-[#8b5cf6] text-white shadow-brand/25'
  },
  {
    num: '2',
    title: 'Choose Split Amount',
    desc: 'Divide the bill into installments and see where the standard ₹2,000 zero-MDR threshold applies.',
    icon: Layers,
    iconWrap: 'bg-linear-to-br from-[#8b5cf6] to-[#d946ef] text-white shadow-[#8b5cf6]/25'
  },
  {
    num: '3',
    title: 'Open in UPI App',
    desc: 'Open each installment in PhonePe, Google Pay, Paytm, BHIM, or another UPI app and pay the merchant directly.',
    icon: Smartphone,
    iconWrap: 'bg-linear-to-br from-[#22d3ee] to-[#635bff] text-white shadow-accent/25'
  }
];

const stats = [
  { value: '0%', label: 'Standard MDR on eligible payments up to ₹2,000' },
  { value: '0', label: 'PINs or card details stored' },
  { value: '3', label: 'Steps to split a bill' },
  { value: '7d', label: 'Local plan retention' }
];

const faqs = [
  {
    q: 'What is MDR Free Split?',
    a: 'MDR Free Split divides a merchant UPI bill into installments and shows how the standard ₹2,000 threshold affects an MDR estimate. It is a calculator and planner, not a payment service. The merchant’s actual MDR depends on their classification, category, provider fees and GST.'
  },
  {
    q: 'Does it store my UPI PIN?',
    a: 'Never. You enter your UPI PIN only inside your official UPI app (PhonePe, Google Pay, Paytm, BHIM). MDR Free Split never sees, collects, or stores your PIN, OTP, or card data.'
  },
  {
    q: 'Which UPI apps work?',
    a: 'Any NPCI-compliant UPI app can be used, including PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, Navi, and bank UPI apps from HDFC, ICICI, SBI, Axis, and others.'
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. MDR Free Split is completely free. There are no platform fees, no hidden charges, and no subscriptions. Everything runs locally in your browser.'
  },
  {
    q: 'Does MDR Free Split take payments or issue refunds?',
    a: 'No. It only calculates a split and opens a UPI payment link. You pay the merchant directly in your own UPI app. This site does not collect funds, confirm payments, or issue refunds; any refund request must be handled by the merchant.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ recentPlans }) => {
  usePageMeta({
    title: 'MDR Free Split – UPI MDR Calculator, Split Planner & Guides',
    description:
      'Scan a merchant UPI QR, split a bill into installments and open each payment in your own UPI app. Free calculator, local-only plans and source-linked 2026 MDR guides.',
    path: '/'
  });

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in', 'animate-slide-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll('.reveal');
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh">
        <div className="mesh-blob mesh-blob-1 animate-gradient" />
        <div className="mesh-blob mesh-blob-2 animate-gradient" />
        <div className="mesh-blob mesh-blob-3 animate-gradient" />
        <div className="mesh-blob mesh-blob-4 animate-gradient" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 lg:pt-24 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto reveal stagger-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-line text-brand-dark text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm shadow-sm animate-fade-in stagger-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
              <span>UPI MDR calculator</span>
            </div>

            <h1 className="text-4xl min-[390px]:text-5xl sm:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.05] mb-6 text-balance animate-fade-in stagger-2">
              Split your UPI payment into{' '}
              <span className="text-brand-gradient">
                planned installments.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in stagger-3 text-balance">
              Scan any merchant UPI QR code, split the bill into installments, and see where the standard ₹2,000 zero-MDR threshold applies. Open each installment in your own UPI app to pay the merchant directly.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-12 max-w-md sm:max-w-none mx-auto animate-fade-in stagger-4">
              <a
                id="hero-start-split-primary-btn"
                href="/split"
                className="btn-primary min-h-13 w-full px-8 py-4 text-base sm:w-auto"
              >
                <span>Start a Split</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                id="hero-how-it-works-secondary-btn"
                href="#how-it-works-section"
                className="btn-secondary min-h-13 w-full px-8 py-4 text-base sm:w-auto"
              >
                How It Works
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs sm:text-sm text-muted font-medium animate-fade-in stagger-5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero PIN or card data stored</span>
              </div>
              <span className="hidden sm:block w-px h-3 bg-line" />
              <span>Local storage only</span>
              <span className="hidden sm:block w-px h-3 bg-line" />
              <span>No account needed</span>
            </div>

            <DisclaimerNotice compact className="mt-8 max-w-2xl mx-auto text-left" />
          </div>

          {/* Hero visual - phone mockup placeholder */}
          <div className="mt-20 sm:mt-24 relative z-0 reveal stagger-3">
            <div className="flex justify-center">
              <div className="relative max-w-md">
                <div className="absolute -inset-6 bg-linear-to-br from-brand/25 via-[#8b5cf6]/20 to-accent/20 rounded-[2.5rem] blur-3xl" />
                <div className="relative bg-white/85 backdrop-blur-xl border border-line rounded-4xl p-6 shadow-[0_30px_80px_-40px_rgba(17,20,57,0.4)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Merchant QR</span>
                      <span className="text-xs font-mono font-bold text-ink bg-lilac border border-line px-2 py-1 rounded-lg">store@upi</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-line-soft">
                      <span className="text-sm font-bold text-ink">Amount</span>
                      <span className="text-sm font-bold text-brand">₹6,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ink">Split into</span>
                      <span className="text-sm font-bold text-brand-dark">3 × ₹2,000</span>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-brand-soft border border-brand/15">
                      <span className="text-xs font-bold text-brand-dark flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        At or below the ₹2,000 threshold
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-12 border-y border-line/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 reveal">
            {stats.map((stat) => (
              <div key={stat.label} className="group p-5 rounded-2xl bg-lilac border border-line-soft text-center hover:bg-white hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl font-black text-brand-gradient mb-1">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Plans Section */}
      {recentPlans.length > 0 && (
        <section className="border-b border-line/50 bg-white py-8 sm:py-10 reveal">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  <Clock3 className="h-3 w-3" />
                  Saved in this browser for {PLAN_RETENTION_DAYS} days
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  Continue a split plan
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Plans clear automatically after {PLAN_RETENTION_DAYS} days.
                </p>
              </div>
              <a
                href="/split"
                className="btn-secondary min-h-11 self-start px-4 text-xs sm:self-auto"
              >
                <span>New split</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentPlans.map((plan) => {
                const created = new Date(plan.createdAt);
                const dateLabel = Number.isNaN(created.getTime())
                  ? 'Saved plan'
                  : created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const installmentCount = plan.items?.length || plan.numberOfPayments;

                return (
                  <a
                    key={plan.id}
                    href={`/plan/${encodeURIComponent(plan.publicId || plan.id)}`}
                    className="group flex min-h-24 w-full items-start gap-3 rounded-2xl border border-line bg-lilac/60 p-4 text-left transition-all duration-200 hover:border-brand/25 hover:bg-white hover:shadow-md"
                    aria-label={`Open split plan for ${plan.merchantName || 'merchant'}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-ink group-hover:text-brand">
                            {plan.merchantName || 'Merchant'}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-medium text-muted">
                            {dateLabel} · {installmentCount} {installmentCount === 1 ? 'installment' : 'installments'}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-black text-ink">{formatINR(plan.totalAmount)}</span>
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-brand">
                        Open plan
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works-section" className="scroll-mt-16 py-20 lg:py-32 bg-lilac reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-head reveal stagger-1">
            <div className="kicker">Simple 3-Step Flow</div>
            <h2 className="">Split Your Payment in Minutes</h2>
            <p>From scanning the QR to opening each installment in your UPI app, complete the split in three steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 reveal stagger-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative p-8 rounded-3xl bg-white border border-line shadow-sm hover:border-brand-200 hover:shadow-xl hover:shadow-brand-soft/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-brand-soft/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${step.iconWrap}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-ink/5">0{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-3 group-hover:text-brand transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-6">{step.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Next step</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="border-y border-line/60 bg-brand-soft/40 py-16 lg:py-24 reveal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl reveal stagger-1">
              <div className="kicker">From the guide library</div>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Understand the rules behind the split
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted">
                Source-linked explanations of the 2026 MDR framework, merchant
                QR safety and installment planning.
              </p>
            </div>
            <a
              href="/guides"
              className="btn-secondary min-h-11 self-start px-4 text-xs sm:self-auto"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse all guides</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 reveal stagger-2">
            {FEATURED_GUIDES.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>

          <p className="mt-6 text-xs leading-5 text-muted">
            Written and maintained by Vamshi Polishetti. Read our{' '}
            <a
              href="/about"
              className="font-semibold text-brand-dark underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            >
              editorial approach
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-white border-t border-line/50 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-head reveal stagger-1">
            <div className="kicker">Frequently Asked Questions</div>
            <h2 className="">Everything You Need to Know</h2>
            <p>Common questions about MDR Free Split and UPI payment splitting.</p>
          </div>

          <div className="space-y-3 reveal stagger-2 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'border-brand/25 shadow-lg shadow-brand/5'
                      : 'border-line hover:border-brand/20 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full min-h-12 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left text-sm sm:text-base font-bold text-ink transition-all duration-200"
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isOpen ? 'bg-ink text-white' : 'bg-brand-soft text-brand'
                      }`}>
                        {index + 1}
                      </span>
                      {faq.q}
                    </span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-brand' : 'text-muted-soft'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-line-soft">
                      <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 lg:py-28 reveal stagger-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative overflow-hidden rounded-4xl sm:rounded-[2.5rem] bg-ink border border-white/10 px-6 py-14 sm:px-12 sm:py-20 text-center shadow-[0_40px_100px_-50px_rgba(17,20,57,0.65)]">
            <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/70 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Plan first. Pay in your UPI app.
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight text-balance">
                Ready to split your first{' '}
                <span className="text-brand-gradient-light">UPI payment?</span>
              </h2>
              <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed text-balance">
                Create your installment plan in seconds and see the standard MDR arithmetic for each payment. Nothing is charged on this site.
              </p>
              <a
                href="/split"
                className="btn-primary px-8 py-3.5 text-base min-h-13"
              >
                Start a Split Now
                <ChevronRight className="w-4 h-4" />
              </a>
              <p className="mt-5 text-[11px] font-medium text-white/35">
                Independent calculator and planner · Your PIN is never stored
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
