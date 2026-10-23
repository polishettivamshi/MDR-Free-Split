import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Percent,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingDown
} from 'lucide-react';
import { UPITaxRule, UPITaxCalculationResult, SplitOptionTaxComparison } from '../types';
import { formatINR } from '../lib/upi';

const TAX_CONFIG: UPITaxRule = {
  effectiveDate: '2026-10-15',
  lastUpdated: '2026-10-23',
  authority: 'PIB / NPCI - standard UPI MDR framework (2026)',
  currency: 'INR',
  exemptionThreshold: 2000,
  baseInterchangeRatePercent: 0.4,
  gstRatePercent: 0.0,
  effectiveTaxRatePercent: 0.4,
  mdrCapAmount: 300,
  mdrCapThreshold: 75000,
  categories: [
    {
      id: 'standard_retail',
      name: 'General Retail & E-Commerce',
      mccCodes: ['5311', '5411', '5999', '5732'],
      threshold: 2000,
      interchangePercent: 0.4,
      gstPercent: 0.0,
      effectivePercent: 0.4,
      note: 'MDR of 0.4% applies only to merchant transactions above ₹2,000. Capped at ₹300 for transactions of ₹75,000 and above.'
    },
    {
      id: 'essential_sectors',
      name: 'Essential Sectors (Railways, Telecom, Insurance, Fuel, Agri Inputs)',
      mccCodes: ['4112', '4722', '5541', '5960', '6300'],
      threshold: 2000,
      interchangePercent: 0.0,
      gstPercent: 0.0,
      effectivePercent: 0.0,
      note: 'Flat MDR of ₹5 per transaction above ₹2,000 for essential and thin-margin sectors.'
    },
    {
      id: 'capital_markets',
      name: 'Capital Markets (Mutual Funds, Securities, Stockbrokers)',
      mccCodes: ['6211', '6300'],
      threshold: 2000,
      interchangePercent: 0.02,
      gstPercent: 0.0,
      effectivePercent: 0.02,
      note: 'MDR of 0.02%, capped at ₹300 per transaction.'
    }
  ],
  rules: {
    underThresholdTax: 0,
    description: 'Under the 2026 UPI MDR framework, all person-to-person (P2P) transactions remain completely free irrespective of amount. Person-to-merchant (P2M) transactions up to ₹2,000 remain free of MDR. A nominal MDR of 0.4% applies only to merchant transactions above ₹2,000, capped at ₹300 for transactions of ₹75,000 and above. MDR is paid by the merchant, not the customer.'
  }
};

const THRESHOLD = TAX_CONFIG.exemptionThreshold;
const RATE = TAX_CONFIG.effectiveTaxRatePercent / 100; // 0.004
const MDR_CAP = TAX_CONFIG.mdrCapAmount || 300;
const MDR_CAP_THRESHOLD = TAX_CONFIG.mdrCapThreshold || 75000;

function computeMDR(amount: number): number {
  if (amount <= THRESHOLD) return 0;
  const tax = amount * RATE;
  return amount >= MDR_CAP_THRESHOLD ? MDR_CAP : Math.round(tax * 100) / 100;
}

interface UPITaxAdvisorProps {
  totalAmount: number;
  numberOfPayments: number;
  splitAmounts: number[];
  onSelectSplitCount: (count: number) => void;
  className?: string;
}

