import React, { useState, useMemo } from 'react';
import {
  Store,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../lib/upi';

export const P2PMMerchantSimulator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [dailyAverage, setDailyAverage] = useState<string>('3000');
  const [workingDays, setWorkingDays] = useState<number>(30);
  const [percentAboveThreshold, setPercentAboveThreshold] = useState<number>(30); // percentage of transactions > 2000

  const dailyNum = useMemo(() => {
    const val = parseFloat(dailyAverage.replace(/[^0-9.]/g, ''));
    return Number.isFinite(val) && val > 0 ? val : 0;
  }, [dailyAverage]);

  const monthlyCollection = useMemo(() => {
    return Math.round(dailyNum * workingDays);
  }, [dailyNum, workingDays]);

  const annualCollection = useMemo(() => {
    return monthlyCollection * 12;
  }, [monthlyCollection]);

  const isExemptP2PM = monthlyCollection <= 100000;

  // Estimated MDR if classified as standard P2M:
  // Volume above ₹2,000 is charged at 0.4% + 18% GST
  const estimatedP2mMonthlyMdr = useMemo(() => {
    if (isExemptP2PM) return 0;
    const taxableVolume = monthlyCollection * (percentAboveThreshold / 100);
    const baseMdr = taxableVolume * 0.004;
    const gst = baseMdr * 0.18;
    return Math.round((baseMdr + gst) * 100) / 100;
  }, [monthlyCollection, percentAboveThreshold, isExemptP2PM]);

  const estimatedP2mAnnualMdr = Math.round(estimatedP2mMonthlyMdr * 12);

  return (
    <div className={`rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-[0_20px_60px_-40px_rgba(17,20,57,0.35)] ${className}`}>
      {/* Title */}
      <div className="border-b border-line pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Small Merchant Tool</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          P2PM Small Merchant Tier &amp; Threshold Checker
        </h2>
        <p className="text-sm text-muted mt-1">
          Estimate whether your shop or service qualifies for 0% MDR under the NPCI ₹1 Lakh monthly receipts rule.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <label htmlFor="daily-upi-input" className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Average Daily UPI Collection (INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-soft">
                ₹
              </span>
              <input
                id="daily-upi-input"
                type="text"
                inputMode="decimal"
                value={dailyAverage}
                onChange={(e) => setDailyAverage(e.target.value)}
                placeholder="3000"
                className="w-full pl-10 pr-4 py-3.5 text-2xl font-black text-ink rounded-2xl border-2 border-line bg-lilac/40 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted mr-1">Typical businesses:</span>
              {[
                { label: 'Tea Stall (₹1.5k/d)', val: '1500' },
                { label: 'Kirana (₹3.5k/d)', val: '3500' },
                { label: 'Bakery (₹6k/d)', val: '6000' },
                { label: 'Clinic (₹15k/d)', val: '15000' }
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDailyAverage(p.val)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-lilac border border-line text-muted hover:border-brand/30 hover:text-ink transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Working Days per Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Operating Days per Month
              </label>
              <span className="text-xs font-bold text-brand bg-brand-soft px-2.5 py-0.5 rounded-full">
                {workingDays} days
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="31"
              value={workingDays}
              onChange={(e) => setWorkingDays(parseInt(e.target.value, 10))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-soft mt-1">
              <span>20 days (Mon-Fri)</span>
              <span>26 days (6-day week)</span>
              <span>30-31 days (All month)</span>
            </div>
          </div>

          {/* Percentage of payments > ₹2000 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Transactions Above ₹2,000 Threshold
              </label>
              <span className="text-xs font-bold text-ink bg-lilac px-2.5 py-0.5 rounded-full border border-line">
                {percentAboveThreshold}% of total volume
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percentAboveThreshold}
              onChange={(e) => setPercentAboveThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-brand cursor-pointer"
            />
            <p className="text-[11px] text-muted mt-1">
              For grocery stores, most payments are under ₹2,000. For apparel or electronics, high-value payments form 60-80% of volume.
            </p>
          </div>
        </div>

        {/* Right Result Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
            isExemptP2PM
              ? 'bg-linear-to-br from-emerald-950 via-[#06241a] to-emerald-900 border-emerald-800 text-white'
              : 'bg-linear-to-br from-[#111439] via-[#1a1f4b] to-[#251f47] border-line text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                Classification Status
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isExemptP2PM
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-amber-500 text-ink shadow-sm'
              }`}>
                {isExemptP2PM ? 'P2PM Tier: 0% MDR' : 'P2M Standard Tier'}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-white/60 block">Projected Monthly UPI Volume</span>
              <span className="text-3xl font-black text-white">
                {formatINR(monthlyCollection)}
              </span>
              <span className="text-xs text-white/50 block mt-0.5">
                Annual volume: ~{formatINR(annualCollection)}
              </span>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">P2PM ₹1L Exemption Ceiling:</span>
                <span className="font-bold text-white">₹1,00,000 / month</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Ceiling Utilization:</span>
                <span className={`font-bold ${monthlyCollection > 100000 ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {((monthlyCollection / 100000) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Estimated Monthly MDR:</span>
                <span className="font-extrabold text-white">
                  {isExemptP2PM ? '₹0.00 (Exempt)' : `~₹${estimatedP2mMonthlyMdr.toLocaleString('en-IN')}`}
                </span>
              </div>
              {!isExemptP2PM && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">Estimated Annual MDR:</span>
                  <span className="font-extrabold text-amber-300">
                    ~₹{estimatedP2mAnnualMdr.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-white/80">
              {isExemptP2PM ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Your monthly receipts are within the ₹1 Lakh limit. Under NPCI rules for small merchants, you remain eligible for 0% MDR.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Exceeding ₹1 Lakh/month for 3 consecutive months may cause payment acquirers to transition you to standard P2M merchant rates (0.4% above ₹2k).
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick link to relevant guide */}
          <div className="p-4 rounded-2xl bg-lilac/70 border border-line flex items-center justify-between text-xs">
            <span className="font-medium text-ink">Read full P2PM &amp; P2M rules guide</span>
            <a
              href="/guides/upi-mdr-small-merchants"
              className="font-bold text-brand flex items-center gap-1 hover:underline"
            >
              <span>View Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
