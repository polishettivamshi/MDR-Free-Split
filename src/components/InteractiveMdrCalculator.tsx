import React, { useState, useMemo } from 'react';
import {
  Calculator,
  CheckCircle2,
  TrendingDown,
  Info,
  ArrowRight,
  HelpCircle,
  CreditCard,
  Building2,
  Wallet,
  Store,
  Layers
} from 'lucide-react';
import { formatINR } from '../lib/upi';

export type PaymentType =
  | 'standard_p2m'
  | 'essential'
  | 'capital_markets'
  | 'p2pm_small'
  | 'rupay_credit'
  | 'ppi_wallet';

interface CategoryOption {
  id: PaymentType;
  title: string;
  badge: string;
  description: string;
  rateLabel: string;
  calcMdr: (amount: number) => { baseMdr: number; isCapped: boolean; capAmount: number; note: string };
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'standard_p2m',
    title: 'Standard Retail (P2M)',
    badge: 'Standard 2026',
    description: 'General shops, supermarkets, electronics & consumer retail.',
    rateLabel: '0% up to ₹2,000 · 0.4% above ₹2k (cap ₹300)',
    icon: Store,
    calcMdr: (amount: number) => {
      if (amount <= 2000) {
        return { baseMdr: 0, isCapped: false, capAmount: 300, note: 'Exempt under ₹2,000 per-transaction threshold' };
      }
      const raw = amount * 0.004;
      if (amount >= 75000 || raw >= 300) {
        return { baseMdr: 300, isCapped: true, capAmount: 300, note: 'Maximum per-transaction cap of ₹300 reached' };
      }
      return { baseMdr: Math.round(raw * 100) / 100, isCapped: false, capAmount: 300, note: '0.4% standard P2M MDR' };
    }
  },
  {
    id: 'essential',
    title: 'Essential Services & Fuel',
    badge: 'Flat Fee',
    description: 'Railways, state utilities, petrol pumps, agriculture inputs.',
    rateLabel: '0% up to ₹2,000 · Flat ₹5 above ₹2,000',
    icon: Building2,
    calcMdr: (amount: number) => {
      if (amount <= 2000) {
        return { baseMdr: 0, isCapped: false, capAmount: 5, note: '0% base MDR for transactions up to ₹2,000' };
      }
      return { baseMdr: 5, isCapped: false, capAmount: 5, note: 'Notified flat fee of ₹5 for essential services' };
    }
  },
  {
    id: 'capital_markets',
    title: 'Capital Markets & Broking',
    badge: '0.02% Rate',
    description: 'Mutual fund investments, stock broking & insurance payments.',
    rateLabel: '0.02% above ₹2,000 · Capped at ₹300',
    icon: TrendingDown,
    calcMdr: (amount: number) => {
      if (amount <= 2000) {
        return { baseMdr: 0, isCapped: false, capAmount: 300, note: 'Exempt under ₹2,000 threshold' };
      }
      const raw = amount * 0.0002;
      if (raw >= 300) {
        return { baseMdr: 300, isCapped: true, capAmount: 300, note: 'Capped at ₹300 maximum' };
      }
      return { baseMdr: Math.round(raw * 100) / 100, isCapped: false, capAmount: 300, note: '0.02% concessional rate' };
    }
  },
  {
    id: 'rupay_credit',
    title: 'RuPay Credit Card on UPI',
    badge: 'Credit Interchange',
    description: 'Payment made using RuPay Credit Card linked via UPI.',
    rateLabel: '0% up to ₹2,000 · ~2% above ₹2k for standard merchants',
    icon: CreditCard,
    calcMdr: (amount: number) => {
      if (amount <= 2000) {
        return { baseMdr: 0, isCapped: false, capAmount: 0, note: 'RBI/NPCI zero-interchange rule on credit up to ₹2,000' };
      }
      const raw = amount * 0.02;
      return { baseMdr: Math.round(raw * 100) / 100, isCapped: false, capAmount: 0, note: 'Standard ~2% credit interchange applicable' };
    }
  },
  {
    id: 'ppi_wallet',
    title: 'Wallet / PPI on UPI',
    badge: 'PPI 1.1%',
    description: 'Prepaid wallets (Paytm, PhonePe Wallet, Amazon Pay) paid to merchant QR.',
    rateLabel: '0% up to ₹2,000 · Up to 1.1% interchange above ₹2,000',
    icon: Wallet,
    calcMdr: (amount: number) => {
      if (amount <= 2000) {
        return { baseMdr: 0, isCapped: false, capAmount: 0, note: 'Zero interchange for wallet payments up to ₹2,000' };
      }
      const raw = amount * 0.011;
      return { baseMdr: Math.round(raw * 100) / 100, isCapped: false, capAmount: 0, note: '1.1% merchant interchange for PPI payments' };
    }
  },
  {
    id: 'p2pm_small',
    title: 'Small Merchant (P2PM)',
    badge: 'P2PM Exempt',
    description: 'Vendors receiving < ₹1 Lakh per month into savings accounts.',
    rateLabel: '0% MDR up to ₹1 Lakh monthly collection',
    icon: Store,
    calcMdr: (_amount: number) => {
      return { baseMdr: 0, isCapped: false, capAmount: 0, note: 'Zero MDR under P2PM tier for receipts up to ₹1 Lakh/month' };
    }
  }
];