export const UPITaxAdvisor: React.FC<UPITaxAdvisorProps> = ({
  totalAmount,
  numberOfPayments,
  splitAmounts,
  onSelectSplitCount,
  className = ''
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const calculateTaxes = (): UPITaxCalculationResult => {
    if (!totalAmount || totalAmount <= 0) {
      return {
        totalAmount: 0,
        exemptionThreshold: THRESHOLD,
        effectiveTaxRatePercent: TAX_CONFIG.effectiveTaxRatePercent,
        singlePaymentTax: 0,
        singlePaymentExceeds: false,
        installments: [],
        totalSplitTax: 0,
        taxSaved: 0,
        isFullyExempt: false,
        splitOptions: [],
        recommendedSplitCount: 2
      };
    }

    const singleExceeds = totalAmount > THRESHOLD;
    const singleTax = computeMDR(totalAmount);

    const installments = splitAmounts.map((amt, idx) => {
      const tax = computeMDR(amt);
      return {
        sequenceNumber: idx + 1,
        amount: amt,
        exceedsThreshold: amt > THRESHOLD,
        taxAmount: tax,
        taxRatePercent: amt > THRESHOLD ? TAX_CONFIG.effectiveTaxRatePercent : 0
      };
    });

    const totalSplitTax = installments.reduce((acc, curr) => acc + curr.taxAmount, 0);
    const taxSaved = Math.max(0, Math.round((singleTax - totalSplitTax) * 100) / 100);
    const isFullyExempt = installments.length > 0 && totalSplitTax === 0;

    const splitOptions: SplitOptionTaxComparison[] = [2, 3, 4, 5, 6].map(count => {
      const perInst = Math.round((totalAmount / count) * 100) / 100;
      const isExempt = perInst <= THRESHOLD;
      const tax = isExempt ? 0 : computeMDR(totalAmount);
      return {
        splitCount: count,
        perInstallmentAmount: perInst,
        isExempt,
        totalTax: tax,
        savingsVsFull: Math.max(0, Math.round((singleTax - tax) * 100) / 100),
        recommendationNote: isExempt ? '0% MDR' : 'MDR applies'
      };
    });

    const minSplitsForExemption = Math.ceil(totalAmount / THRESHOLD);
    const recommendedSplitCount = Math.max(2, Math.min(6, minSplitsForExemption));

    return {
      totalAmount,
      exemptionThreshold: THRESHOLD,
      effectiveTaxRatePercent: TAX_CONFIG.effectiveTaxRatePercent,
      singlePaymentTax: singleTax,
      singlePaymentExceeds: singleExceeds,
      installments,
      totalSplitTax,
      taxSaved,
      isFullyExempt,
      splitOptions,
      recommendedSplitCount
    };
  };

  const taxCalculation = calculateTaxes();

  if (!taxCalculation || totalAmount <= 0) return null;

  const threshold = taxCalculation.exemptionThreshold;

  return (
    <>
      <div className={`rounded-2xl border transition-all duration-300 ${
        taxCalculation.isFullyExempt 
          ? 'bg-linear-to-br from-emerald-500/5 via-teal-500/5 to-emerald-500/10 border-emerald-300/80 shadow-xs'
          : 'bg-linear-to-br from-amber-500/5 via-orange-500/5 to-amber-500/10 border-amber-300/80 shadow-xs'
      } ${className}`}>
      <div className="p-4 sm:p-5 border-b border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            taxCalculation.isFullyExempt 
              ? 'bg-emerald-600 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            {taxCalculation.isFullyExempt ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Percent className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-ink flex items-center gap-1.5">
                MDR Split Guide
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider bg-ink text-white">
                NPCI 2026
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Standard framework check: transactions ≤ {formatINR(threshold)} sit at the <strong className="text-emerald-700">0% base-MDR threshold</strong>.
            </p>
            <p className="text-[11px] font-semibold text-amber-700 mt-1">
              Notified 2026 rate model · NPCI has deferred the start date
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowDetailsModal(true)}
            className="text-sm font-bold text-brand hover:text-brand-dark bg-white/80 hover:bg-white px-4 min-h-12 rounded-full border border-line shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>MDR Rules</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {taxCalculation.isFullyExempt ? (
          <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-black text-emerald-900 uppercase tracking-wider text-[11px]">
                  All installments are at or below the threshold
                </span>
                {taxCalculation.taxSaved > 0 && (
                  <span className="font-extrabold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                    Est. merchant MDR avoided {formatINR(taxCalculation.taxSaved)}
                  </span>
                )}
              </div>
              <p className="text-emerald-800/90 mt-1 leading-relaxed">
                By splitting this {formatINR(totalAmount)} bill into <strong>{numberOfPayments} installments</strong>, every installment is at or below the <strong>{formatINR(threshold)}</strong> threshold. The estimated MDR on these installments is <strong>₹0.00</strong>. MDR, where applicable, is paid by the merchant.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-black text-amber-900 uppercase tracking-wider text-[11px]">
                  One or more installments cross the ₹2,000 threshold
                </span>
                <span className="font-extrabold text-rose-700 bg-white/90 px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                  Est. MDR: {formatINR(taxCalculation.totalSplitTax)}
                </span>
              </div>
              <p className="text-amber-900/90 mt-1 leading-relaxed">
                One or more installments exceed the <strong>{formatINR(threshold)}</strong> threshold and attract <strong>0.4% MDR (capped at ₹300 for ₹75,000+)</strong>. MDR is paid by the merchant, not the customer.
                {taxCalculation.recommendedSplitCount > numberOfPayments && (
                  <span className="block font-bold text-ink mt-1">
                    Tip: choose {taxCalculation.recommendedSplitCount} installments to keep every installment at or below {formatINR(threshold)}.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-brand" />
              Compare MDR by installment count (tap to apply):
            </label>
            <span className="text-[10px] text-muted font-medium">
              Threshold: ≤ {formatINR(threshold)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {taxCalculation.splitOptions.map((opt) => {
              const isCurrent = numberOfPayments === opt.splitCount;
              const isRecommended = opt.splitCount === taxCalculation.recommendedSplitCount && opt.isExempt;

              return (
                <button
                  key={opt.splitCount}
                  type="button"
                  onClick={() => onSelectSplitCount(opt.splitCount)}
                  className={`min-h-28 p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-ink text-white border-ink shadow-md ring-2 ring-brand/25 scale-[1.02]'
                      : opt.isExempt
                        ? 'bg-white hover:bg-emerald-50/50 border-emerald-300 text-ink-soft hover:border-emerald-400'
                        : 'bg-white hover:bg-amber-50/50 border-line text-ink-soft hover:border-amber-300'
                  }`}
                >
                  {isRecommended && !isCurrent && (
                    <span className="absolute -top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                      Lowest-MDR option
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`text-sm font-black ${isCurrent ? 'text-white' : 'text-ink'}`}>
                      {opt.splitCount} Splits
                    </span>
                    {opt.isExempt ? (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isCurrent ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        0% MDR
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isCurrent ? 'bg-rose-400/20 text-rose-200 border border-rose-300/30' : 'bg-rose-100 text-rose-700'
                      }`}>
                        MDR applies
                      </span>
                    )}
                  </div>

                  <div className={`text-sm font-extrabold ${isCurrent ? 'text-white/75' : 'text-muted'}`}>
                    {formatINR(opt.perInstallmentAmount)}
                    <span className={`text-[11px] font-normal ${isCurrent ? 'text-white/50' : 'text-muted-soft'}`}> /split</span>
                  </div>

                  <div className={`text-[11px] mt-1.5 font-semibold ${
                    isCurrent 
                      ? opt.isExempt ? 'text-emerald-200 font-bold' : 'text-amber-200'
                      : opt.isExempt ? 'text-emerald-700' : 'text-muted'
                  }`}>
                    {opt.isExempt ? (
                      opt.savingsVsFull > 0 ? `Est. merchant MDR avoided ${formatINR(opt.savingsVsFull)}` : '0% MDR'
                    ) : (
                      `Est. MDR: ${formatINR(opt.totalTax)}`
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-line/60">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-semibold">Current Breakdown ({numberOfPayments} Installments):</span>
            <span>MDR if paid in one go: <strong className="text-muted">{formatINR(taxCalculation.singlePaymentTax)}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {taxCalculation.installments.map((item) => (
              <div 
                key={item.sequenceNumber}
                className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${
                  item.exceedsThreshold
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                <div>
                  <span className="font-bold text-muted block text-[10px] uppercase">
                    Split #{item.sequenceNumber}
                  </span>
                  <span className="font-extrabold text-ink">
                    {formatINR(item.amount)}
                  </span>
                </div>
                <div className="text-right">
                  {item.exceedsThreshold ? (
                    <span className="text-[10px] font-bold text-amber-700 block">
                      MDR: {formatINR(item.taxAmount)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> 0% MDR
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {showDetailsModal && createPortal(
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Simplified UPI MDR rules"
            className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-5 sm:p-6 shadow-2xl border border-line animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-line">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Percent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-ink">UPI MDR rules — simplified</h4>
                  <p className="text-[11px] text-muted">Notified 2026 base rates · check the start date</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="min-w-11 min-h-11 shrink-0 rounded-full text-muted-soft hover:text-ink-soft hover:bg-lilac flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                aria-label="Close MDR rules"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-muted">
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 leading-relaxed text-amber-900">
                Implementation note: NPCI announced on 13 October 2026 that the
                new MDR on select P2M transactions would begin immediately after
                Diwali at a date to be notified separately. This calculator
                estimates the notified structure; confirm the current start date
                with NPCI or your payment provider.
              </p>
              <div className="p-3 rounded-xl bg-lilac border border-line space-y-2">
                <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5 pb-2 border-b border-line">
                  <span className="font-bold text-muted">UPI Exemption Threshold:</span>
                  <span className="font-mono font-black text-emerald-700">₹2,000.00</span>
                </div>
                <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5 pb-2 border-b border-line">
                  <span className="font-bold text-muted">Transactions ≤ ₹2,000:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">0% base MDR</span>
                </div>
                <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5 pb-2 border-b border-line">
                  <span className="font-bold text-muted">MDR (&gt; ₹2,000):</span>
                  <span className="font-bold text-ink">0.40%</span>
                </div>
                <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5 pb-2 border-b border-line">
                  <span className="font-bold text-muted">MDR Cap (₹75,000+):</span>
                  <span className="font-bold text-ink">₹300 max</span>
                </div>
                <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between gap-1.5">
                  <span className="font-bold text-muted">Who Pays MDR:</span>
                  <span className="font-bold text-ink">Merchant (not customer)</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-ink mb-1">How the ₹2,000 threshold works:</h5>
                <p className="text-muted leading-relaxed">
                  When a large bill (for example ₹6,000) is paid in one go, it crosses the ₹2,000
                  threshold and can attract 0.4% base MDR. Splitting it into 3 installments of
                  ₹2,000 each keeps every installment at or below the standard threshold. This
                  is an estimate: category rates, GST and provider terms may differ, and MDR,
                  where applicable, is paid by the merchant. Confirm any part-payment arrangement
                  with the merchant.
                </p>
                <a
                  href="/guides/upi-mdr-in-2026"
                  className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-brand hover:text-brand-dark hover:underline"
                >
                  Read the full 2026 MDR guide
                </a>
              </div>

              <div className="p-3 rounded-xl bg-brand-soft/80 border border-brand-200 text-ink">
                <span className="font-bold block mb-0.5">Suggested split count</span>
                <span>The guide suggests a practical installment count (2, 3, 4, and so on)
                  that keeps each installment at or below ₹2,000. You can always adjust it.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="min-h-11 px-5 py-2 bg-ink hover:bg-ink-soft text-white font-bold text-xs rounded-full cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>,
      document.body
    )}
    </>
  );
};
