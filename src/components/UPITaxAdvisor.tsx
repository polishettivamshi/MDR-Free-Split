import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ArrowDownRight, 
  RefreshCw,
  TrendingDown,
  Building2,
  HelpCircle,
  Zap
} from 'lucide-react';
import { UPITaxRule, UPITaxCalculationResult, SplitOptionTaxComparison } from '../types';
import { formatINR } from '../lib/upi';

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
  const [taxConfig, setTaxConfig] = useState<UPITaxRule | null>(null);
  const [taxCalculation, setTaxCalculation] = useState<UPITaxCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Fetch official UPI tax rates from backend
  const fetchTaxConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/upi-taxes');
      const data = await res.json();
      if (data.success && data.data) {
        setTaxConfig(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch upi-taxes, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxConfig();
  }, []);

  // Compute live calculation whenever amount, count, or custom split changes
  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) return;

    const calculateTaxes = async () => {
      try {
        const res = await fetch('/api/v1/upi-taxes/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalAmount,
            numberOfPayments,
            customAmounts: splitAmounts
          })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setTaxCalculation(data.data);
        }
      } catch (e) {
        // Fallback calculation client-side
        const threshold = 2000;
        const rate = 0.01298; // 1.1% + 18% GST = 1.298%
        const singleExceeds = totalAmount > threshold;
        const singleTax = singleExceeds ? Math.round(totalAmount * rate * 100) / 100 : 0;
        
        const installments = splitAmounts.map((amt, idx) => ({
          sequenceNumber: idx + 1,
          amount: amt,
          exceedsThreshold: amt > threshold,
          taxAmount: amt > threshold ? Math.round(amt * rate * 100) / 100 : 0,
          taxRatePercent: amt > threshold ? 1.298 : 0
        }));

        const totalSplitTax = installments.reduce((acc, curr) => acc + curr.taxAmount, 0);
        const splitOptions: SplitOptionTaxComparison[] = [2, 3, 4, 5, 6].map(count => {
          const perInst = Math.round((totalAmount / count) * 100) / 100;
          const isExempt = perInst <= threshold;
          const tax = isExempt ? 0 : Math.round(totalAmount * rate * 100) / 100;
          return {
            splitCount: count,
            perInstallmentAmount: perInst,
            isExempt,
            totalTax: tax,
            savingsVsFull: Math.max(0, Math.round((singleTax - tax) * 100) / 100),
            recommendationNote: isExempt ? '0% Tax Free' : 'Taxable'
          };
        });

        setTaxCalculation({
          totalAmount,
          exemptionThreshold: threshold,
          effectiveTaxRatePercent: 1.298,
          singlePaymentTax: singleTax,
          singlePaymentExceeds: singleExceeds,
          installments,
          totalSplitTax,
          taxSaved: Math.max(0, singleTax - totalSplitTax),
          isFullyExempt: totalSplitTax === 0,
          splitOptions,
          recommendedSplitCount: Math.max(2, Math.min(6, Math.ceil(totalAmount / threshold)))
        });
      }
    };

    calculateTaxes();
  }, [totalAmount, numberOfPayments, splitAmounts]);

  if (!taxCalculation || totalAmount <= 0) return null;

  const threshold = taxCalculation.exemptionThreshold;
  const anyExceeds = taxCalculation.installments.some(i => i.exceedsThreshold);
  const singleExceeds = taxCalculation.singlePaymentExceeds;

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      taxCalculation.isFullyExempt 
        ? 'bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-emerald-500/10 border-emerald-300/80 shadow-xs' 
        : 'bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/10 border-amber-300/80 shadow-xs'
    } ${className}`}>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                UPI Tax & Surcharge Advisor
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider bg-slate-900 text-white">
                NPCI 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live regulation check: Transactions ≤ {formatINR(threshold)} qualify for <strong className="text-emerald-700">0% Surcharge & GST Exemption</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowDetailsModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white/80 hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Tax Slabs</span>
          </button>
        </div>
      </div>

      {/* Dynamic Status Callout */}
      <div className="p-4 sm:p-5 space-y-4">
        {taxCalculation.isFullyExempt ? (
          <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-black text-emerald-900 uppercase tracking-wider text-[11px]">
                  Zero Surcharge Exemption Active
                </span>
                {taxCalculation.taxSaved > 0 && (
                  <span className="font-extrabold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                    Saved {formatINR(taxCalculation.taxSaved)} in UPI taxes
                  </span>
                )}
              </div>
              <p className="text-emerald-800/90 mt-1 leading-relaxed">
                By splitting this {formatINR(totalAmount)} payment into <strong>{numberOfPayments} installments</strong>, every split is at or below the <strong>{formatINR(threshold)}</strong> threshold. You pay <strong>₹0.00</strong> in merchant interchange and GST fees!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-black text-amber-900 uppercase tracking-wider text-[11px]">
                  Installment Above UPI Tax Surcharge Slab
                </span>
                <span className="font-extrabold text-rose-700 bg-white/90 px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                  Est. Tax: {formatINR(taxCalculation.totalSplitTax)}
                </span>
              </div>
              <p className="text-amber-900/90 mt-1 leading-relaxed">
                One or more split installments exceed the <strong>{formatINR(threshold)}</strong> regulatory slab and attract <strong>1.1% interchange + 18% GST (1.30%)</strong>. 
                {taxCalculation.recommendedSplitCount > numberOfPayments && (
                  <span className="block font-bold text-indigo-900 mt-1">
                    💡 Tip: Split by {taxCalculation.recommendedSplitCount} payments to drop all installments below {formatINR(threshold)} and save {formatINR(taxCalculation.singlePaymentTax)}!
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Interactive "Split by 2, 3, 4, 5, or 6" Recommendation Matrix */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
              Compare Tax Impact by Split Count (Click to Apply):
            </label>
            <span className="text-[10px] text-slate-500 font-medium">
              Threshold: ≤ {formatINR(threshold)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {taxCalculation.splitOptions.slice(0, 5).map((opt) => {
              const isCurrent = numberOfPayments === opt.splitCount;
              const isRecommended = opt.splitCount === taxCalculation.recommendedSplitCount && opt.isExempt;

              return (
                <button
                  key={opt.splitCount}
                  type="button"
                  onClick={() => onSelectSplitCount(opt.splitCount)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40 scale-[1.02]'
                      : opt.isExempt
                        ? 'bg-white hover:bg-emerald-50/50 border-emerald-300 text-slate-800 hover:border-emerald-400'
                        : 'bg-white hover:bg-amber-50/50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Recommended badge */}
                  {isRecommended && !isCurrent && (
                    <span className="absolute -top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded-full shadow-2xs">
                      Best Tax Saver
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                      {opt.splitCount} Splits
                    </span>
                    {opt.isExempt ? (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isCurrent ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        0% Tax
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isCurrent ? 'bg-rose-400/20 text-rose-200 border border-rose-300/30' : 'bg-rose-100 text-rose-700'
                      }`}>
                        Taxable
                      </span>
                    )}
                  </div>

                  <div className={`text-xs font-extrabold ${isCurrent ? 'text-indigo-100' : 'text-slate-700'}`}>
                    {formatINR(opt.perInstallmentAmount)}
                    <span className={`text-[10px] font-normal ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}> /split</span>
                  </div>

                  <div className={`text-[10px] mt-1 font-semibold ${
                    isCurrent 
                      ? opt.isExempt ? 'text-emerald-200 font-bold' : 'text-amber-200'
                      : opt.isExempt ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {opt.isExempt ? (
                      opt.savingsVsFull > 0 ? `Saves ${formatINR(opt.savingsVsFull)}` : 'Exempt from tax'
                    ) : (
                      `Est. tax: ${formatINR(opt.totalTax)}`
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Breakdown of Current Selected Installments */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Current Breakdown ({numberOfPayments} Installments):</span>
            <span>Single Full Payment Tax: <strong className="text-slate-700">{formatINR(taxCalculation.singlePaymentTax)}</strong></span>
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
                  <span className="font-bold text-slate-600 block text-[10px] uppercase">
                    Split #{item.sequenceNumber}
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {formatINR(item.amount)}
                  </span>
                </div>
                <div className="text-right">
                  {item.exceedsThreshold ? (
                    <span className="text-[10px] font-bold text-amber-700 block">
                      Tax: {formatINR(item.taxAmount)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> 0% Tax
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Slabs Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Official UPI Surcharge & GST Rules</h4>
                  <p className="text-[11px] text-slate-500">NPCI Circular & Section 9(5) Regulations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">UPI Exemption Threshold:</span>
                  <span className="font-mono font-black text-emerald-700">₹2,000.00</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Transactions ≤ ₹2,000:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">0% Free (Zero Tax)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Base Interchange (&gt; ₹2,000):</span>
                  <span className="font-bold text-slate-900">1.10%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">GST on Processing Fee:</span>
                  <span className="font-bold text-slate-900">18.00%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Effective Surcharge:</span>
                  <span className="font-extrabold text-indigo-700">1.298% (~1.30%)</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">Why SplitUPI saves you money:</h5>
                <p className="text-slate-500 leading-relaxed">
                  When a large purchase (e.g. ₹6,000) is paid in one lump sum, it crosses the ₹2,000 regulatory slab and incurs merchant surcharges. By splitting into 3 payments of ₹2,000 each, every individual transaction qualifies under the statutory exemption threshold, eliminating surcharges entirely.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950">
                <span className="font-bold block mb-0.5">Automated Optimization</span>
                <span>SplitUPI continuously recalculates the optimal number of installments (2, 3, 4, etc.) to keep your transactions inside the 0% surcharge bracket.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
