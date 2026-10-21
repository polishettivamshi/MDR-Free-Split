import React from 'react';
import { ArrowRight, ShieldCheck, Smartphone, QrCode, Lock, Layers, Clock, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStartSplit: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSplit, onNavigate }) => {
  const steps = [
    {
      num: '1',
      title: 'Scan Merchant QR',
      desc: 'Point your camera or upload a merchant UPI QR code.',
      icon: QrCode
    },
    {
      num: '2',
      title: 'Choose Split Amount',
      desc: 'Divide bill into installments under ₹2,000 each for 0% MDR.',
      icon: Layers
    },
    {
      num: '3',
      title: 'Authorize in UPI App',
      desc: 'Pay each installment securely in your UPI app.',
      icon: Smartphone
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Split. Pay Zero MDR.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Split your UPI payment into{' '}
              <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy underline-offset-8">
                multiple payments.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
              Scan any merchant UPI QR code, split the amount into installments under ₹2,000 each to stay 0% MDR tax-free, and authorize each payment securely in your UPI app.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mb-10 max-w-md sm:max-w-none mx-auto">
              <button
                id="hero-start-split-primary-btn"
                onClick={onStartSplit}
                className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                className="w-full sm:w-auto min-h-[48px] px-8 py-4 rounded-xl text-base font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                How It Works
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authorized directly in your UPI app • Zero PIN or card data stored</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Simple 3-Step Flow
            </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                How MDR Free Split Works
              </h2>
            <p className="text-base text-slate-600 mt-3">
              Complete your payment in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-100">0{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-10 text-center text-white shadow-xl shadow-indigo-200">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to split your first UPI payment?</h3>
            <p className="text-indigo-100 text-sm max-w-xl mx-auto mb-6">
              Create your installment plan in seconds and pay safely through your favorite UPI app.
            </p>
            <button
              onClick={onStartSplit}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-extrabold text-base hover:bg-slate-50 active:scale-95 transition-transform shadow-md cursor-pointer inline-flex items-center justify-center"
            >
              Start a Split Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
