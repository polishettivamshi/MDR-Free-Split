import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Check, 
  Layers, 
  Clock, 
  AlertCircle,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';

interface LandingPageProps {
  onStartSplit: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartSplit, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const supportedApps = [
    { id: 'phonepe', name: 'PhonePe', badge: 'Fastest Deep-Link' },
    { id: 'gpay', name: 'Google Pay', badge: 'Instant Intent' },
    { id: 'paytm', name: 'Paytm', badge: 'Wallet & UPI' },
    { id: 'bhim', name: 'BHIM UPI', badge: 'NPCI Standard' },
    { id: 'cred', name: 'CRED UPI', badge: 'Member Perks' },
    { id: 'amazonpay', name: 'Amazon Pay', badge: 'Instant Cashback' },
    { id: 'navi', name: 'Navi UPI', badge: 'Fast Flow' },
    { id: 'razorpay', name: 'Razorpay', badge: 'Gateway Switch' },
    { id: 'cashfree', name: 'Cashfree', badge: 'Partner Switch' },
    { id: 'other', name: 'All Bank UPI', badge: 'HDFC, ICICI, SBI' }
  ];

  const steps = [
    {
      num: '1',
      title: 'Scan Merchant QR',
      desc: 'Point your camera or upload any merchant UPI QR code. SplitUPI verifies the merchant identity and VPA address securely.',
      icon: QrCode
    },
    {
      num: '2',
      title: 'Choose Your Split',
      desc: 'Divide the bill into 2, 3, 4, 5, or custom installments. SplitUPI calculates exact shares down to the last paisa.',
      icon: Layers
    },
    {
      num: '3',
      title: 'Review Payment Plan',
      desc: 'Check the structured schedule. Every payment is clearly numbered and locked until the prior installment succeeds.',
      icon: Clock
    },
    {
      num: '4',
      title: 'Open Your UPI App',
      desc: 'Select PhonePe, Google Pay, Paytm, or BHIM. SplitUPI generates a certified NPCI deep link to launch your preferred app.',
      icon: Smartphone
    },
    {
      num: '5',
      title: 'Authorize Each Payment',
      desc: 'Enter your UPI PIN privately inside your genuine banking or UPI app. We never see or capture your credentials.',
      icon: Lock
    },
    {
      num: '6',
      title: 'Track Completion',
      desc: 'Our server verifies payment with provider callbacks. Receive unified itemized receipts for your records.',
      icon: FileCheck
    }
  ];

