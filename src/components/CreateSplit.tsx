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
  Sparkles,
  X,
  QrCode,
  Percent,
  TrendingDown,
  Info
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

const THRESHOLD = 2000;
const RATE = 0.004;
const MDR_CAP = 300;
const MDR_CAP_THRESHOLD = 75000;

function computeMDR(amount: number): number {
  if (amount <= THRESHOLD) return 0;
  const tax = amount * RATE;
  return amount >= MDR_CAP_THRESHOLD ? MDR_CAP : Math.round(tax * 100) / 100;
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

  // Decoded merchant information
  const [parsedUPI, setParsedUPI] = useState<ParsedUPI>({
    pa: '',
    pn: '',
    am: undefined,
    cu: 'INR',
    isValid: false,
    validationErrors: []
  });

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

  const singleTax = computeMDR(totalAmount);
  const singleExceeds = totalAmount > THRESHOLD;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 lg:py-16">
      {/* Back & Header */}
      <div className="mb-10 reveal stagger-1">
        <button
          onClick={onCancel}
          className="interactive inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <ArrowRight className="w-3.5 h-3.5 -rotate-180" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="reveal stagger-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase border border-indigo-100">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero MDR Tax Engine</span>
          </span>
          <span className="text-xs text-slate-400">• Step 1 of 2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
          Scan & Split UPI
        </h1>
        <p className="text-sm text-slate-600">
          Scan any merchant QR code, split the amount into installments under ₹2,000 each to pay 0% MDR tax.
        </p>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="mb-8 reveal stagger-3">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 mb-0.5">Validation Notice</h4>
              <p className="text-rose-700 text-xs">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl reveal stagger-4">
        
        {/* Scan Success Banner */}
        {scanSuccessNotification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Merchant Scanned
                </span>
                <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded text-emerald-600 border border-emerald-200">
                  Auto-filled
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">{scanSuccessNotification.merchant}</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {scanSuccessNotification.vpa}
                </span>
                {scanSuccessNotification.amount && (
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Bill: {formatINR(scanSuccessNotification.amount)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setQrMethod('scan')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 hover:border-indigo-300 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="ml-1">Scan Again</span>
              </button>
              <button
                onClick={() => setScanSuccessNotification(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Merchant QR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Scan Merchant UPI QR Code
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Point your camera or upload an image to pre-fill details.
              </p>
            </div>
          </div>

          {/* QR Method Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold sm:flex-nowrap flex-wrap">
            {['scan', 'upload', 'manual'].map((method) => {
              const labels: Record<string, { icon: any; label: string }> = {
                scan: { icon: Camera, label: 'Scan Camera' },
                upload: { icon: Upload, label: 'Upload QR' },
                manual: { icon: Edit3, label: 'Manual Input' }
              };
              const { icon: Icon, label } = labels[method];
              return (
                <button
                  key={method}
                  onClick={() => setQrMethod(method as 'scan' | 'upload' | 'manual')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer text-center min-h-[38px] sm:min-h-auto flex items-center justify-center gap-2 ${
                    qrMethod === method
                      ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent border'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${qrMethod === method ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={qrMethod === 'manual' && method === 'manual' ? 'block' : 'hidden sm:inline'}>{label}</span>
                  <span className={qrMethod === 'manual' && method === 'manual' ? 'inline sm:hidden' : 'hidden'}>{label === 'Manual Input' ? 'Manual' : label}</span>
                </button>
              );
            })}
          </div>

          {/* Camera Scan Mode */}
          {qrMethod === 'scan' && (
            <div className="mt-4">
              <CameraQRScanner
                onScan={(raw, parsed) => handleScannedData(raw, parsed)}
                onClose={() => setQrMethod('manual')}
                className="max-h-[400px]"
              />
            </div>
          )}

          {/* Upload Mode */}
          {qrMethod === 'upload' && (
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer group">
              <input
                id="qr-image-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                  Upload merchant QR image
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  PNG, JPG, WEBP from any UPI app
                </span>
              </label>
            </div>
          )}

          {/* Manual Input Mode */}
          {qrMethod === 'manual' && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Merchant UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={parsedUPI.pa}
                  onChange={(e) => {
                    const text = e.target.value;
                    const parsed = parseUPIUri(text);
                    setParsedUPI({ ...parsed, pa: text });
                  }}
                  placeholder="e.g. store@upi"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={parsedUPI.pn}
                  onChange={(e) => setParsedUPI({ ...parsedUPI, pn: e.target.value })}
                  placeholder="e.g. ABC Store"
                  className="input-premium"
                />
              </div>
            </div>
          )}

          {/* Decoded Merchant Info */}
          {parsedUPI.pa && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Decoded Merchant Information
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  VPA Verified
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-slate-500 font-medium mb-1">Merchant</span>
                  <p className="font-bold text-slate-900">{parsedUPI.pn || 'Merchant Store'}</p>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 font-medium mb-1">UPI ID</span>
                  <p className="font-mono font-bold text-slate-900 text-xs truncate">{parsedUPI.pa}</p>
                </div>
                <div>
                  <span className="block text-xs text-slate-500 font-medium mb-1">Total Amount</span>
                  <p className="font-extrabold text-indigo-600">{formatINR(totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Amount */}
        <div className="mt-10 border-t border-slate-100 pt-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Total Payment Amount
              </label>
              <p className="text-xs text-slate-500 mt-0.5">Enter or adjust the bill amount</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-300">
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
              className="input-premium pl-12 pr-4 text-3xl font-black"
              placeholder="Enter amount"
            />
          </div>

          {/* Preset chips */}
          <div className="flex flex-wrap gap-2 mt-4">
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
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* MDR Tax Banner */}
          <div className={`mt-6 p-5 rounded-2xl border transition-all duration-300 ${
            singleExceeds
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                singleExceeds ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    MDR on Single Payment
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    singleExceeds ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {singleExceeds ? 'Taxable' : '0% Free'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{formatINR(singleTax)}</span>
                  <span className="text-xs font-bold text-slate-500">MDR</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {singleExceeds ? (
                    <>
                      Merchant transactions above ₹2,000 attract <strong>0.4% MDR</strong> (capped at ₹300 for ₹75,000+). Split this bill into installments ≤ ₹2,000 each to pay <strong className="text-emerald-600 font-bold">₹0 MDR</strong>.
                    </>
                  ) : (
                    <>
                      This amount is ≤ ₹2,000 and qualifies for <strong className="text-emerald-600 font-bold">0% MDR exemption</strong> under NPCI rules.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Split Configuration */}
        <div className="mt-10 border-t border-slate-100 pt-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Split Configuration
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose number of installments. Keep each ≤ ₹2,000 for 0% MDR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSplitMode('equal')}
              className={`interactive px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                splitMode === 'equal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:border-slate-300'
              }`}
            >
              Equal Split
            </button>
            <button
              onClick={() => setSplitMode('custom')}
              className={`interactive px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                splitMode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:border-slate-300'
              }`}
            >
              Custom Amounts
            </button>
          </div>

          {/* Payment count buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {[2, 3, 4, 5, 6, 8].map((count) => {
              const perSplit = totalAmount / count;
              const isExempt = perSplit <= THRESHOLD;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumberOfPayments(count)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all duration-200 cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${
                    numberOfPayments === count
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  <span className="text-[10px] font-bold">{count}x</span>
                  <span className={`text-[8px] font-bold mt-0.5 ${
                    isExempt ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {isExempt ? '0% MDR' : 'MDR'}
                  </span>
                </button>
              );
            })}
            <div className={`p-1 rounded-xl border flex flex-col items-center justify-center min-h-[44px] ${numberOfPayments > 8 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Custom</span>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => setNumberOfPayments(Math.max(2, numberOfPayments - 1))}
                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-900 w-5 text-center">{numberOfPayments}</span>
                <button
                  onClick={() => setNumberOfPayments(numberOfPayments + 1)}
                  className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
              <p className="text-[8px] text-slate-500 mt-1">
                Max {Math.ceil(totalAmount / THRESHOLD)} for 0% MDR
              </p>
            </div>
          </div>

          {/* Installment Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Installment Breakdown
              </h4>
              <span className="text-[10px] text-slate-400">
                Threshold: ≤ {formatINR(THRESHOLD)} = 0% MDR
              </span>
            </div>

            {splitAmounts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 text-center">
                <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 mb-1">Enter amount to see breakdown</p>
                <p className="text-xs text-slate-500">
                  Scan a QR or enter bill amount above.
                </p>
              </div>
            ) : (
              splitAmounts.map((amt, idx) => {
                const exceedsThreshold = amt > THRESHOLD;
                const instTax = computeMDR(amt);
                return (
                  <div
                    key={idx}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-100 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Payment {idx + 1}</span>
                          {exceedsThreshold ? (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                              0.4% MDR
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> 0% MDR
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {idx === 0 ? 'Due Immediately' : 'Unlocks Sequentially'} • {exceedsThreshold ? 'Above ₹2,000 threshold' : 'Under ₹2,000 exempt'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{formatINR(amt)}</span>
                      <span className={`text-[9px] font-bold ${exceedsThreshold ? 'text-amber-700' : 'text-emerald-700'}`}>
                        MDR: {exceedsThreshold ? `0.4% (${formatINR(instTax)})` : '₹0.00 (0%)'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Sum Bar */}
            <div className={`mt-6 p-4 rounded-2xl border transition-all duration-300 ${
              isSplitValid
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Total:</span>
                  <span className="text-slate-900 font-extrabold">{formatINR(totalAmount)}</span>
                  <span className="text-slate-400 mx-2">|</span>
                  <span className="text-slate-600">Split Sum:</span>
                  <span className="text-indigo-700 font-extrabold">{formatINR(currentSplitSum)}</span>
                </div>
                <div>
                  <span className="text-slate-600">Remaining:</span>
                  <span className={`font-black ${remainingDifference === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {formatINR(remainingDifference)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                <strong className="text-slate-700">Split Guarantee:</strong> Sum must equal total to 0 paise precision.
              </p>
            </div>
          </div>

          {/* UPI Gateways */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Authorized via</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['phonepe', 'gpay', 'paytm', 'bhim', 'cred', 'amazonpay', 'navi', 'other'].map((gw) => (
                <div key={gw} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <PaymentGatewayIcon gateway={gw} size="xs" />
                  <span className="text-[10px] font-bold text-slate-700 capitalize">{gw}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Ad Slot */}
        <div className="mt-8 reveal stagger-5">
          <GoogleAdSlot placement="compact" className="mb-6" />
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-4 reveal stagger-5">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto flex-1 btn-secondary min-h-[52px] px-8 text-base"
          >
            Cancel
          </button>
          <button
            id="create-payment-plan-submit-btn"
            type="button"
            disabled={!isSplitValid || isSubmitting || !parsedUPI.pa}
            onClick={handleSubmitPlan}
            className="w-full sm:w-auto flex-1 btn-primary min-h-[52px] px-10 text-base"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Plan...</span>
              </>
            ) : (
              <>
                <span>Create Payment Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
