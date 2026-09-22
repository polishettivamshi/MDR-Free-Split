import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Lock, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  RefreshCw, 
  Store, 
  ShieldCheck, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  Info,
  SlidersHorizontal,
  X,
  FileText
} from 'lucide-react';
import { formatINR } from '../lib/upi';
import { SplitPlan, SplitItem, Payment, UPIApp } from '../types';
import { generateReceiptPDF } from '../lib/pdfReceipt';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';
import { SponsoredAdCard } from './SponsoredAdCard';

interface PaymentPlanViewProps {
  planId: string;
  onSplitCompleted?: () => void;
  onBackToDashboard?: () => void;
}

export const PaymentPlanView: React.FC<PaymentPlanViewProps> = ({ 
  planId, 
  onSplitCompleted,
  onBackToDashboard 
}) => {
  const [plan, setPlan] = useState<SplitPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Supported UPI apps list fetched from backend
  const [upiApps, setUpiApps] = useState<UPIApp[]>([]);

  // Active payment state
  const [activeItem, setActiveItem] = useState<SplitItem | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [activeDeepLink, setActiveDeepLink] = useState<string>('');
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState<string>('');

  // Modal views: 'choose_app' | 'waiting' | 'success' | 'failed' | 'receipt' | null
  const [paymentModalState, setPaymentModalState] = useState<'choose_app' | 'waiting' | 'success' | 'failed' | 'receipt' | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('phonepe');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Downloadable PDF Summary Receipt generator
  const handleDownloadReceiptPDF = () => {
    if (!plan) return;
    try {
      setIsGeneratingPDF(true);
      generateReceiptPDF(plan, items);
    } catch (err) {
      console.error('Failed to generate PDF summary receipt:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Polling state
  const pollingTimerRef = useRef<any>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [pollingStatusMsg, setPollingStatusMsg] = useState<string>('Contacting banking switch...');

  // Fetch plan details
  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/v1/split-plans/${planId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPlan(data.data);
      } else {
        setError(data.message || 'Failed to fetch split plan');
      }
    } catch {
      setError('Network error fetching split plan details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch UPI apps list
  useEffect(() => {
    fetch('/api/v1/upi-apps')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setUpiApps(d.data);
      })
      .catch(console.error);

    fetchPlan();
  }, [planId]);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, []);

  // When deep link is generated, create QR for desktop fallback
  useEffect(() => {
    if (activeDeepLink) {
      QRCode.toDataURL(activeDeepLink, { width: 240, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setPaymentQrDataUrl(url))
        .catch(console.error);
    }
  }, [activeDeepLink]);

  // Trigger celebration confetti when split is 100% completed
  useEffect(() => {
    if (plan && plan.status === 'COMPLETED') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [plan?.status]);

  // Start payment for a split item
  const handleInitiatePayment = async (item: SplitItem, chosenApp?: string) => {
    setIsProcessing(true);
    setError(null);
    const appId = chosenApp || selectedAppId;

    try {
      // Enforce Idempotency Key header
      const idempotencyKey = `idemp_${item.id}_${Date.now()}`;

      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          splitItemId: item.id,
          upiApp: appId
        })
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        setActiveItem(item);
        setActivePayment(resData.data.payment);
        setActiveDeepLink(resData.data.deepLink);
        setPaymentModalState('choose_app');
      } else {
        setError(resData.message || 'Could not initiate payment');
      }
    } catch {
      setError('Network communication failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Launch UPI App Deep Link & switch to "Waiting for Payment" state (Section 10)
  const handleOpenUPIApp = (overrideAppId?: string) => {
    const appToUse = overrideAppId || selectedAppId;
    setSelectedAppId(appToUse);

    // If mobile, attempt open deep link
    if (activeDeepLink) {
      // In browser/iframe, opening custom scheme may be blocked, but we trigger window.location
      try {
        window.location.href = activeDeepLink;
      } catch (e) {
        console.warn('Direct scheme launch intercepted', e);
      }
    }

    // Move to Waiting modal with controlled interval polling
    setPaymentModalState('waiting');
    startControlledPolling(activePayment?.publicId || activePayment?.id || '');
  };

  // Controlled Interval Polling (2s, 4s, 6s, 10s...) - Section 10
  const startControlledPolling = (paymentPublicId: string) => {
    if (!paymentPublicId) return;
    if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);

    let count = 0;
    setPollCount(0);

    const poll = async () => {
      count++;
      setPollCount(count);
      setPollingStatusMsg(`Awaiting bank authorization... (check ${count})`);

      try {
        const res = await fetch(`/api/v1/payments/${paymentPublicId}/status`);
        const data = await res.json();

        if (data.success && data.data) {
          const updatedPayment = data.data.payment as Payment;
          setActivePayment(updatedPayment);

          if (updatedPayment.status === 'SUCCESS') {
            setPaymentModalState('success');
            fetchPlan(); // refresh items and unlock state
            confetti({ particleCount: 50, spread: 60 });
            return;
          } else if (updatedPayment.status === 'FAILED') {
            setPaymentModalState('failed');
            fetchPlan();
            return;
          }
        }
      } catch (err) {
        console.warn('Status poll glitch', err);
      }

      // Polling schedule: 2s, 4s, 6s, 8s, 10s... up to 15 attempts (~60s)
      if (count < 15) {
        const nextDelay = Math.min(10000, 2000 + count * 1000);
        pollingTimerRef.current = setTimeout(poll, nextDelay);
      } else {
        setPollingStatusMsg('Polling timeout: You can verify manually below.');
      }
    };

    // First check after 2 seconds
    pollingTimerRef.current = setTimeout(poll, 2000);
  };

  // Manual "I've completed the payment" button (Never blindly trusted - calls backend!)
  const handleVerifyPaymentNow = async () => {
    if (!activePayment) return;
    setIsProcessing(true);
    setPollingStatusMsg('Contacting payment switch for confirmation...');

    try {
      const res = await fetch(`/api/v1/payments/${activePayment.publicId}/status`);
      const data = await res.json();
      if (data.success && data.data) {
        const updatedPayment = data.data.payment as Payment;
        setActivePayment(updatedPayment);

        if (updatedPayment.status === 'SUCCESS') {
          setPaymentModalState('success');
          fetchPlan();
          confetti({ particleCount: 60, spread: 65 });
        } else if (updatedPayment.status === 'FAILED') {
          setPaymentModalState('failed');
          fetchPlan();
        } else {
          setPollingStatusMsg('Payment still pending with bank switch. Please wait a moment.');
        }
      }
    } catch {
      setPollingStatusMsg('Verification request error. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retry Payment (Section 12)
  const handleRetryPayment = async () => {
    if (!activePayment) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/v1/payments/${activePayment.publicId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiApp: selectedAppId })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActivePayment(data.data.payment);
        setActiveDeepLink(data.data.deepLink);
        setPaymentModalState('choose_app');
        fetchPlan();
      }
    } catch {
      setError('Failed to reset payment attempt.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Sandbox Developer Simulator for instantaneous testing in AI Studio
  const handleSandboxSimulate = async (mode: 'AUTO_SUCCESS' | 'INSTANT_SUCCESS' | 'SIMULATE_FAILURE' | 'BANK_DOWNTIME') => {
    try {
      await fetch('/api/v1/mock/sandbox-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      // Trigger status check immediately
      if (activePayment) {
        handleVerifyPaymentNow();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Copy payment link
  const copyPaymentLink = () => {
    if (activeDeepLink) {
      navigator.clipboard.writeText(activeDeepLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-700">Loading payment plan...</h3>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Plan Unavailable</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'Split plan was not found.'}</p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const items = plan.items || [];
  const completedCount = items.filter(i => i.status === 'SUCCESS').length;
  const totalCount = items.length;
  const isAllComplete = plan.status === 'COMPLETED' || completedCount === totalCount;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400">
            Plan #{plan.publicId}
          </span>
          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            isAllComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {isAllComplete ? 'COMPLETED' : 'ACTIVE PLAN'}
          </span>
        </div>
      </div>

      {/* Plan Summary Header Card (Section 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Plan
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{plan.merchantName}</h1>
            <p className="text-xs font-mono text-slate-500 mt-0.5">UPI ID: {plan.merchantVpa}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount</span>
            <div className="text-3xl font-black text-slate-900">{formatINR(plan.totalAmount)}</div>
            <span className="text-xs text-indigo-600 font-bold">
              Progress: {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Split Items List (Section 5: Payment 1, Payment 2, Payment 3...) */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          <span>Scheduled Payments</span>
          <span>Sequential Authorization</span>
        </div>

        {items.map((item, idx) => {
          const isSuccess = item.status === 'SUCCESS';
          const isLocked = item.status === 'LOCKED';
          const isFailed = item.status === 'FAILED';
          const isPending = item.status === 'PENDING';
          const isNotStarted = item.status === 'NOT_STARTED';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSuccess
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isLocked
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : 'bg-white border-indigo-200 shadow-sm ring-2 ring-indigo-500/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : isLocked
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {isSuccess ? <Check className="w-5 h-5 stroke-[3]" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">
                        Payment {item.sequenceNumber}
                      </h3>
                      {isSuccess && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          VERIFIED ✓
                        </span>
                      )}
                      {isSuccess && item.payment?.upiApp && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          <PaymentGatewayIcon gateway={item.payment.upiApp} size="xs" />
                          <span className="capitalize">{item.payment.upiApp}</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {isSuccess && item.payment?.transactionReference && (
                        <span>Txn Ref: <span className="font-mono font-medium text-slate-700">{item.payment.transactionReference}</span></span>
                      )}
                      {isLocked && <span>Unlocks automatically after Payment {idx} is verified.</span>}
                      {isNotStarted && <span className="text-indigo-600 font-medium">Ready for authorization inside your UPI app</span>}
                      {isFailed && <span className="text-rose-600 font-medium">Payment was declined. You can retry safely.</span>}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center justify-between sm:block text-left sm:text-right">
                    <span className="text-xs text-slate-400 block sm:hidden">Installment:</span>
                    <span className="text-xl font-black text-slate-900">{formatINR(item.amount)}</span>
                  </div>

                  {/* Payment Button States */}
                  {isNotStarted && (
                    <button
                      id={`pay-installment-${item.sequenceNumber}-btn`}
                      onClick={() => handleInitiatePayment(item)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Pay {formatINR(item.amount)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {isPending && (
                    <button
                      onClick={() => {
                        setActiveItem(item);
                        if (item.payment) setActivePayment(item.payment);
                        setPaymentModalState('waiting');
                        startControlledPolling(item.paymentId || '');
                      }}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resume Status</span>
                    </button>
                  )}

                  {isFailed && (
                    <button
                      onClick={() => {
                        setActiveItem(item);
                        if (item.payment) setActivePayment(item.payment);
                        handleRetryPayment();
                      }}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Payment</span>
                    </button>
                  )}

                  {isLocked && (
                    <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400 py-1">
                      <span>Awaiting step {idx}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Completion Card (Section 13) */}
      {isAllComplete && (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>All Payments Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Split Completed ✓</h2>
              <p className="text-emerald-50 text-sm mt-1">
                Total paid: {formatINR(plan.totalAmount)} across all {totalCount} installments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                id="download-receipt-btn"
                onClick={handleDownloadReceiptPDF}
                disabled={isGeneratingPDF}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-extrabold text-sm hover:bg-emerald-50 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-75"
              >
                <Download className={`w-4 h-4 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download Receipt'}</span>
              </button>
              <button
                id="view-receipt-btn"
                onClick={() => setPaymentModalState('receipt')}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Summary</span>
              </button>
              <button
                id="share-receipt-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `SplitUPI Receipt - ${plan.merchantName}`,
                      text: `Payment plan of ${formatINR(plan.totalAmount)} completed successfully via SplitUPI.`
                    }).catch(() => {});
                  } else {
                    alert(`Receipt link copied: Split plan for ${plan.merchantName} completed.`);
                  }
                }}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                title="Share Receipt"
              >
                <Share2 className="w-4 h-4" />
                <span className="sm:hidden">Share Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Financial Partner Sponsored Banner */}
      <SponsoredAdCard placement="banner" selectedAdId="rupay-upi-offer" className="mb-6" />

      {/* Developer Sandbox Testing Bar (Section 35) */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800">Developer Sandbox Switch:</span>
          <span>Simulate provider responses for review</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSandboxSimulate('INSTANT_SUCCESS')}
            className="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-emerald-700 font-bold border border-slate-200 shadow-2xs"
          >
            Instant Success
          </button>
          <button
            onClick={() => handleSandboxSimulate('SIMULATE_FAILURE')}
            className="px-2.5 py-1 rounded bg-white hover:bg-rose-50 text-rose-700 font-bold border border-slate-200 shadow-2xs"
          >
            Simulate Decline
          </button>
          <button
            onClick={() => handleSandboxSimulate('BANK_DOWNTIME')}
            className="px-2.5 py-1 rounded bg-white hover:bg-amber-50 text-amber-700 font-bold border border-slate-200 shadow-2xs"
          >
            Bank Downtime
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Choose Your UPI App (Section 6 & 7 & 19)        */}
      {/* ========================================================= */}
      {paymentModalState === 'choose_app' && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPaymentModalState(null)}
              className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mobile-First Payment Header (Section 19) */}
            <div className="text-center pt-2 pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                SplitUPI Payment {activeItem.sequenceNumber} of {totalCount}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">{plan.merchantName}</h2>
              <div className="text-3xl font-black text-indigo-600 mt-1">
                {formatINR(activeItem.amount)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">VPA: {plan.merchantVpa}</p>
            </div>

            {/* Choose UPI App Buttons (Section 6) */}
            <div className="py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Choose your UPI app
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {upiApps.map(app => (
                  <button
                    key={app.id}
                    id={`select-upi-app-${app.id}-btn`}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      handleOpenUPIApp(app.id);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center gap-3 cursor-pointer group min-h-[58px]"
                  >
                    <PaymentGatewayIcon 
                      gateway={app.id} 
                      size="sm" 
                      className="shrink-0 group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 leading-tight truncate">{app.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{app.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button
                id="open-upi-app-direct-btn"
                onClick={() => handleOpenUPIApp()}
                className="w-full min-h-[48px] py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open UPI App</span>
              </button>

              {/* Desktop QR Fallback (Section 20) */}
              {paymentQrDataUrl && (
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <span className="text-xs font-bold text-slate-600 block mb-2">
                    Or scan this QR with your UPI app:
                  </span>
                  <div className="inline-block p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <img src={paymentQrDataUrl} alt="UPI Payment QR" className="w-36 h-36 mx-auto" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      onClick={copyPaymentLink}
                      className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer min-h-[36px] px-2"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link copied!' : 'Copy UPI Intent Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Zero PIN Guarantee Note */}
            <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You will enter your UPI PIN inside your official bank app only.</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Waiting for Payment (Section 10)                 */}
      {/* ========================================================= */}
      {paymentModalState === 'waiting' && activeItem && activePayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-200 relative animate-in fade-in duration-150">
            {/* Animated Radar Pulse */}
            <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
              <div className="relative w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-300">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900">Waiting for Payment</h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Complete the payment in your UPI app.
            </p>

            {/* Details Box */}
            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Merchant:</span>
                <span className="font-bold text-slate-900">{plan.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span className="font-extrabold text-indigo-600 text-sm">{formatINR(activeItem.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Txn Reference:</span>
                <span className="font-mono text-slate-700">{activePayment.transactionReference}</span>
              </div>
            </div>

            {/* Live Polling Status Indicator (Section 10) */}
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-700 bg-indigo-50 py-2.5 px-3 rounded-lg font-medium mb-6">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>{pollingStatusMsg}</span>
            </div>

            {/* Buttons (Section 10 Requirement) */}
            <div className="space-y-2.5">
              <button
                id="i-completed-payment-btn"
                onClick={handleVerifyPaymentNow}
                disabled={isProcessing}
                className="w-full min-h-[48px] py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>I've completed the payment</span>
              </button>

              <button
                id="cancel-waiting-payment-btn"
                onClick={() => {
                  if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
                  setPaymentModalState(null);
                }}
                className="w-full min-h-[44px] py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              Security note: SplitUPI verifies real transaction completion via bank switch queries before unlocking the next installment.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Payment Successful ✓ (Section 11)                */}
      {/* ========================================================= */}
      {paymentModalState === 'success' && activeItem && activePayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Payment Successful ✓</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified by bank switch • Encrypted UPI confirmation
            </p>

            {/* Specific Required Fields (Section 11) */}
            <div className="my-6 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span className="font-black text-slate-900">{formatINR(activeItem.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Merchant:</span>
                <span className="font-bold text-slate-900">{plan.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{activePayment.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment number:</span>
                <span className="font-bold text-indigo-600">
                  {activeItem.sequenceNumber} of {totalCount}
                </span>
              </div>
            </div>

            {/* Next Step Action */}
            <button
              onClick={() => {
                setPaymentModalState(null);
                fetchPlan();
              }}
              className="w-full min-h-[48px] py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <span>Continue to Next Installment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Payment Failed (Section 12)                      */}
      {/* ========================================================= */}
      {paymentModalState === 'failed' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">Payment Failed</h2>
            <p className="text-xs text-rose-600 font-medium mt-1">
              {activePayment?.failureReason || 'Transaction was declined by bank or cancelled in UPI app.'}
            </p>

            <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600">
              <span className="font-bold block text-slate-800 mb-1">Common causes:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500">
                <li>Payment declined in UPI app</li>
                <li>UPI app prompt was cancelled</li>
                <li>Bank NPCI server temporarily unavailable</li>
                <li>Transaction request expired</li>
              </ul>
            </div>

            {/* Buttons (Section 12 Requirement) */}
            <div className="space-y-2.5">
              <button
                id="retry-failed-payment-btn"
                onClick={handleRetryPayment}
                className="w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>

              <button
                id="choose-another-upi-app-btn"
                onClick={() => setPaymentModalState('choose_app')}
                className="w-full min-h-[44px] py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                Choose Another UPI App
              </button>

              <button
                onClick={() => setPaymentModalState(null)}
                className="w-full min-h-[44px] py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                Close & Check Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Receipt Modal (Section 13)                       */}
      {/* ========================================================= */}
      {paymentModalState === 'receipt' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPaymentModalState(null)}
              className="absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Printable Card */}
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-black text-slate-900">SplitUPI Official Receipt</h3>
                  <p className="text-xs text-slate-500">Plan Ref: {plan.publicId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    PAID IN FULL
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="py-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Merchant Name:</span>
                  <span className="font-bold text-slate-900">{plan.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Merchant UPI VPA:</span>
                  <span className="font-mono text-slate-700">{plan.merchantVpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Total Amount Settled:</span>
                  <span className="font-black text-indigo-700 text-sm">{formatINR(plan.totalAmount)}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-2 mb-2">
                Itemized Installments
              </h4>

              <div className="divide-y divide-slate-200 text-xs">
                {items.map((it) => (
                  <div key={it.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">Payment {it.sequenceNumber}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Ref: {it.payment?.transactionReference || 'SUP' + it.id.slice(0, 6)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{formatINR(it.amount)}</span>
                      <span className="block text-[10px] font-bold text-emerald-700">SUCCESS ✓</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
                Authorized via NPCI UPI standard protocol • Non-repudiable bank settlement
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
              <button
                id="modal-download-receipt-pdf-btn"
                onClick={handleDownloadReceiptPDF}
                disabled={isGeneratingPDF}
                className="w-full sm:flex-1 min-h-[46px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 transition-all"
              >
                <Download className={`w-4 h-4 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download Receipt (PDF)'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto min-h-[46px] px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Print</span>
              </button>
              <button
                onClick={() => setPaymentModalState(null)}
                className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
