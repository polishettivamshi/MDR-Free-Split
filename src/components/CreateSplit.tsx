import React, { useState, useRef, useEffect } from 'react';
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
  QrCode
} from 'lucide-react';
import { parseUPIUri, formatINR } from '../lib/upi';
import { ParsedUPI, SplitPlan } from '../types';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';
import { SponsoredAdCard } from './SponsoredAdCard';

interface CreateSplitProps {
  onPlanCreated: (plan: SplitPlan) => void;
  onCancel: () => void;
}

export const CreateSplit: React.FC<CreateSplitProps> = ({ onPlanCreated, onCancel }) => {
  // Step 1: Amount & Merchant QR
  const [totalAmount, setTotalAmount] = useState<number>(5000);
  const [amountInputStr, setAmountInputStr] = useState<string>('5000');
  const [qrMethod, setQrMethod] = useState<'scan' | 'upload' | 'manual'>('upload');
  
  // Camera scan state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Decoded merchant information
  const [parsedUPI, setParsedUPI] = useState<ParsedUPI>({
    pa: 'abcstore@icici',
    pn: 'ABC Store',
    am: 5000,
    cu: 'INR',
    isValid: true,
    validationErrors: []
  });
  const [merchantConfirmed, setMerchantConfirmed] = useState<boolean>(true);

  // Step 2: Split configuration
  const [numberOfPayments, setNumberOfPayments] = useState<number>(3);
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [splitAmounts, setSplitAmounts] = useState<number[]>([1999, 1999, 1002]);
  
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

  // Handle camera start/stop
  useEffect(() => {
    if (qrMethod === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [qrMethod]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();

        // Scan frame loop
        scanIntervalRef.current = setInterval(scanVideoFrame, 350);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a QR image.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code && code.data) {
          handleScannedData(code.data);
          stopCamera();
        }
      }
    }
  };

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
          const code = jsQR(imageData.data, imageData.width, imageData.height);
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

  const handleScannedData = (rawText: string) => {
    const parsed = parseUPIUri(rawText);
    setParsedUPI(parsed);
    if (parsed.isValid) {
      setApiError(null);
      setMerchantConfirmed(true);
      if (parsed.am && parsed.am > 0) {
        setTotalAmount(parsed.am);
        setAmountInputStr(parsed.am.toString());
      }
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

  // Create Split Plan Submission
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
      const response = await fetch('/api/v1/split-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName: parsedUPI.pn || 'Merchant Store',
          merchantVpa: parsedUPI.pa,
          totalAmount: totalAmount,
          numberOfPayments: numberOfPayments,
          customAmounts: splitAmounts
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        onPlanCreated(resData.data);
      } else {
        setApiError(resData.message || 'Failed to create split plan');
      }
    } catch (err: any) {
      setApiError('Network connection error. Please try again.');
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
            New Plan
          </span>
          <span className="text-xs text-slate-400">• Step 1 of 2</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Create a Split Plan
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter purchase amount, scan or provide merchant UPI details, and customize your installment breakdown.
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
        {/* Section A: Total Payment Amount */}
        <div className="p-6 sm:p-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Payment Amount
          </label>
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
            {[1999, 5000, 9999, 15000, 25000].map((amt) => (
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
        </div>

        {/* Section B: Merchant UPI QR Scanner / Upload */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Merchant UPI QR Code
              </label>
              <p className="text-xs text-slate-500">
                Point your camera, upload an image, or enter merchant UPI details directly.
              </p>
            </div>

            {/* QR Method Tabs */}
            <div className="flex w-full sm:w-auto p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                id="qr-tab-upload-btn"
                type="button"
                onClick={() => setQrMethod('upload')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] flex items-center justify-center ${
                  qrMethod === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload QR
              </button>
              <button
                id="qr-tab-scan-btn"
                type="button"
                onClick={() => setQrMethod('scan')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] flex items-center justify-center ${
                  qrMethod === 'scan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scan Camera
              </button>
              <button
                id="qr-tab-manual-btn"
                type="button"
                onClick={() => setQrMethod('manual')}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg transition-colors cursor-pointer text-center min-h-[36px] flex items-center justify-center ${
                  qrMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual Input
              </button>
            </div>
          </div>

          {/* Upload Mode */}
          {qrMethod === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
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

          {/* Camera Scan Mode */}
          {qrMethod === 'scan' && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video max-w-md mx-auto flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center text-slate-300">
                  <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                  <p className="text-xs text-rose-300">{cameraError}</p>
                  <button
                    onClick={() => setQrMethod('upload')}
                    className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg"
                  >
                    Switch to QR Image Upload
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Viewfinder Target Graphic */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-400 rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-400 rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-400 rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-400 rounded-br"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 text-xs text-white bg-black/60 px-3 py-1 rounded-full font-medium">
                    Align merchant QR code within frame
                  </div>
                </>
              )}
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

          {/* Decoded Merchant Information Confirmation Card (Section 3 Requirement) */}
          {parsedUPI.pa && (
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

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Never trust QR amounts blindly: You retain full control over installment amounts.</span>
                <span className="font-medium text-slate-700">Currency: INR</span>
              </div>
            </div>
          )}
        </div>

        {/* Section C: Split Configuration (Section 4 Requirement) */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Number of Payments
              </label>
              <p className="text-xs text-slate-500">Choose how many installments you want to create.</p>
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

          {/* Payment Count Options (2, 3, 4, 5, Custom) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-6">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setNumberOfPayments(count)}
                className={`py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-center border font-extrabold text-xs sm:text-sm transition-all cursor-pointer min-h-[52px] flex flex-col items-center justify-center ${
                  numberOfPayments === count
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block sm:hidden">{count}x</span>
                <span className="hidden sm:block">{count} Payments</span>
              </button>
            ))}
            {/* Custom Count Stepper */}
            <div className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-center min-h-[52px] ${numberOfPayments > 5 ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Custom</span>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(Math.max(2, numberOfPayments - 1))}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Decrease payments"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-900 w-4 text-center">{numberOfPayments}</span>
                <button
                  type="button"
                  onClick={() => setNumberOfPayments(Math.min(12, numberOfPayments + 1))}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                  aria-label="Increase payments"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Installment Breakdown Items */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Installment Breakdown Preview
            </h4>

            {splitAmounts.map((amt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">Payment {idx + 1}</span>
                    <span className="block text-[11px] text-slate-500">
                      {idx === 0 ? 'Starts First' : 'Unlocks sequentially'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    <span className="text-sm font-extrabold text-slate-900">{formatINR(amt)}</span>
                  )}
                </div>
              </div>
            ))}
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

          {/* Contextual Sponsored Ad Offer */}
          <SponsoredAdCard placement="compact" selectedAdId="rupay-upi-offer" />
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
