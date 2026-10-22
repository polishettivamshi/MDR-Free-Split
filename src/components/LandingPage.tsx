import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Smartphone, QrCode, Lock, Layers, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStartSplit: () => void;
  onNavigate: (view: string) => void;
}

const steps = [
  {
    num: '1',
    title: 'Scan Merchant QR',
    desc: 'Point your camera or upload a merchant UPI QR code to pre-fill details.',
    icon: QrCode,
    color: 'from-indigo-100 to-indigo-50',
    iconColor: 'text-indigo-600'
  },
  {
    num: '2',
    title: 'Choose Split Amount',
    desc: 'Divide bill into installments under ₹2,000 each for 0% MDR tax.',
    icon: Layers,
    color: 'from-emerald-100 to-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    num: '3',
    title: 'Authorize in UPI App',
    desc: 'Pay each installment securely in PhonePe, Google Pay, Paytm, or BHIM.',
    icon: Smartphone,
    color: 'from-violet-100 to-violet-50',
    iconColor: 'text-violet-600'
  }
];

const stats = [
  { label: '0% MDR', value: 'Tax on ≤₹2,000' },
  { label: '0%', value: 'PIN or card stored' },
  { label: '3', value: 'Steps to split' },
  { label: '24/7', value: 'Local only' }
];

const faqs = [
  {
    q: 'What is MDR Free Split?',
    a: 'MDR Free Split lets you divide any merchant UPI payment into installments under ₹2,000 each, so every transaction qualifies for 0% Merchant Discount Rate tax under NPCI rules.'
  },
  {
    q: 'Does it store my UPI PIN?',
    a: 'Never. You enter your UPI PIN only inside your official UPI app (PhonePe, Google Pay, Paytm, BHIM). MDR Free Split never sees, collects, or stores your PIN, OTP, or card data.'
  },
  {
    q: 'Which UPI apps work?',
    a: 'All NPCI-compliant UPI apps including PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, Navi, and official bank UPI apps from HDFC, ICICI, SBI, Axis, and others.'
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. MDR Free Split is completely free. There are no platform fees, no hidden charges, and no backend subscriptions. Everything runs locally in your browser.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSplit, onNavigate }) => {
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

      {/* Confetti Canvas */}
      <canvas className="confetti-canvas" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 lg:pt-24 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto reveal stagger-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-sm shadow-sm animate-fade-in stagger-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero MDR Tax</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-6 text-balance animate-fade-in stagger-2">
              Split your UPI payment into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-emerald-500 to-cyan-400 underline decoration-indigo-200/50 decoration-wavy underline-offset-8">
                tax-free installments.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in stagger-3 text-balance">
              Scan any merchant UPI QR code, split the amount into installments under ₹2,000 each, and pay <strong className="text-emerald-600 font-bold">0% MDR tax</strong>. Authorize each payment securely in your UPI app.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-12 max-w-md sm:max-w-none mx-auto animate-fade-in stagger-4">
              <button
                id="hero-start-split-primary-btn"
                onClick={onStartSplit}
                className="btn-primary w-full sm:w-auto min-h-[52px] px-8 py-4 text-base"
              >
                <span>Start a Split</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                id="hero-how-it-works-secondary-btn"
                onClick={() => {
                  const el = document.getElementById('how-it-works-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary w-full sm:w-auto min-h-[52px] px-8 py-4 text-base"
              >
                How It Works
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-slate-500 font-medium animate-fade-in stagger-5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero PIN or card data stored</span>
              </div>
              <span className="w-px h-3 bg-slate-300" />
              <span>Local storage only</span>
              <span className="w-px h-3 bg-slate-300" />
              <span>No backend, no tracking</span>
            </div>
          </div>

          {/* Hero visual - phone mockup placeholder */}
          <div className="mt-20 sm:mt-24 relative z-0 reveal stagger-3">
            <div className="flex justify-center">
              <div className="relative max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-emerald-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-2xl shadow-indigo-100/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Merchant QR</span>
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">store@upi</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-slate-100">
                      <span className="text-sm font-bold text-slate-900">Amount</span>
                      <span className="text-sm font-bold text-indigo-600">₹6,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Split into</span>
                      <span className="text-sm font-bold text-emerald-600">3 × ₹2,000</span>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        0% MDR Tax
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
      <section className="py-12 border-y border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 reveal">
            {stats.map((stat) => (
              <div key={stat.value} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-indigo-50 hover:border-indigo-100 transition-all duration-300">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                  {stat.value.split(' ')[0]}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">
                  {stat.value.split(' ').slice(1).join(' ')} {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 lg:py-32 bg-slate-50 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-head reveal stagger-1">
            <div className="kicker">Simple 3-Step Flow</div>
            <h2 className="">Split Your Payment in Minutes</h2>
            <p>From scanning the QR to authorizing in your UPI app, complete the entire split in three steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal stagger-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md transition-all duration-300 group-hover:scale-110 ${step.iconColor.replace('text-', 'bg-') + '/10' + ' ' + step.iconColor}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-slate-100">0{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{step.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Next step</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-white border-t border-slate-200/50 reveal">
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
                  className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left text-base font-bold text-slate-900 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      {faq.q}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100/50">
                      <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 lg:py-28 reveal stagger-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600/80 rounded-3xl blur-[100px] -z-10 opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to split your first UPI payment?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Create your installment plan in seconds and pay zero MDR tax through your favorite UPI app.
            </p>
            <button
              onClick={onStartSplit}
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base min-h-[52px]"
            >
              Start a Split Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
