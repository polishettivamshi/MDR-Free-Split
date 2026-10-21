import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Store, 
  IndianRupee, 
  Edit3, 
  Sliders,
  Sparkles,
  X,
  FileImage,
  QrCode,
  Percent,
  TrendingDown
} from 'lucide-react';
import { parseUPIUri, formatINR } from '../lib/upi';
import { ParsedUPI, SplitPlan } from '../types';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';
import { GoogleAdSlot } from './GoogleAdSlot';
import { CameraQRScanner } from './CameraQRScanner';
import { UPITaxAdvisor } from './UPITaxAdvisor';
import { localStore } from '../lib/localStore';

interface CreateSplitProps {
  onPlanCreated: (plan: SplitPlan) => void;
  onCancel: () => void;
}

export const CreateSplit: React.FC<CreateSplitProps> = ({ onPlanCreated, onCancel }) => {
  // Step 1: Amount & Merchant QR
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountInputStr, setAmountInputStr] = useState<string>('');
  const [qrMethod, setQrMethod] = useState<'scan' | 'upload' | 'manual'>('scan');
   
  // Scan notification state
  const [scanSuccessNotification, setScanSuccessNotification] = useState<{
    merchant: string;
    vpa: string;
    amount?: number;
    note?: string;
  } | null>(null);

  // Decoded merchant information (unpopulated until scan/input)
  const [parsedUPI, setParsedUPI] = useState<ParsedUPI>({
    pa: '',
    pn: '',
    am: undefined,
    cu: 'INR',
    isValid: false,
    validationErrors: []
  });
  const [merchantConfirmed, setMerchantConfirmed] = useState<boolean>(false);

  // Step 2: Split configuration
  const [numberOfPayments, setNumberOfPayments] = useState<number>(3);
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Calculate equal splits with remainder handled on final installment
  const computeEqualSplits = (total: number, count: number): number[] => {
    if (count <= 0 || total <= 0) return [];
    const base = Math.floor((total / count) * 100) / 100;
    const result: number[] = [];
    let running = 0;
    for (let i = 0; i < count - 1; i++) {
      result.push(base);
      running += base;
    }
    const last = Math.round((total - running) * 100) / 100;
    result.push(last);
    return result;
  };

  // MDR calculation per 2026 UPI framework: 0.4% above ₹2,000, capped at ₹300 for ₹75,000+
  const THRESHOLD = 2000;
  const RATE = 0.004;
  const MDR_CAP = 300;
  const MDR_CAP_THRESHOLD = 75000;
  function computeMDR(amount: number): number {
    if (amount <= THRESHOLD) return 0;
    const tax = amount * RATE;
    return amount >= MDR_CAP_THRESHOLD ? MDR_CAP : Math.round(tax * 100) / 100;
  }

  // Keep splits updated when total or count changes (if equal mode)
  useEffect(() => {
    if (splitMode === 'equal') {
      setSplitAmounts(computeEqualSplits(totalAmount, numberOfPayments));
    }
  }, [totalAmount, numberOfPayments, splitMode]);

  // Image Upload Parser
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data) {
            handleScannedData(code.data);
          } else {
            setApiError('No readable UPI QR code was detected in this image. Please try another image or enter UPI ID manually.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleScannedData = (rawText: string, preParsed?: ParsedUPI) => {
    const parsed = preParsed || parseUPIUri(rawText);
    setParsedUPI(parsed);
    if (parsed.isValid) {
      setApiError(null);
      setMerchantConfirmed(true);
      if (parsed.am && parsed.am > 0) {
        setTotalAmount(parsed.am);
        setAmountInputStr(parsed.am.toString());
      }
      setScanSuccessNotification({
        merchant: parsed.pn || 'Verified Merchant',
        vpa: parsed.pa,
        amount: parsed.am,
        note: parsed.tn
      });
      // Switch to manual mode so user can review the verified details
      setQrMethod('manual');
    } else {
      setApiError(parsed.validationErrors.join(', '));
    }
  };

  // Sum check
  const currentSplitSum = splitAmounts.reduce((a, b) => a + Number(b), 0);
  const remainingDifference = Math.round((totalAmount - currentSplitSum) * 100) / 100;
  const isSplitValid = Math.abs(remainingDifference) === 0 && totalAmount > 0;

  // Handle amount change
  const handleAmountInputChange = (val: string) => {
    setAmountInputStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setTotalAmount(parsed);
    }
  };

  // Handle custom installment amount edit
  const handleCustomAmountChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const updated = [...splitAmounts];
    updated[index] = num;
    setSplitAmounts(updated);
  };

  // Create Split Plan Submission (client-side localStorage storage)
  const handleSubmitPlan = async () => {
    if (!isSplitValid) {
      setApiError('The sum of all split amounts must match the total amount exactly.');
      return;
    }
    if (!parsedUPI.pa || !parsedUPI.isValid) {
      setApiError('Please provide and confirm a valid merchant UPI ID.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const numSplits = numberOfPayments < 2 ? 2 : numberOfPayments;
      const plan = localStore.createPlan({
        merchantName: parsedUPI.pn || 'Merchant Store',
        merchantVpa: parsedUPI.pa,
        totalAmount,
        numberOfPayments: numSplits,
        items: splitAmounts.map((amt, idx) => ({
          id: 'item_' + Math.random().toString(36).slice(2, 14),
          splitPlanId: 'temp',
          sequenceNumber: idx + 1,
          amount: amt,
          status: idx === 0 ? 'NOT_STARTED' : 'LOCKED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      });

      onPlanCreated(plan);
    } catch (err: any) {
      setApiError('Failed to create split plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Header Card */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 flex items-center gap-1 cursor-pointer"
        >
          ← Back to overview
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Live UPI Tax Engine
          </span>
          <span className="text-xs text-slate-400">• Step 1 of 2</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Scan & Split UPI
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Scan any merchant QR code to see the current UPI tax percentage on that amount. Split the amount into installments to eliminate surcharges with 0% tax exemption.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Validation Notice</h4>
            <p className="text-rose-700 text-xs mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {/* Section 1: Merchant UPI QR Scanner */}
        <div className="p-6 sm:p-8">
          {/* Scan Success Banner */}
          {scanSuccessNotification && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                      Merchant QR Scanned & Details Pre-filled!
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded-full">
                      Auto-filled
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    {scanSuccessNotification.merchant}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800 text-[11px]">
                      {scanSuccessNotification.vpa}
                    </span>
                    {scanSuccessNotification.amount && (
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                        Bill: {formatINR(scanSuccessNotification.amount)}
                      </span>
                    )}
                    {scanSuccessNotification.note && (
                      <span className="text-slate-500 italic text-[11px]">
                        "{scanSuccessNotification.note}"
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setQrMethod('scan')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 hover:border-indigo-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan Again
                </button>
                <button
                  type="button"
                  onClick={() => setScanSuccessNotification(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Scan Merchant UPI QR Code
              </label>
              <p className="text-xs text-slate-500">
                Point your camera at any merchant counter QR or upload an image to pre-fill details.
              </p>
            </div>

            {/* QR Method Tabs */}
            <div className="flex w-full sm:w-auto p-1 bg-slate-100 rounded-xl text-xs font-bold sm:flex-nowrap flex-wrap">
              <button
                id="qr-tab-scan-btn"
                type="button"
                onClick={() => setQrMethod('scan')}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-2 sm:py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] sm:min-h-auto flex items-center justify-center gap-1.5 ${
                  qrMethod === 'scan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Scan Camera</span>
                <span className="inline sm:hidden">Scan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <button
                id="qr-tab-upload-btn"
                type="button"
                onClick={() => setQrMethod('upload')}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-2 sm:py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] sm:min-h-auto flex items-center justify-center gap-1.5 ${
                  qrMethod === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload QR</span>
                <span className="inline sm:hidden">Upload</span>
              </button>
              <button
                id="qr-tab-manual-btn"
                type="button"
                onClick={() => setQrMethod('manual')}
                className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-2 sm:py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] sm:min-h-auto flex items-center justify-center gap-1.5 ${
                  qrMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manual Input</span>
                <span className="inline sm:hidden">Manual</span>
              </button>
            </div>
          </div>

          {/* Camera Scan Mode */}
          {qrMethod === 'scan' && (
            <div className="mb-4">
              <CameraQRScanner
                onScan={(raw, parsed) => handleScannedData(raw, parsed)}
                onClose={() => setQrMethod('manual')}
              />
            </div>
          )}

          {/* Upload Mode */}
          {qrMethod === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 mb-4">
              <input
                id="qr-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="qr-image-file-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Click to upload merchant QR screenshot or image
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WEBP from PhonePe, GPay, Paytm, or billing counter
                </span>
              </label>
            </div>
          )}

          {/* Manual Input Mode */}
          {qrMethod === 'manual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Merchant UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  value={parsedUPI.pa}
                  onChange={(e) => {
                    const text = e.target.value;
                    const parsed = parseUPIUri(text);
                    setParsedUPI({ ...parsed, pa: text, pn: parsedUPI.pn });
                  }}
                  placeholder="e.g. abcstore@icici"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Merchant Display Name
                </label>
                <input
                  type="text"
                  value={parsedUPI.pn}
                  onChange={(e) => setParsedUPI({ ...parsedUPI, pn: e.target.value })}
                  placeholder="e.g. ABC Store"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Decoded Merchant Information Confirmation Card */}
          {parsedUPI.pa ? (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Decoded Merchant Information
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  VPA Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Merchant:</span>
                  <p className="font-bold text-slate-900">{parsedUPI.pn || 'Merchant Store'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">UPI ID:</span>
                  <p className="font-mono font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {parsedUPI.pa}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
                  <p className="font-extrabold text-indigo-600">{formatINR(totalAmount)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50/80 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-400" />
                <span>No merchant scanned yet. Scan any UPI QR above or enter UPI ID manually.</span>
              </div>
              <button
                type="button"
                onClick={() => setQrMethod('manual')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Enter manually →
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Total Payment Amount & Live UPI Tax on this Scanned Amount */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Total Payment Amount
            </label>
            <span className="text-xs font-medium text-slate-500">
              Auto-filled from QR or edit manually
            </span>
          </div>
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
              ₹
            </span>
            <input
              id="split-total-amount-input"
              type="number"
              step="1"
              min="10"
              max="500000"
              value={amountInputStr}
              onChange={(e) => handleAmountInputChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-2xl font-black text-slate-900 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="5000"
            />
          </div>

          {/* Quick preset amount chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[1999, 2500, 5000, 10000, 25000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setTotalAmount(amt);
                  setAmountInputStr(amt.toString());
                }}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                  totalAmount === amt
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Live Full-Payment UPI Tax Percentage Banner for this Amount */}
          {(() => {
            if (totalAmount <= 0) {
              return (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-slate-500 text-xs flex items-center gap-2.5">
                  <Percent className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Scan any merchant QR code or enter your payment amount above to view live NPCI UPI tax calculations.</span>
                </div>
              );
            }
            const singleExceeds = totalAmount > THRESHOLD;
            const singleTax = computeMDR(totalAmount);
            return (
              <div className={`mt-4 p-4 rounded-xl border transition-all ${
                singleExceeds
                  ? 'bg-amber-50/90 border-amber-300/80 text-amber-950'
                  : 'bg-emerald-50/90 border-emerald-300/80 text-emerald-950'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 mt-0.5 shadow-2xs ${
                      singleExceeds ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}>
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Current UPI Tax on {formatINR(totalAmount)} (Full Single Payment):
                        </span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          singleExceeds
                            ? 'bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                        }`}>
                          {singleExceeds ? `0.40% Taxable MDR (~${formatINR(singleTax)})` : '0.00% Zero MDR (₹0.00)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {singleExceeds ? (
                          <>
                            Under the 2026 UPI MDR framework, merchant transactions above ₹2,000 incur <strong>0.4% MDR (capped at ₹300 for ₹75,000+)</strong>. MDR is paid by the merchant, not the customer.
                            <span className="block text-indigo-700 font-bold mt-0.5">
                              ⚡ Split this bill into installments below to bring each installment ≤ ₹2,000 and keep it tax-free!
                            </span>
                          </>
                        ) : (
                          <>
                            This amount is ≤ ₹2,000, which qualifies for <strong>0% MDR Exemption</strong> under UPI rules.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section 3: Split Configuration & Tax on Split Amounts */}
        <div className="p-6 sm:p-8">
          {/* Live UPI Tax & Surcharge Advisor (NPCI Regulations) */}
          <div className="mb-6">
            <UPITaxAdvisor
              totalAmount={totalAmount}
              numberOfPayments={numberOfPayments}
              splitAmounts={splitAmounts}
              onSelectSplitCount={(count) => setNumberOfPayments(count)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Number of Payments
              </label>
              <p className="text-xs text-slate-500">Choose how many installments you want to create (adjust to optimize taxes).</p>
            </div>

            {/* Split Mode Selector */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  splitMode === 'equal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('custom')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  splitMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Custom Amounts
              </button>
            </div>
          </div>

          {/* Payment Count Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 mb-6">
            {[2, 3, 4, 5, 6, 8, 10, 12].map((count) => {
              const perSplit = totalAmount / count;
              const isExempt = perSplit <= THRESHOLD;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumberOfPayments(count)}
                  className={`py-2 px-1 sm:px-1.5 rounded-lg text-center border font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px] sm:min-h-[52px] flex flex-col items-center justify-center relative ${
                    numberOfPayments === count
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-[10px] sm:text-xs">{count}x</span>
                  <span className={`text-[8px] sm:text-[9px] font-bold mt-0.5 ${
                    numberOfPayments === count
                      ? isExempt ? 'text-emerald-200' : 'text-amber-200'
                      : isExempt ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {isExempt ? '0% MDR' : 'MDR'}
                  </span>
                </button>
              );
            })}
            {/* Custom Count Stepper */}
            <div className={`p-1 sm:p-1.5 rounded-lg border flex flex-col items-center justify-center min-h-[44px] sm:min-h-[52px] ${numberOfPayments > 12 ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">Custom</span>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(Math.max(2, numberOfPayments - 1))}
                  className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Decrease payments"
                >
                  -
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-900 w-4 sm:w-5 text-center">{numberOfPayments}</span>
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(numberOfPayments + 1)}
                  className="w-5 sm:w-6 h-5 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Increase payments"
                >
                  +
                </button>
              </div>
              <p className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5">
                Max {Math.ceil(totalAmount / THRESHOLD)} for 0% MDR
              </p>
            </div>
          </div>

          {/* Installment Breakdown Items */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Installment Breakdown Preview
              </h4>
              <span className="text-[11px] text-slate-400">
                Threshold: ≤ {formatINR(2000)} = 0% Surcharge
              </span>
            </div>

            {splitAmounts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                <Percent className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No payment amount specified yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Point your camera at a merchant QR above, upload an invoice QR, or enter your bill amount.
                </p>
              </div>
            ) : (
              splitAmounts.map((amt, idx) => {
                const exceedsThreshold = amt > THRESHOLD;
                const instTax = computeMDR(amt);
                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Payment {idx + 1}</span>
                          {exceedsThreshold ? (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              0.40% Taxable MDR (~{formatINR(instTax)})
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 0.00% Zero MDR
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {idx === 0 ? 'Due Immediately' : 'Unlocks sequentially'} • {exceedsThreshold ? 'Exceeds ₹2,000 MDR threshold' : 'Under ₹2,000 MDR-exempt'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      {splitMode === 'custom' ? (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={amt}
                            onChange={(e) => handleCustomAmountChange(idx, e.target.value)}
                            className="w-28 pl-6 pr-2 py-1.5 text-right font-extrabold text-slate-900 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 block">{formatINR(amt)}</span>
                          <span className={`text-[10px] font-extrabold ${exceedsThreshold ? 'text-amber-700' : 'text-emerald-700'}`}>
                            MDR: {exceedsThreshold ? `0.40% (${formatINR(instTax)})` : '₹0.00 (0%)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sum & Balance Guarantee Math Bar (Section 4 Requirement) */}
          <div className={`p-4 rounded-xl border transition-colors ${
            isSplitValid
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/80 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
              <div>
                <span className="text-slate-600">Total: </span>
                <span className="text-slate-900 font-extrabold">{formatINR(totalAmount)}</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-slate-600">Split Sum: </span>
                <span className="text-indigo-700 font-extrabold">{formatINR(currentSplitSum)}</span>
              </div>

              <div>
                <span className="text-slate-600">Remaining: </span>
                <span className={`font-black ${remainingDifference === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {formatINR(remainingDifference)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              <strong>Split Guarantee:</strong> Sum of all split amounts must equal the original amount to 0 paisa precision. Rounding errors are strictly prevented.
            </p>
          </div>

          {/* Supported UPI Gateways Trust Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">Supported with Certified UPI Apps:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <PaymentGatewayIcon gateway="phonepe" size="xs" />
                <span className="text-[11px] font-bold text-slate-700">PhonePe</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <PaymentGatewayIcon gateway="gpay" size="xs" />
                <span className="text-[11px] font-bold text-slate-700">GPay</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <PaymentGatewayIcon gateway="paytm" size="xs" />
                <span className="text-[11px] font-bold text-slate-700">Paytm</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <PaymentGatewayIcon gateway="bhim" size="xs" />
                <span className="text-[11px] font-bold text-slate-700">BHIM</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <PaymentGatewayIcon gateway="cred" size="xs" />
                <span className="text-[11px] font-bold text-slate-700">CRED</span>
              </div>
            </div>
          </div>

          {/* Contextual Sponsored Ad Slot */}
          <GoogleAdSlot placement="compact" />
        </div>

        {/* Action Button Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>

          <button
            id="create-payment-plan-submit-btn"
            type="button"
            disabled={!isSplitValid || isSubmitting || !parsedUPI.pa}
            onClick={handleSubmitPlan}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed min-h-[48px]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Plan...</span>
              </>
            ) : (
              <>
                <span>Review Payment Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
