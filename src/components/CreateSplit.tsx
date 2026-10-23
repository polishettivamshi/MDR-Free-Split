import React, { useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Store,
  Edit3,
  X,
  QrCode,
  Percent,
  Loader2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { parseUPIUri, formatINR } from '../lib/upi';
import { ParsedUPI, SplitPlan } from '../types';
import { CameraQRScanner } from './CameraQRScanner';
import { UPITaxAdvisor } from './UPITaxAdvisor';
import { localStore } from '../lib/localStore';
import { decodeQrFromImage } from '../lib/qrImage';
import { usePageMeta } from '../lib/seo';
import { DisclaimerNotice } from './DisclaimerNotice';

interface CreateSplitProps {
  onPlanCreated: (plan: SplitPlan) => void;
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

export const CreateSplit: React.FC<CreateSplitProps> = ({ onPlanCreated }) => {
  usePageMeta({
    title: 'Create a UPI Split Plan — MDR Free Split',
    description:
      'Scan a merchant UPI QR, enter the bill and create a local installment plan. No account, no PIN entry and no payment collection.',
    path: '/split',
    noindex: true
  });

  // Step 1: Amount & Merchant QR
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountInputStr, setAmountInputStr] = useState<string>('');
  const [qrMethod, setQrMethod] = useState<'scan' | 'upload' | 'manual'>('scan');
  const [isReadingQr, setIsReadingQr] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

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
  const handleQrImageFile = async (file: File) => {
    setApiError(null);
    setUploadError(null);

    const looksLikeImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!looksLikeImage) {
      setUploadError('Please choose a PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('This image is larger than 15 MB. Please choose a smaller screenshot.');
      return;
    }

    setIsReadingQr(true);
    try {
      const rawText = await decodeQrFromImage(file);
      if (!rawText) {
        setUploadError('No QR code was found in this image. Make sure the full code is visible and try a clearer screenshot.');
        return;
      }

      const parsed = parseUPIUri(rawText);
      if (!parsed.isValid) {
        const invalidVpa = parsed.validationErrors.some((error) => error.includes('Invalid UPI VPA'));
        const notUpiQr = parsed.validationErrors.some(
          (error) => error.includes('recognized UPI') || error.includes('prohibited external') || error.includes('Malformed UPI')
        );
        setUploadError(
          invalidVpa && !notUpiQr
            ? 'The QR code was read, but its UPI ID is not valid. Please try the original merchant QR.'
            : 'This QR code is not a UPI payment code. Please upload the merchant’s payment QR.'
        );
        return;
      }

      handleScannedData(rawText, parsed);
    } catch {
      setUploadError('This image could not be opened. Please choose a PNG, JPG, or WEBP file.');
    } finally {
      setIsReadingQr(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Allow selecting the same file again after an error.
    e.target.value = '';
    if (file) void handleQrImageFile(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    if (isReadingQr) return;

    const file = e.dataTransfer.files?.[0];
    if (file) void handleQrImageFile(file);
  };

  const handleScannedData = (rawText: string, preParsed?: ParsedUPI) => {
    const parsed = preParsed || parseUPIUri(rawText);
    setParsedUPI(parsed);
    if (parsed.isValid) {
      setApiError(null);
      setUploadError(null);
      if (parsed.am && parsed.am > 0) {
        setTotalAmount(parsed.am);
        setAmountInputStr(parsed.am.toString());
      }
      setScanSuccessNotification({
        merchant: parsed.pn || 'Scanned merchant',
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
    setTotalAmount(!isNaN(parsed) && parsed > 0 ? parsed : 0);
  };

  // Handle custom installment amount edit
  const handleCustomAmountChange = (index: number, val: string) => {
    const num = parseFloat(val);
    const updated = [...splitAmounts];
    updated[index] = Number.isFinite(num) && num > 0 ? Math.round(num * 100) / 100 : 0;
    setSplitAmounts(updated);
  };

  const maxZeroMdrSplits = totalAmount > 0 ? Math.max(2, Math.ceil(totalAmount / THRESHOLD)) : null;

  // Create Split Plan Submission (client-side localStorage storage)
  const handleSubmitPlan = async () => {
    if (!isSplitValid) {
      setApiError('The sum of all split amounts must match the total amount exactly.');
      return;
    }
    if (!parsedUPI.pa || !parsedUPI.isValid) {
      setApiError('Please provide a valid merchant UPI ID.');
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      });

      onPlanCreated(plan);
    } catch {
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
        <a
          href="/"
          className="interactive inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-brand transition-colors duration-200"
        >
          <ArrowRight className="w-3.5 h-3.5 -rotate-180" />
          <span>Back to Home</span>
        </a>
      </div>

      <div className="reveal stagger-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-xs font-bold tracking-wider uppercase border border-brand-100">
            <ShieldCheck className="w-3 h-3" />
            <span>UPI MDR Calculator</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-1">
          Scan & Split UPI
        </h1>
        <p className="text-sm text-muted">
          Scan a merchant QR or enter the details, split the bill into installments, then open each installment in your UPI app.
        </p>
      </div>

      <DisclaimerNotice compact className="mb-8" />

      {/* Error Banner */}
      {apiError && (
        <div className="mb-8 reveal stagger-3">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 mb-0.5">Validation Notice</h4>
              <p className="text-rose-700 text-xs">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-[0_24px_70px_-45px_rgba(17,20,57,0.35)] reveal stagger-4">
        
        {/* Scan Success Banner */}
        {scanSuccessNotification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex flex-wrap items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Merchant Scanned
                </span>
                <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded text-emerald-600 border border-emerald-200">
                  Auto-filled
                </span>
              </div>
              <h4 className="font-bold text-sm text-ink mb-1">{scanSuccessNotification.merchant}</h4>
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span className="max-w-full truncate font-mono font-bold text-ink bg-white px-2 py-0.5 rounded border border-line">
                  {scanSuccessNotification.vpa}
                </span>
                {scanSuccessNotification.amount && (
                  <span className="font-bold text-brand-dark bg-brand-soft px-2 py-0.5 rounded border border-brand-100">
                    Bill: {formatINR(scanSuccessNotification.amount)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex w-full items-center justify-end gap-2 shrink-0 sm:w-auto">
              <button
                onClick={() => setQrMethod('scan')}
                className="text-xs font-bold text-brand hover:text-brand-dark px-2.5 min-h-11 rounded-lg bg-white border border-line hover:border-brand/30 transition-colors flex items-center justify-center"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="ml-1">Scan Again</span>
              </button>
              <button
                onClick={() => setScanSuccessNotification(null)}
                className="min-w-11 min-h-11 rounded-lg text-muted-soft hover:text-muted hover:bg-line-soft transition-colors flex items-center justify-center"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                1. Scan Merchant UPI QR Code
              </label>
              <p className="text-xs text-muted mt-0.5">
                Point your camera or upload an image to pre-fill details.
              </p>
            </div>
          </div>

          {/* QR Method Tabs */}
          <div className="flex p-1 bg-lilac border border-line rounded-2xl text-xs font-bold sm:flex-nowrap flex-wrap gap-1">
            {['scan', 'upload', 'manual'].map((method) => {
              const labels: Record<string, { icon: LucideIcon; label: string }> = {
                scan: { icon: Camera, label: 'Scan Camera' },
                upload: { icon: Upload, label: 'Upload QR' },
                manual: { icon: Edit3, label: 'Manual Input' }
              };
              const { icon: Icon } = labels[method];
              return (
                <button
                  key={method}
                  onClick={() => {
                    setQrMethod(method as 'scan' | 'upload' | 'manual');
                    setUploadError(null);
                    setIsDraggingImage(false);
                  }}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center min-h-11 flex items-center justify-center gap-2 border ${
                    qrMethod === method
                      ? 'bg-white text-brand shadow-sm border-brand/20'
                      : 'text-muted hover:text-ink hover:bg-white/70 border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${qrMethod === method ? 'text-brand' : 'text-muted-soft'}`} />
                  <span className="text-[11px] sm:text-xs">
                    {method === 'manual' ? 'Manual' : method === 'scan' ? 'Scan' : 'Upload'}
                  </span>
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
                className="max-h-100"
              />
            </div>
          )}

          {/* Upload Mode */}
          {qrMethod === 'upload' && (
            <div className="mt-4">
              <label
                htmlFor="qr-image-file-input"
                aria-busy={isReadingQr}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isReadingQr) setIsDraggingImage(true);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setIsDraggingImage(false);
                }}
                onDrop={handleImageDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-colors group focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 ${
                  isReadingQr
                    ? 'cursor-wait border-brand/40 bg-brand-soft/30'
                    : isDraggingImage
                      ? 'cursor-copy border-brand bg-brand-soft/70 shadow-sm'
                      : 'cursor-pointer border-line hover:border-brand-300 hover:bg-brand-soft/50'
                }`}
              >
                <input
                  id="qr-image-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={isReadingQr}
                  className="sr-only"
                />
                <div className={`w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-3 transition-transform ${
                  isReadingQr ? '' : 'group-hover:scale-110'
                }`}>
                  {isReadingQr ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm font-bold ${isReadingQr ? 'text-brand' : 'text-ink-soft group-hover:text-brand'}`}>
                  {isReadingQr ? 'Reading QR code…' : 'Upload a merchant QR image'}
                </span>
                <span className="text-xs text-muted mt-1">
                  {isReadingQr ? 'Looking for a UPI payment code' : isDraggingImage ? 'Drop the image here' : 'Click anywhere or drop a PNG, JPG, or WEBP'}
                </span>
              </label>

              {uploadError && (
                <div role="alert" className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="text-xs font-bold text-rose-900">Couldn’t use that image</p>
                    <p className="text-xs text-rose-700 mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Input Mode */}
          {qrMethod === 'manual' && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Merchant UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={parsedUPI.pa}
                  onChange={(e) => {
                    const text = e.target.value;
                    const parsed = parseUPIUri(text);
                    setParsedUPI({
                      ...parsed,
                      pa: text,
                      isValid: parsed.isValid,
                    });
                    setScanSuccessNotification(null);
                  }}
                  placeholder="e.g. store@upi"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={parsedUPI.pn}
                  onChange={(e) => {
                    setParsedUPI({ ...parsedUPI, pn: e.target.value });
                    setScanSuccessNotification(null);
                  }}
                  placeholder="e.g. ABC Store"
                  className="input-premium"
                />
              </div>
            </div>
          )}

          {/* Decoded Merchant Info */}
          {parsedUPI.pa && (
            <div className="mt-6 p-4 rounded-2xl bg-lilac border border-line">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-brand" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Decoded Merchant Information
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  parsedUPI.isValid
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-rose-700 bg-rose-100'
                }`}>
                  <ShieldCheck className={`w-3 h-3 ${parsedUPI.isValid ? 'text-emerald-600' : 'text-rose-500'}`} />
                  {parsedUPI.isValid ? 'Valid UPI ID format' : 'Check UPI ID format'}
                </span>
              </div>
              {!parsedUPI.isValid && parsedUPI.validationErrors.length > 0 && (
                <p className="mb-3 text-[11px] font-medium text-rose-600">
                  {parsedUPI.validationErrors[0]}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-muted font-medium mb-1">Merchant</span>
                  <p className="font-bold text-ink">{parsedUPI.pn || 'Merchant Store'}</p>
                </div>
                <div>
                  <span className="block text-xs text-muted font-medium mb-1">UPI ID</span>
                  <p className="font-mono font-bold text-ink text-xs truncate">{parsedUPI.pa}</p>
                </div>
                <div>
                  <span className="block text-xs text-muted font-medium mb-1">Total Amount</span>
                  <p className="font-extrabold text-brand">{formatINR(totalAmount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Amount */}
        <div className="mt-10 border-t border-line-soft pt-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                2. Total Bill Amount
              </label>
              <p className="text-xs text-muted mt-0.5">Enter or adjust the bill amount</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-soft">
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
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer min-h-11 flex items-center justify-center ${
                  totalAmount === amt
                    ? 'bg-ink text-white border-ink shadow-md shadow-ink/15'
                    : 'bg-white text-muted border-line hover:bg-lilac hover:border-brand/20'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* MDR banner */}
          <div className={`mt-6 p-5 rounded-2xl border transition-all duration-300 ${
            singleExceeds
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                singleExceeds ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    MDR on a single payment
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    singleExceeds ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {singleExceeds ? 'MDR applies' : '0% MDR'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-ink">{formatINR(singleTax)}</span>
                  <span className="text-xs font-bold text-muted">MDR</span>
                </div>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  {singleExceeds ? (
                    <>
                      Merchant transactions above ₹2,000 attract a base <strong>0.4% MDR</strong> (capped at ₹300 from ₹75,000). Each installment of ₹2,000 or less sits at or below the <strong className="text-emerald-600 font-bold">standard zero-MDR threshold</strong>. Confirm any part-payment arrangement with the merchant.
                    </>
                  ) : (
                    <>
                      This amount is at or below the <strong className="text-emerald-600 font-bold">standard ₹2,000 zero-MDR threshold</strong> for eligible P2M payments. Category and GST rules may differ.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Split Configuration */}
        <div className="mt-10 border-t border-line-soft pt-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                3. Split Configuration
              </label>
              <p className="text-xs text-muted mt-0.5">
                Choose the number of installments. Each ₹2,000 or less sits at the standard zero-MDR threshold.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => setSplitMode('equal')}
              className={`interactive px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-12 border ${
                splitMode === 'equal'
                  ? 'bg-ink text-white border-ink shadow-md shadow-ink/15'
                  : 'text-muted bg-white border-line hover:text-ink hover:border-brand/20'
              }`}
            >
              Equal Split
            </button>
            <button
              onClick={() => setSplitMode('custom')}
              className={`interactive px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-12 border ${
                splitMode === 'custom'
                  ? 'bg-ink text-white border-ink shadow-md shadow-ink/15'
                  : 'text-muted bg-white border-line hover:text-ink hover:border-brand/20'
              }`}
            >
              Custom Amounts
            </button>
            {splitMode === 'custom' && (
              <button
                type="button"
                onClick={() => setSplitAmounts(computeEqualSplits(totalAmount, numberOfPayments))}
                className="text-sm font-bold text-brand hover:text-brand-dark px-4 py-3 rounded-xl bg-brand-soft hover:bg-brand-100 transition-colors min-h-12"
              >
                Reset evenly
              </button>
            )}
          </div>

          {/* Installment count buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-6">
            {[2, 3, 4, 5, 6, 8].map((count) => {
              const perSplit = totalAmount / count;
              const isExempt = perSplit <= THRESHOLD;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumberOfPayments(count)}
                  className={`py-3 px-2 rounded-2xl text-center border transition-all duration-200 cursor-pointer min-h-16 flex flex-col items-center justify-center gap-1 ${
                    numberOfPayments === count
                      ? 'bg-ink text-white border-ink shadow-md shadow-ink/15'
                      : 'bg-white text-muted border-line hover:border-brand/20 hover:text-ink'
                  }`}
                >
                  <span className="text-sm font-black">{count}x</span>
                  <span className={`text-[10px] font-bold ${
                    numberOfPayments === count ? 'text-white/70' : isExempt ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {isExempt ? '0% MDR' : 'MDR'}
                  </span>
                </button>
              );
            })}
            <div className={`col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-6 p-4 rounded-2xl border flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-4 ${numberOfPayments > 8 ? 'border-brand/30 bg-brand-soft' : 'border-line bg-white'}`}>
              <div className="min-w-0 text-left">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Custom installments</span>
                <p className="text-xs text-muted mt-1">
                  {maxZeroMdrSplits ? `Up to ${maxZeroMdrSplits} installments can stay at/below the threshold` : 'Enter an amount to see the recommended count'}
                </p>
              </div>
              <div className="flex items-center justify-between min-[420px]:justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(Math.max(2, numberOfPayments - 1))}
                  aria-label="Decrease number of installments"
                  className="min-w-12 min-h-12 rounded-xl bg-white border border-line text-muted hover:text-ink hover:border-brand/25 font-bold text-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-black text-ink min-w-8 text-center">{numberOfPayments}</span>
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(numberOfPayments + 1)}
                  aria-label="Increase number of installments"
                  className="min-w-12 min-h-12 rounded-xl bg-white border border-line text-muted hover:text-ink hover:border-brand/25 font-bold text-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Live MDR guide */}
          <UPITaxAdvisor
            totalAmount={totalAmount}
            numberOfPayments={numberOfPayments}
            splitAmounts={splitAmounts}
            onSelectSplitCount={setNumberOfPayments}
            className="mb-6"
          />

          {/* Installment Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Installment Breakdown
              </h4>
              <span className="text-[10px] text-muted-soft">
                Standard threshold: ≤ {formatINR(THRESHOLD)} = 0% MDR
              </span>
            </div>

            {splitAmounts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-lilac/50 border border-dashed border-line text-center">
                <QrCode className="w-8 h-8 text-line mx-auto mb-3" />
                <p className="text-sm font-bold text-muted mb-1">Enter amount to see breakdown</p>
                <p className="text-xs text-muted">
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
                    className="group flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-line hover:border-brand/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-ink">Installment {idx + 1}</span>
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
                        <span className="block text-[10px] text-muted mt-0.5">
                          Pay in any order • {exceedsThreshold ? 'Above the ₹2,000 threshold' : 'At or below ₹2,000: 0% MDR'}
                        </span>
                      </div>
                    </div>
                    <div className="flex w-full min-[420px]:w-auto items-center justify-between gap-3 text-right">
                      {splitMode === 'custom' ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amt}
                          onChange={(e) => handleCustomAmountChange(idx, e.target.value)}
                          aria-label={`Installment ${idx + 1} amount`}
                          className="w-24 min-[420px]:w-28 min-h-11 rounded-lg border border-line bg-white px-2 py-1 text-right text-sm font-bold text-ink focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                      ) : (
                        <span className="text-sm font-black text-ink block">{formatINR(amt)}</span>
                      )}
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
                  <span className="text-muted">Total:</span>
                  <span className="text-ink font-extrabold">{formatINR(totalAmount)}</span>
                  <span className="text-muted-soft mx-2">|</span>
                  <span className="text-muted">Split Sum:</span>
                  <span className="text-brand-dark font-extrabold">{formatINR(currentSplitSum)}</span>
                </div>
                <div>
                  <span className="text-muted">Remaining:</span>
                  <span className={`font-black ${remainingDifference === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {formatINR(remainingDifference)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted mt-2">
                <strong className="text-muted">Split Guarantee:</strong> Sum must equal total to 0 paise precision.
              </p>
            </div>
          </div>

          {/* Next step */}
          <div className="mt-6 p-4 rounded-2xl bg-lilac border border-line">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Next step</p>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  Create the plan, then open any installment in PhonePe, Google Pay, Paytm, BHIM, or another UPI app. The amount and merchant UPI ID are filled in for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-line-soft flex flex-col-reverse sm:flex-row gap-4 reveal stagger-5">
          <a
            href="/"
            className="w-full sm:w-auto flex-1 btn-secondary min-h-13 px-8 text-base"
          >
            Cancel
          </a>
          <button
            id="create-split-plan-submit-btn"
            type="button"
            disabled={!isSplitValid || isSubmitting || !parsedUPI.pa || !parsedUPI.isValid}
            onClick={handleSubmitPlan}
            className="w-full sm:w-auto flex-1 btn-primary min-h-13 px-10 text-base"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Plan...</span>
              </>
            ) : (
              <>
                <span>Create Split Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          MDR Free Split only calculates the split and opens a UPI payment link. Pay the
          merchant directly in your UPI app; no PIN is entered or stored here.
        </p>
      </div>
    </div>
  );
};
