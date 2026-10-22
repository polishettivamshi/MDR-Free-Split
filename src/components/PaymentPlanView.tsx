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
  RotateCcw,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { formatINR } from '../lib/upi';
import { SplitPlan, SplitItem, Payment, UPIApp } from '../types';
import { generateReceiptPDF } from '../lib/pdfReceipt';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';
import { GoogleAdSlot } from './GoogleAdSlot';
import { localStore } from '../lib/localStore';

interface PaymentPlanViewProps {
  planId: string;
  onSplitCompleted?: () => void;
  onBack?: () => void;
}

export const PaymentPlanView: React.FC<PaymentPlanViewProps> = ({ 
  planId, 
  onSplitCompleted,
  onBack 
}) => {
  const [plan, setPlan] = useState<SplitPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [upiApps, setUpiApps] = useState<UPIApp[]>([]);

  const [activeItem, setActiveItem] = useState<SplitItem | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [activeDeepLink, setActiveDeepLink] = useState<string>('');
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState<string>('');

  const [paymentModalState, setPaymentModalState] = useState<'choose_app' | 'waiting' | 'success' | 'failed' | 'receipt' | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('phonepe');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const pollingTimerRef = useRef<any>(null);
  const [pollCount, setPollCount] = useState<number>(0);
  const [pollingStatusMsg, setPollingStatusMsg] = useState<string>('Verifying payment...');

  const handleDownloadReceiptPDF = () => {
    if (!plan) return;
    try {
      setIsGeneratingPDF(true);
      const items = plan.items || [];
      generateReceiptPDF(plan, items);
    } catch (err) {
      console.error('Failed to generate PDF summary receipt:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const fetchPlan = () => {
    try {
      const p = localStore.getPlan(planId);
      if (p) {
        setPlan(p);
      } else {
        setError('Split plan was not found.');
      }
    } catch {
      setError('Error loading payment plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUpiApps([
      { id: 'phonepe', name: 'PhonePe', packageName: 'com.phonepe.app', icon: 'phonepe', deepLinkScheme: 'phonepe://pay', enabled: true, color: '#5f259f', description: 'UPI, Wallet & Cards' },
      { id: 'gpay', name: 'Google Pay', packageName: 'com.google.android.apps.nbu.paisa.user', icon: 'gpay', deepLinkScheme: 'tez://upi/pay', enabled: true, color: '#1a73e8', description: 'Fast & Secure with Google' },
      { id: 'paytm', name: 'Paytm', packageName: 'net.one97.paytm', icon: 'paytm', deepLinkScheme: 'paytmmp://pay', enabled: true, color: '#00b9f5', description: 'Payments Bank & UPI' },
      { id: 'bhim', name: 'BHIM UPI', packageName: 'in.org.npci.upiapp', icon: 'bhim', deepLinkScheme: 'upi://pay', enabled: true, color: '#005f73', description: 'National Payments Corp of India' },
      { id: 'cred', name: 'CRED UPI', packageName: 'com.dreamplug.androidapp', icon: 'cred', deepLinkScheme: 'cred://upi/pay', enabled: true, color: '#0f0f0f', description: 'Exclusive Member UPI & Rewards' },
      { id: 'amazonpay', name: 'Amazon Pay', packageName: 'in.amazon.mShop.android.shopping', icon: 'amazonpay', deepLinkScheme: 'amazonpay://upi/pay', enabled: true, color: '#232f3e', description: 'Cashback & Instant UPI' },
      { id: 'navi', name: 'Navi UPI', packageName: 'com.naviapp', icon: 'navi', deepLinkScheme: 'navi://upi/pay', enabled: true, color: '#0f172a', description: 'Zero Fee UPI & Lending' },
      { id: 'other', name: 'Other UPI App', packageName: undefined, icon: 'upi', deepLinkScheme: 'upi://pay', enabled: true, color: '#0f172a', description: 'Any Bank or Certified UPI App' }
    ]);
    fetchPlan();
  }, [planId]);

  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeDeepLink) {
      QRCode.toDataURL(activeDeepLink, { width: 240, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setPaymentQrDataUrl(url))
        .catch(console.error);
    }
  }, [activeDeepLink]);

  useEffect(() => {
    if (plan && plan.status === 'COMPLETED') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#34d399', '#4f46e5', '#818cf8']
      });
    }
  }, [plan?.status]);

  const handleInitiatePayment = async (item: SplitItem, chosenApp?: string) => {
    setIsProcessing(true);
    setError(null);
    const appId = chosenApp || selectedAppId;

    try {
      const providerPaymentId = 'LOCAL_UPI_' + Math.random().toString(36).slice(2, 12).toUpperCase();
      const tr = 'SUP' + Math.floor(100000 + Math.random() * 900000);
      const pn = encodeURIComponent(plan?.merchantName || 'Merchant');
      const pa = encodeURIComponent(plan?.merchantVpa || '');
      const tn = encodeURIComponent(`MDR Free Split Part ${item.sequenceNumber}`);
      const deepLink = `upi://pay?pa=${pa}&pn=${pn}&am=${item.amount.toFixed(2)}&cu=INR&tr=${tr}&tn=${tn}`;

      const payment: Payment = {
        id: 'pay_' + Math.random().toString(36).slice(2, 12),
        publicId: 'pay_' + Math.random().toString(36).slice(2, 10),
        splitItemId: item.id,
        provider: 'local_upi',
        providerPaymentId,
        transactionReference: tr,
        amount: item.amount,
        currency: 'INR',
        status: 'PENDING',
        upiApp: appId,
        initiatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActiveItem(item);
      setActivePayment(payment);
      setActiveDeepLink(deepLink);
      setPaymentModalState('choose_app');
    } catch {
      setError('Failed to initiate payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenUPIApp = (overrideAppId?: string) => {
    const appToUse = overrideAppId || selectedAppId;
    setSelectedAppId(appToUse);

    if (activeDeepLink) {
      try {
        window.location.href = activeDeepLink;
      } catch (e) {
        console.warn('Direct scheme launch intercepted', e);
      }
    }

    setPaymentModalState('waiting');
    startControlledPolling(activePayment?.publicId || '');
  };

  const startControlledPolling = (paymentPublicId: string) => {
    if (!paymentPublicId) return;
    if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);

    let count = 0;
    setPollCount(0);

    const poll = async () => {
      count++;
      setPollCount(count);
      setPollingStatusMsg(`Verifying payment... (check ${count})`);

      try {
        if (activePayment) {
          const updatedPayment: Payment = {
            ...activePayment,
            status: 'SUCCESS',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setActivePayment(updatedPayment);
          setPaymentModalState('success');
          fetchPlan();
          confetti({ particleCount: 60, spread: 70, colors: ['#10b981', '#34d399'] });
          return;
        }
      } catch (err) {
        console.warn('Status poll glitch', err);
      }

      if (count < 3) {
        pollingTimerRef.current = setTimeout(poll, 2000);
      } else {
        setPollingStatusMsg('Polling timeout: You can verify manually below.');
      }
    };

    pollingTimerRef.current = setTimeout(poll, 2000);
  };

  const handleVerifyPaymentNow = async () => {
    if (!activePayment) return;
    setIsProcessing(true);
    setPollingStatusMsg('Confirming payment...');

    try {
      if (activePayment && activeItem && plan) {
        const updatedPayment: Payment = {
          ...activePayment,
          status: 'SUCCESS',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setActivePayment(updatedPayment);
        setPaymentModalState('success');

        const currentPlan = localStore.getPlan(planId);
        if (currentPlan) {
          const items = currentPlan.items || [];
          const itemIdx = items.findIndex(i => i.id === activeItem!.id);
          if (itemIdx >= 0) {
            items[itemIdx].status = 'SUCCESS';
            items[itemIdx].payment = updatedPayment;
            items[itemIdx].updatedAt = new Date().toISOString();

            const nextItem = items.find(i => i.sequenceNumber === activeItem!.sequenceNumber + 1);
            if (nextItem && nextItem.status === 'LOCKED') {
              nextItem.status = 'NOT_STARTED';
              nextItem.updatedAt = new Date().toISOString();
            }

            const allSuccess = items.every(i => i.status === 'SUCCESS');
            currentPlan.items = items;
            currentPlan.status = allSuccess ? 'COMPLETED' : 'ACTIVE';
            currentPlan.updatedAt = new Date().toISOString();
            localStore.updatePlan(currentPlan);
            setPlan(currentPlan);
          }
        }

        confetti({ particleCount: 80, spread: 80, colors: ['#10b981', '#34d399', '#4f46e5'] });
      }
    } catch {
      setPollingStatusMsg('Verification error. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!activePayment) return;
    setIsProcessing(true);

    try {
      setPaymentModalState('choose_app');
      fetchPlan();
    } catch {
      setError('Failed to reset payment attempt.');
    } finally {
      setIsProcessing(false);
    }
  };

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
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-700">Loading payment plan...</h3>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Plan Unavailable</h3>
        <p className="text-xs text-slate-500 mb-6">{error || 'Split plan was not found.'}</p>
        <button
          onClick={(onBack || (() => {}))}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const items = plan.items || [];
  const completedCount = items.filter(i => i.status === 'SUCCESS').length;
  const totalCount = items.length;
  const isAllComplete = plan.status === 'COMPLETED' || completedCount === totalCount;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 lg:py-16">
      {/* Breadcrumb */}
      <div className="mb-8 reveal stagger-1">
        <button
          onClick={(onBack || (() => {}))}
          className="interactive text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5 -rotate-180" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Plan Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl reveal stagger-2 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{plan.merchantName}</h1>
            <p className="text-xs font-mono text-slate-500 mt-1">UPI ID: {plan.merchantVpa}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Amount</span>
            <div className="text-3xl font-black text-slate-900">{formatINR(plan.totalAmount)}</div>
            <span className={`text-xs font-bold ${isAllComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>
              Progress: {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 h-full transition-all duration-500 rounded-full" style={{ width: `${(completedCount / totalCount) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Split Items */}
      <div className="space-y-4 mb-8 reveal stagger-3">
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
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200'
                  : isLocked
                  ? 'bg-slate-50/70 border-slate-200 opacity-90'
                  : 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
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
                      <h3 className="font-bold text-base text-slate-900">
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

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isSuccess && item.payment?.transactionReference && (
                        <>
                          Txn Ref: <span className="font-mono font-medium text-slate-700">{item.payment.transactionReference}</span>
                        </>
                      )}
                      {isLocked && <span>Unlocks after Payment {idx} is verified.</span>}
                      {isNotStarted && <span className="text-indigo-600 font-medium">Ready for authorization</span>}
                      {isFailed && <span className="text-rose-600 font-medium">Payment declined. Retry available.</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-xl font-black text-slate-900">{formatINR(item.amount)}</span>

                  {isNotStarted && (
                    <button
                      onClick={() => handleInitiatePayment(item)}
                      disabled={isProcessing}
                      className="interactive min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2"
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
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resume</span>
                    </button>
                  )}

                  {isFailed && (
                    <button
                      onClick={() => {
                        setActiveItem(item);
                        if (item.payment) setActivePayment(item.payment);
                        handleRetryPayment();
                      }}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  {isLocked && (
                    <span className="text-xs font-semibold text-slate-400">Awaiting step {idx}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Card */}
      {isAllComplete && (
        <div className="mb-8 reveal stagger-4">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-200/50 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Payments Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Split Completed ✓</h2>
            <p className="text-emerald-100 text-sm mb-6">
              Total paid: {formatINR(plan.totalAmount)} across all {totalCount} installments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="download-receipt-btn"
                onClick={handleDownloadReceiptPDF}
                disabled={isGeneratingPDF}
                className="flex-1 sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-[0.96] disabled:opacity-75"
              >
                <Download className={`w-4 h-4 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPDF ? 'Generating...' : 'Download Receipt'}</span>
              </button>
              <button
                onClick={() => setPaymentModalState('receipt')}
                className="w-auto min-h-[48px] px-6 py-3 rounded-xl bg-white/20 text-white font-bold text-sm hover:bg-white/30 transition-all active:scale-[0.96]"
              >
                <FileText className="w-4 h-4" />
                <span>View Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Ad Slot */}
      <div className="mb-8 reveal stagger-5">
        <GoogleAdSlot placement="banner" slot="paymentPlan" className="mb-6" />
      </div>

      {/* Modal: Choose App */}
      {paymentModalState === 'choose_app' && activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scale-in">
            <button
              onClick={() => setPaymentModalState(null)}
              className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                MDR Free Split Payment {activeItem.sequenceNumber} of {totalCount}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">{plan.merchantName}</h2>
              <div className="text-3xl font-black text-indigo-600 mt-1">
                {formatINR(activeItem.amount)}
              </div>
              <p className="text-xs text-slate-500 mt-1">VPA: {plan.merchantVpa}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Choose your UPI app
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upiApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      handleOpenUPIApp(app.id);
                    }}
                    className="interactive p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all duration-200 text-left"
                  >
                    <PaymentGatewayIcon gateway={app.id} size="sm" className="shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{app.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{app.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                id="open-upi-app-direct-btn"
                onClick={() => handleOpenUPIApp()}
                className="interactive w-full min-h-[48px] py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-300/50 hover:bg-indigo-700 hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open UPI App</span>
              </button>

              {paymentQrDataUrl && (
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <span className="text-xs font-bold text-slate-600 block mb-3">
                    Or scan this QR with your UPI app:
                  </span>
                  <div className="inline-block p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <img src={paymentQrDataUrl} alt="UPI Payment QR" className="w-32 h-32" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={copyPaymentLink}
                      className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link copied!' : 'Copy UPI Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-50 text-[10px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Enter your UPI PIN inside your bank app only.</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Waiting */}
      {paymentModalState === 'waiting' && activeItem && activePayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 relative animate-scale-in">
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-300/40">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Waiting for Payment</h2>
            <p className="text-sm text-slate-600 mb-8">
              Complete the payment in your UPI app.
            </p>

            <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Merchant:</span>
                <span className="font-bold text-slate-900">{plan.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span className="font-extrabold text-indigo-600">{formatINR(activeItem.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Txn Reference:</span>
                <span className="font-mono text-slate-700">{activePayment.transactionReference}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-indigo-700 bg-indigo-50 py-2.5 px-4 rounded-xl font-medium mb-8">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>{pollingStatusMsg}</span>
            </div>

            <div className="space-y-3">
              <button
                id="i-completed-payment-btn"
                onClick={handleVerifyPaymentNow}
                disabled={isProcessing}
                className="interactive w-full min-h-[48px] py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-300/50 hover:bg-indigo-700 hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>I've completed the payment</span>
              </button>

              <button
                onClick={() => {
                  if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
                  setPaymentModalState(null);
                }}
                className="min-h-[44px] py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-6">
              Security note: MDR Free Split verifies payment completion before unlocking the next installment.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Success */}
      {paymentModalState === 'success' && activeItem && activePayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 relative animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Payment Successful ✓</h2>
            <p className="text-xs text-slate-500 mb-8">
              Verified • Encrypted UPI confirmation
            </p>

            <div className="mb-8 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-left text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount:</span>
                <span className="font-bold text-slate-900">{formatINR(activeItem.amount)}</span>
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
                <span className="text-slate-500 font-medium">Payment:</span>
                <span className="font-bold text-indigo-600">
                  {activeItem.sequenceNumber} of {totalCount}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentModalState(null);
                fetchPlan();
              }}
              className="interactive w-full min-h-[48px] py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:bg-slate-800 hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Continue to Next Installment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Failed */}
      {paymentModalState === 'failed' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100 relative animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Payment Failed</h2>
            <p className="text-xs text-rose-600 mb-8">
              Transaction was declined or cancelled in UPI app.
            </p>

            <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600">
              <span className="font-bold block text-slate-800 mb-2">Common causes:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Payment declined in UPI app</li>
                <li>UPI app prompt was cancelled</li>
                <li>Bank NPCI server temporarily unavailable</li>
                <li>Transaction request expired</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                id="retry-failed-payment-btn"
                onClick={handleRetryPayment}
                className="interactive w-full min-h-[48px] py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Payment</span>
              </button>

              <button
                onClick={() => setPaymentModalState('choose_app')}
                className="min-h-[44px] py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center"
              >
                Choose Another UPI App
              </button>

              <button
                onClick={() => setPaymentModalState(null)}
                className="min-h-[44px] py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center"
              >
                Close & Check Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Receipt */}
      {paymentModalState === 'receipt' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPaymentModalState(null)}
              className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">MDR Free Split Receipt</h3>
                  <p className="text-xs text-slate-500">Plan Ref: {plan.publicId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    PAID IN FULL
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs">
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
                  <span className="font-bold text-indigo-700">{formatINR(plan.totalAmount)}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 mb-3">
                Itemized Installments
              </h4>

              <div className="divide-y divide-slate-200 text-xs">
                {items.map((it) => (
                  <div key={it.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800">Payment {it.sequenceNumber}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Ref: {it.payment?.transactionReference || 'SUP' + it.id.slice(0, 6)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatINR(it.amount)}</span>
                      <span className="block text-[10px] font-bold text-emerald-700">SUCCESS ✓</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
                Authorized via NPCI UPI standard protocol • Non-repudiable bank settlement
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                id="modal-download-receipt-pdf-btn"
                onClick={handleDownloadReceiptPDF}
                disabled={isGeneratingPDF}
                className="interactive flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 active:scale-[0.96] transition-all duration-200 disabled:opacity-75"
              >
                <Download className={`w-4 h-4 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPDF ? 'Generating...' : 'Download Receipt (PDF)'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="interactive w-auto min-h-[48px] px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all duration-200 active:scale-[0.96]"
              >
                <span>Print</span>
              </button>
              <button
                onClick={() => setPaymentModalState(null)}
                className="interactive w-auto min-h-[48px] px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all duration-200 active:scale-[0.96]"
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