  const faqs = [
    {
      q: 'What is SplitUPI?',
      a: 'SplitUPI is a smart payment-planning platform that lets you break larger merchant purchases into structured, manageable installments. Each installment is authorized sequentially and directly by you in your installed UPI app.'
    },
    {
      q: 'Does SplitUPI store my UPI PIN?',
      a: 'Never. SplitUPI strictly abides by NPCI and RBI security directives. You only ever enter your secret UPI PIN inside your bank or official UPI app (such as PhonePe or Google Pay). SplitUPI has zero access to your PIN, OTP, or account password.'
    },
    {
      q: 'Which UPI apps can I use?',
      a: 'SplitUPI works seamlessly with all NPCI-compliant UPI applications including PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, Navi, and official mobile banking apps from HDFC, ICICI, SBI, Axis, and others.'
    },
    {
      q: 'Can I use SplitUPI on iPhone?',
      a: 'Yes! On iOS, you can open UPI deep links or scan the instant QR code displayed on screen with any UPI scanner app on your phone.'
    },
    {
      q: 'What happens if a payment fails?',
      a: 'If a payment fails (e.g., bank server downtime or accidental cancellation), the installment is flagged as Failed. SplitUPI never auto-charges you. You can retry with a single click or switch to an alternate UPI app.'
    },
    {
      q: 'Can I retry a failed payment?',
      a: 'Yes. You can immediately retry using the same app or switch to a different UPI app or bank account without losing your split plan progress.'
    },
    {
      q: 'How are payment statuses verified?',
      a: 'We never trust client-side "I Paid" button clicks alone. Statuses are verified cryptographically via server-to-server payment gateway queries and signed webhook callbacks from our banking switch integration.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-indigo-50/70 via-white to-white">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-300/30 to-violet-300/30 blur-3xl rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Split. Pay. Done.</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Split your UPI payment into{' '}
              <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy underline-offset-8">
                multiple payments.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
              Create a payment plan and authorize each payment securely through your preferred UPI app.
            </p>

            {/* Action Buttons */}
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

            {/* Trust disclaimer */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authorized directly in your UPI app • Zero PIN or card data stored</span>
            </div>
          </div>

          {/* Supported UPI Apps Cards Banner */}
          <div className="mt-14 pt-8 border-t border-slate-200/80">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-600 mb-6">
              Supported With All Major UPI Applications
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {supportedApps.map((app, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center group"
                >
                  <PaymentGatewayIcon 
                    gateway={app.id} 
                    size="md" 
                    className="mb-2 shadow-xs group-hover:scale-105 transition-transform" 
                  />
                  <span className="text-sm font-bold text-slate-800">{app.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">{app.badge}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-600 mt-4 italic">
              *SplitUPI acts as a payment coordinator and does not claim official sponsorship with respective app trademarks.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Live Demo Preview Widget */}
      <section className="py-12 bg-slate-100/60 border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  Interactive Preview
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Example Merchant Payment Plan</h3>
                <p className="text-xs text-slate-500">Merchant: ABC Store • UPI ID: abcstore@upi • Total: ₹5,000</p>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-500 font-medium">Split Structure</span>
                <p className="text-2xl font-extrabold text-slate-900">3 Payments</p>
              </div>
            </div>

            {/* Split Plan Sample Items */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Payment 1 of 3</h4>
                    <p className="text-xs text-emerald-800">Verified via PhonePe • Ref: SUP482910</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">₹1,999.00</span>
                  <span className="block text-[11px] font-bold text-emerald-700">COMPLETED</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Payment 2 of 3</h4>
                    <p className="text-xs text-indigo-700">Ready to authorize in your UPI app</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">₹1,999.00</span>
                    <span className="block text-[11px] font-bold text-indigo-600">UNLOCKED</span>
                  </div>
                  <button
                    onClick={onStartSplit}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    Pay ₹1,999
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Payment 3 of 3</h4>
                    <p className="text-xs text-slate-600">Unlocks after Payment 2 succeeds</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-700">₹1,002.00</span>
                  <span className="block text-[11px] font-bold text-slate-600">LOCKED</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Sum Guarantee: ₹1,999 + ₹1,999 + ₹1,002 = ₹5,000 (Exact 0 paisa rounding)</span>
              <button
                onClick={onStartSplit}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                Create your own split <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Seamless 6-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How SplitUPI Works
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Designed specifically for mobile Indian shoppers and merchants with full UPI security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">
                      0{step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Pillars Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
              Trust & Security
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
              Bank-Grade UPI Authorization
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              SplitUPI never accesses, stores, or handles your confidential payment credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80">
              <Lock className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Zero PIN Collection</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                You enter your UPI PIN strictly within PhonePe, Google Pay, or Paytm. We never ask for or see your PIN.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80">
              <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">Server Status Verification</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Payment success is authenticated via cryptographic banking gateway queries and signed webhook callbacks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80">
              <QrCode className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">QR Sanitization</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Untrusted QR inputs are validated against NPCI URI specifications to eliminate malicious redirects or fraudulent VPAs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80">
              <CheckCircle2 className="w-8 h-8 text-teal-400 mb-4" />
              <h4 className="text-base font-bold text-white mb-2">No Auto-Charges</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every installment requires your explicit in-app authorization. We never configure hidden recurring debits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Questions & Answers
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about using SplitUPI for partial payments.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="text-base font-bold text-slate-900">{faq.q}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Box */}
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-10 text-center text-white shadow-xl shadow-indigo-200">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to split your first UPI payment?</h3>
            <p className="text-indigo-100 text-sm max-w-xl mx-auto mb-6">
              Create your custom installment plan in seconds and pay safely through your favorite UPI app.
            </p>
            <button
              onClick={onStartSplit}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-extrabold text-base hover:bg-slate-50 active:scale-95 transition-transform shadow-md cursor-pointer inline-flex items-center justify-center"
            >
              Start a Split Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