const PRESETS = [1500, 2000, 3500, 6000, 12000, 25000, 80000];

export const InteractiveMdrCalculator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [amountInput, setAmountInput] = useState<string>('6000');
  const [selectedCategory, setSelectedCategory] = useState<PaymentType>('standard_p2m');
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const amount = useMemo(() => {
    const val = parseFloat(amountInput.replace(/[^0-9.]/g, ''));
    return Number.isFinite(val) && val > 0 ? val : 0;
  }, [amountInput]);

  const activeCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  // Single payment calculation
  const singleResult = useMemo(() => {
    const res = activeCategory.calcMdr(amount);
    const gst = includeGst ? Math.round(res.baseMdr * 0.18 * 100) / 100 : 0;
    const total = Math.round((res.baseMdr + gst) * 100) / 100;
    return {
      ...res,
      gst,
      total,
      effectiveRate: amount > 0 ? ((total / amount) * 100).toFixed(2) : '0.00'
    };
  }, [amount, activeCategory, includeGst]);

  // Calculate split simulations (2, 3, 4 splits and optimal threshold split)
  const splitSimulations = useMemo(() => {
    if (amount <= 0) return [];

    const configs = [
      { parts: 2, label: '2 Payments' },
      { parts: 3, label: '3 Payments' },
      { parts: 4, label: '4 Payments' }
    ];

    // Also add optimal 2000 threshold if applicable
    if (amount > 2000) {
      const optimalParts = Math.ceil(amount / 2000);
      if (optimalParts > 4 && optimalParts <= 10) {
        configs.push({ parts: optimalParts, label: `${optimalParts} Payments (Zero-MDR Optimal)` });
      }
    }

    return configs.map(({ parts, label }) => {
      const perPart = Math.floor((amount / parts) * 100) / 100;
      const remainder = Math.round((amount - perPart * parts) * 100) / 100;

      let totalBase = 0;
      let allUnderThreshold = true;

      for (let i = 0; i < parts; i++) {
        const itemAmount = i === parts - 1 ? perPart + remainder : perPart;
        const itemMdr = activeCategory.calcMdr(itemAmount);
        totalBase += itemMdr.baseMdr;
        if (itemAmount > 2000) allUnderThreshold = false;
      }

      const gst = includeGst ? Math.round(totalBase * 0.18 * 100) / 100 : 0;
      const total = Math.round((totalBase + gst) * 100) / 100;
      const difference = Math.round((singleResult.total - total) * 100) / 100;

      return {
        parts,
        label,
        perPart,
        totalBase,
        gst,
        total,
        difference,
        allUnderThreshold
      };
    });
  }, [amount, activeCategory, includeGst, singleResult]);

  return (
    <div className={`rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-[0_20px_60px_-40px_rgba(17,20,57,0.35)] ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand-dark text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5 text-brand" />
            <span>Interactive Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            UPI MDR &amp; Split Simulator (2026)
          </h2>
          <p className="text-sm text-muted mt-1">
            Simulate exact base MDR, 18% GST and split installment savings for any transaction.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="btn-secondary text-xs px-3.5 py-2 min-h-10 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand" />
            <span>{showExplanation ? 'Hide Rules' : 'View Rules'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Rules Explainer */}
      {showExplanation && (
        <div className="mt-6 p-5 rounded-2xl bg-lilac/80 border border-brand/20 text-xs sm:text-sm text-ink leading-relaxed space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-brand-dark">
            <Info className="w-4 h-4 text-brand" />
            <span>Official 2026 Framework Principles:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li><strong>MDR is paid by merchants</strong>: Customers are never directly billed for MDR during standard UPI payments.</li>
            <li><strong>₹2,000 Per-Transaction Threshold</strong>: Base MDR is 0% for standard P2M transactions up to ₹2,000.</li>
            <li><strong>0.4% Standard Rate</strong>: Applicable on transaction value above ₹2,000, capped at ₹300 maximum (from ₹75,000).</li>
            <li><strong>P2PM Small Merchant Exemption</strong>: Micro-vendors receiving up to ₹1 Lakh/month enjoy 0% MDR.</li>
            <li><strong>GST</strong>: 18% GST applies to payment gateway/acquiring bank MDR invoices.</li>
          </ul>
        </div>
      )}

      {/* Main Controls Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs: Amount & Category */}
        <div className="lg:col-span-7 space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="interactive-amount-input" className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Transaction Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-soft">
                ₹
              </span>
              <input
                id="interactive-amount-input"
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="6000"
                className="w-full pl-10 pr-4 py-3.5 text-2xl font-black text-ink rounded-2xl border-2 border-line bg-lilac/40 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              />
              {amount > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted bg-white px-2.5 py-1 rounded-lg border border-line">
                  {formatINR(amount)}
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted mr-1">Quick presets:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(preset.toString())}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    amount === preset
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-lilac border border-line text-muted hover:border-brand/30 hover:text-ink'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Merchant Category / Payment Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand-soft/50 ring-2 ring-brand/20 shadow-sm'
                        : 'border-line bg-white hover:border-brand/30 hover:bg-lilac/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-brand text-white' : 'bg-lilac text-muted'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink truncate">{cat.title}</span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{cat.rateLabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GST Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-lilac/60 border border-line">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">Include 18% GST on MDR</span>
              <span className="text-[10px] text-muted">(Standard on bank invoices)</span>
            </div>
            <button
              type="button"
              onClick={() => setIncludeGst(!includeGst)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                includeGst ? 'bg-brand' : 'bg-line'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  includeGst ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Output: Single Payment vs Split Matrix */}
        <div className="lg:col-span-5 space-y-4">
          {/* Single Payment Summary Card */}
          <div className="p-6 rounded-3xl bg-ink text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-brand/30 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Single Payment Estimate
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  singleResult.baseMdr === 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {singleResult.baseMdr === 0 ? '0% MDR Zero Fee' : `${singleResult.effectiveRate}% Effective`}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    ₹{singleResult.total.toFixed(2)}
                  </span>
                  <p className="text-xs text-white/50 mt-1">
                    Base MDR: ₹{singleResult.baseMdr.toFixed(2)}
                    {includeGst && ` + GST: ₹${singleResult.gst.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/40 block">Bill Value</span>
                  <span className="text-sm font-bold text-white/80">{formatINR(amount)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-white/70">
                {singleResult.baseMdr === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-brand-300 shrink-0 mt-0.5" />
                )}
                <span>{singleResult.note}</span>
              </div>
            </div>
          </div>

          {/* Split Installment Comparison */}
          <div className="p-5 rounded-3xl border border-line bg-lilac/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand" />
                Split Installment Simulation
              </span>
              <span className="text-[11px] text-muted">Per-transaction threshold</span>
            </div>

            <div className="space-y-2">
              {splitSimulations.map((sim) => {
                const isZero = sim.total === 0;
                return (
                  <div
                    key={sim.parts}
                    className="p-3.5 rounded-2xl border border-line bg-white flex items-center justify-between gap-3 hover:border-brand/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">{sim.label}</span>
                        {sim.allUnderThreshold && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            0% Threshold
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        {sim.parts} × {formatINR(sim.perPart)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black ${isZero ? 'text-emerald-600' : 'text-ink'}`}>
                        ₹{sim.total.toFixed(2)}
                      </span>
                      {sim.difference > 0 && (
                        <p className="text-[10px] font-bold text-emerald-600 mt-0.5 flex items-center justify-end gap-0.5">
                          <TrendingDown className="w-3 h-3" />
                          -₹{sim.difference.toFixed(2)} MDR
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Link to Start Split */}
            <a
              href="/split"
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 min-h-11 mt-3"
            >
              <span>Open Detailed QR Split Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Small Merchant P2PM Tier Explainer Box */}
      <div className="mt-8 p-5 rounded-2xl bg-brand-soft/40 border border-brand/20">
        <div className="flex items-start gap-3">
          <Store className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-ink">
              Micro-Merchant Exemption Rule (P2PM)
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              Small vendors receiving UPI payments into personal bank accounts via QR are classified as <strong>P2PM</strong>. Under the 2026 framework, P2PM merchants receiving under <strong>₹1,00,000 per month</strong> are exempt from MDR regardless of single transaction sizes. If monthly collections exceed ₹1 Lakh for three consecutive months, acquirers transition them to standard P2M status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
