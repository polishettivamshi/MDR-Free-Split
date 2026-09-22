import React, { useState } from 'react';
import { ExternalLink, X, Sparkles, Tag, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';

export interface AdOffer {
  id: string;
  sponsor: string;
  title: string;
  description: string;
  promoCode?: string;
  tag: string;
  ctaText: string;
  rewardText: string;
  gatewayType?: string;
}

const DEFAULT_ADS: AdOffer[] = [
  {
    id: 'rupay-upi-offer',
    sponsor: 'RuPay on UPI • NPCI Partner',
    title: 'Link RuPay Credit Card to UPI & Earn ₹250 Cashback',
    description: 'Authorize split installments using your linked RuPay credit card on PhonePe or Google Pay with zero extra charges.',
    promoCode: 'RUPAY250',
    tag: 'Fintech Sponsor',
    ctaText: 'Claim Cashback Offer',
    rewardText: 'Instant ₹250 directly to UPI VPA',
    gatewayType: 'bhim'
  },
  {
    id: 'croma-split-deal',
    sponsor: 'Croma Electronics',
    title: 'Split Electronics & Gadgets over ₹5,000',
    description: 'Shop laptops, audio, and smartphones at Croma and split payment seamlessly across 2 to 4 weekly UPI installments.',
    promoCode: 'CROMA_SPLIT',
    tag: 'Merchant Deal',
    ctaText: 'Explore Partner Deals',
    rewardText: 'Flat 5% Extra Savings',
    gatewayType: 'phonepe'
  },
  {
    id: 'travel-split-deals',
    sponsor: 'MakeMyTrip Holidays',
    title: 'Book Flights & Hotels with SplitUPI Flexibility',
    description: 'Split domestic flight tickets and hotel stays into scheduled installments. No pre-authorizations or hidden interest.',
    promoCode: 'SPLITTRIP',
    tag: 'Travel Sponsor',
    ctaText: 'View Travel Offers',
    rewardText: 'Save up to ₹1,200',
    gatewayType: 'gpay'
  }
];

interface SponsoredAdCardProps {
  placement?: 'banner' | 'compact';
  selectedAdId?: string;
  className?: string;
}

export const SponsoredAdCard: React.FC<SponsoredAdCardProps> = ({
  placement = 'banner',
  selectedAdId,
  className = ''
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeModalAd, setActiveModalAd] = useState<AdOffer | null>(null);

  if (dismissed) return null;

  const currentAd = DEFAULT_ADS.find(a => a.id === selectedAdId) || DEFAULT_ADS[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // 1. Full-Width Responsive Banner (Ideal for Dashboard & Plan Completion)
  if (placement === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 border border-indigo-900/60 shadow-md ${className}`}>
        {/* Ad Tag pill & Dismiss button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
              Ad • Sponsored
            </span>
            <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {currentAd.sponsor}
            </span>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss ad"
            title="Dismiss sponsored offer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 max-w-xl">
            {currentAd.gatewayType && (
              <PaymentGatewayIcon gateway={currentAd.gatewayType} size="md" className="shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                {currentAd.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentAd.description}
              </p>
              {currentAd.promoCode && (
                <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span className="font-mono font-bold text-amber-300">{currentAd.promoCode}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">• {currentAd.rewardText}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModalAd(currentAd)}
              className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>{currentAd.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Offer Modal */}
        {activeModalAd && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setActiveModalAd(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Sponsored Partner Offer
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{activeModalAd.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeModalAd.description}</p>

              {activeModalAd.promoCode && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Promo Code</span>
                    <span className="font-mono font-black text-sm text-indigo-700">{activeModalAd.promoCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(activeModalAd.promoCode!)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {copiedCode === activeModalAd.promoCode ? 'Copied! ✓' : 'Copy Code'}
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Verified SplitUPI Merchant Partner</span>
                <button
                  onClick={() => setActiveModalAd(null)}
                  className="text-slate-600 font-bold hover:underline cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Compact Inline Ad (e.g. for sidebars or step lists)
  if (placement === 'compact') {
    return (
      <div className={`p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-slate-700 relative ${className}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
              Ad
            </span>
            <span className="font-bold text-indigo-900 text-[11px]">{currentAd.sponsor}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="font-semibold text-slate-800 mt-1.5 text-xs">{currentAd.title}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            {currentAd.rewardText}
          </span>
          <button
            onClick={() => setActiveModalAd(currentAd)}
            className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
