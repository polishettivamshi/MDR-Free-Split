import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Layers,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
  X
} from 'lucide-react';
import { SplitItem, SplitPlan } from '../types';
import { localStore, PLAN_RETENTION_DAYS } from '../lib/localStore';
import { formatINR } from '../lib/upi';
import { usePageMeta } from '../lib/seo';
import { DisclaimerNotice } from './DisclaimerNotice';
import { UpiAppIcon } from './UpiAppIcon';

interface SplitPlanViewProps {
  planId: string;
}

const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'gpay', name: 'Google Pay' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'bhim', name: 'BHIM' },
  { id: 'cred', name: 'CRED' },
  { id: 'amazonpay', name: 'Amazon Pay' },
  { id: 'navi', name: 'Navi' },
  { id: 'upi', name: 'Other UPI apps' }
];

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

function buildUpiLink(plan: SplitPlan, item: SplitItem): string {
  const note = `MDR Free Split installment ${item.sequenceNumber} of ${plan.numberOfPayments}`;
  return [
    'upi://pay',
    `?pa=${encodeURIComponent(plan.merchantVpa)}`,
    `&pn=${encodeURIComponent(plan.merchantName || 'Merchant')}`,
    `&am=${item.amount.toFixed(2)}`,
    '&cu=INR',
    `&tn=${encodeURIComponent(note)}`
  ].join('');
}

function formatPlanDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export const SplitPlanView: React.FC<SplitPlanViewProps> = ({ planId }) => {
  const [plan, setPlan] = useState<SplitPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeInstallment, setActiveInstallment] = useState<SplitItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<'plan' | 'link' | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  usePageMeta({
    title: plan
      ? `Split Plan for ${plan.merchantName || 'Merchant'} — MDR Free Split`
      : 'Split Plan — MDR Free Split',
    description:
      'A locally saved UPI split plan. Open each installment in your own UPI app; this page does not collect or verify payments.',
    path: `/plan/${encodeURIComponent(planId)}`,
    noindex: true
  });

  useEffect(() => {
    setPlan(localStore.getPlan(planId) || null);
    setLoading(false);
  }, [planId]);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const activeLink = useMemo(() => {
    if (!plan || !activeInstallment) return '';
    return buildUpiLink(plan, activeInstallment);
  }, [plan, activeInstallment]);

  useEffect(() => {
    let cancelled = false;
    setQrDataUrl(null);

    if (!activeLink) return;

    import('qrcode')
      .then(({ toDataURL }) =>
        toDataURL(activeLink, {
          width: 480,
          margin: 2,
          color: { dark: '#111439', light: '#ffffff' }
        })
      )
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activeLink]);

  useEffect(() => {
    if (!activeInstallment) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveInstallment(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeInstallment]);

  const copyPlan = async () => {
    if (!plan) return;

    const items = plan.items || [];
    const text = [
      `Split plan — ${plan.merchantName}`,
      `UPI ID: ${plan.merchantVpa}`,
      `Total: ${formatINR(plan.totalAmount)}`,
      `Installments: ${items.length}`,
      '',
      ...items.map((item) => `Installment ${item.sequenceNumber}: ${formatINR(item.amount)}`),
      '',
      'Open each installment in a UPI app to pay the merchant directly.',
      'This is a calculation plan, not proof of payment.'
    ].join('\n');

    const ok = await copyText(text);
    setCopyFailed(!ok);
    setCopied(ok ? 'plan' : null);
  };

  const copyPaymentLink = async () => {
    if (!activeLink) return;

    const ok = await copyText(activeLink);
    setCopyFailed(!ok);
    setCopied(ok ? 'link' : null);
  };

  const openUpiApp = () => {
    if (!activeLink) return;
    window.location.href = activeLink;
  };

  const closeModal = () => {
    setActiveInstallment(null);
    setCopied(null);
    setCopyFailed(false);
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-4xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Layers className="h-4 w-4 animate-pulse text-brand" />
          <span>Loading split plan…</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-ink">Plan not found</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            This plan is not saved in this browser. Saved plans are removed automatically
            after {PLAN_RETENTION_DAYS} days. Create a new split plan to calculate installments
            and open a UPI app.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/" className="btn-secondary min-h-11 px-5">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </a>
            <a href="/split" className="btn-primary min-h-11 px-5">
              <Plus className="h-4 w-4" />
              Start a Split
            </a>
          </div>
        </div>
      </div>
    );
  }

  const items = plan.items || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10 lg:py-14">
      <a
        href="/"
        className="interactive mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Overview</span>
      </a>

      <div className="reveal stagger-1">
        <div className="glass-card rounded-3xl p-5 shadow-[0_24px_70px_-45px_rgba(17,20,57,0.35)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                  <Layers className="h-3 w-3" />
                  Split Plan
                </span>
                <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted">
                  Saved in this browser for {PLAN_RETENTION_DAYS} days
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {plan.merchantName || 'Merchant'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="truncate font-mono text-xs font-bold text-ink">{plan.merchantVpa}</span>
                </span>
                <span className="text-xs">Created {formatPlanDate(plan.createdAt)}</span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={copyPlan}
                className="btn-secondary min-h-11 px-4 text-xs"
                aria-live="polite"
              >
                {copied === 'plan' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied === 'plan' ? 'Copied' : 'Copy plan'}</span>
              </button>
              <a href="/split" className="btn-primary min-h-11 px-4 text-xs">
                <Plus className="h-4 w-4" />
                <span>New split</span>
              </a>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-line bg-white p-3 sm:p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Total</span>
              <span className="mt-1 block text-base font-black text-ink sm:text-lg">{formatINR(plan.totalAmount)}</span>
            </div>
            <div className="rounded-2xl border border-line bg-white p-3 sm:p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Installments</span>
              <span className="mt-1 block text-base font-black text-ink sm:text-lg">{items.length}</span>
            </div>
            <div className="rounded-2xl border border-brand/15 bg-brand-soft p-3 sm:p-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark">Largest installment</span>
              <span className="mt-1 block text-base font-black text-brand-dark sm:text-lg">
                {items.length > 0 ? formatINR(Math.max(...items.map((item) => item.amount))) : formatINR(0)}
              </span>
            </div>
          </div>
        </div>

        <DisclaimerNotice compact className="mt-4" />

        {copyFailed && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Copying is blocked by this browser. You can still open an installment in your UPI app.
          </p>
        )}

        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Installments</h2>
              <p className="text-xs text-muted">Open any installment in your UPI app. Pay in any order.</p>
            </div>
            <span className="text-[10px] font-semibold text-muted-soft">No PIN is entered on this site</span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
              <p className="text-sm font-bold text-muted">This plan has no installments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:border-brand/25 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-black text-brand">
                      {item.sequenceNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-ink">Installment {item.sequenceNumber}</h3>
                      <p className="text-[11px] text-muted">
                        Amount is filled in when you open a UPI app.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-base font-black text-ink">{formatINR(item.amount)}</span>
                    <button
                      onClick={() => {
                        setCopied(null);
                        setCopyFailed(false);
                        setActiveInstallment(item);
                      }}
                      className="btn-primary min-h-11 px-4 text-xs"
                      aria-label={`Open installment ${item.sequenceNumber} in a UPI app`}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>Open UPI app</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-lilac/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">The payment happens in your UPI app</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                MDR Free Split only calculates the split and opens a payment link. Your UPI PIN,
                payment confirmation, and refunds stay between you and your UPI app or merchant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeInstallment && createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upi-modal-title"
            className="max-h-[calc(100dvh-0.5rem)] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 sm:max-w-lg sm:rounded-3xl sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                  Installment {activeInstallment.sequenceNumber} of {items.length}
                </span>
                <h2 id="upi-modal-title" className="mt-1 text-xl font-extrabold tracking-tight text-ink">
                  Open in a UPI app
                </h2>
                <p className="mt-1 truncate text-xs text-muted">{plan.merchantName}</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-muted-soft transition-colors hover:bg-lilac hover:text-ink"
                aria-label="Close UPI app dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-brand/15 bg-brand-soft p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">Amount to pay</span>
              <p className="mt-1 text-3xl font-black tracking-tight text-ink">{formatINR(activeInstallment.amount)}</p>
              <p className="mt-1 truncate font-mono text-[11px] font-bold text-brand-dark">{plan.merchantVpa}</p>
            </div>

            {isMobile ? (
              <div className="mt-5">
                <button onClick={openUpiApp} className="btn-primary min-h-13 w-full px-5 text-base">
                  <Smartphone className="h-5 w-5" />
                  <span>Open UPI app</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
                  Your phone will let you choose PhonePe, Google Pay, Paytm, BHIM, or another UPI app.
                  Nothing is charged on this site.
                </p>
              </div>
            ) : (
              <div className="mt-5 flex flex-col items-center">
                <div className="rounded-2xl border border-line bg-white p-3">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`UPI QR code for installment ${activeInstallment.sequenceNumber}`}
                      className="h-44 w-44"
                    />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center">
                      <QrCode className="h-10 w-10 animate-pulse text-brand/40" />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-ink">
                  Scan this QR with any UPI app on your phone
                </p>
                <p className="mt-1 text-center text-[11px] leading-relaxed text-muted">
                  The amount and merchant UPI ID are already filled in.
                </p>
              </div>
            )}

            <button
              onClick={copyPaymentLink}
              className="btn-secondary mt-4 min-h-11 w-full text-xs"
              aria-live="polite"
            >
              {copied === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied === 'link' ? 'UPI link copied' : 'Copy UPI payment link'}</span>
            </button>

            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted">
                Works with UPI apps
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {UPI_APPS.map((app) => (
                  <UpiAppIcon key={app.id} app={app.id} size="sm" />
                ))}
              </div>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
                Pay the merchant directly in your UPI app. This page does not collect funds,
                verify payments, or provide refunds.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
