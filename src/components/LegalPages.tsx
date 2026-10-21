import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, FileText, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface LegalPagesProps {
  page: 'terms' | 'privacy' | 'security' | 'refund-policy' | 'contact';
  onNavigate: (view: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <button onClick={() => onNavigate('landing')} className="hover:text-slate-900 cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-indigo-600 capitalize">{page.replace('-', ' ')}</span>
      </div>

      {/* Page Content Switch */}
      {page === 'terms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last Updated: September 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Nature of the Service</h2>
            <p>
              MDR Free Split provides a software interface for partial payment planning and coordination. MDR Free Split is
              <strong> NOT a bank, non-banking financial company (NBFC), or licensed payment system operator</strong>.
              All payment transactions are initiated by users and authorized directly inside certified third-party UPI applications (e.g. PhonePe, Google Pay, Paytm, BHIM).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Compliance & Anti-Evasion Policy (Section 36)</h2>
            <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <strong>Strict Compliance Mandate:</strong> MDR Free Split does not advertise, support, or facilitate any activity intended to manipulate, bypass, evade, or circumvent payment-network merchant discount rate (MDR) fees, interchange fees, or banking controls. The split feature is strictly provided as a consumer budgeting and partial-payment scheduling aid.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. User Responsibility & Authorization</h2>
            <p>
              Each installment requires individual, explicit authorization by the user inside their respective UPI application using their private UPI PIN. MDR Free Split cannot and will not automatically execute debits without user involvement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Third-Party Trademarks</h2>
            <p>
              PhonePe, Google Pay, Paytm, BHIM, and other bank names are registered trademarks of their respective owners. Mention of these services does not imply any partnership, affiliation, endorsement, or sponsorship.
            </p>
          </section>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last Updated: September 2026</p>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Zero Credential Collection Policy:</strong>
              MDR Free Split never requests, collects, views, or stores your UPI PIN, OTPs, net-banking passwords, or debit/credit card numbers.
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Data We Collect</h2>
            <p>
              We only retain the minimal technical metadata necessary to track your split schedule:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Merchant Name and Public Virtual Payment Address (e.g. merchant@icici)</li>
              <li>Transaction amount, sequence numbers, and currency (INR)</li>
              <li>Public Transaction References (e.g. SUP123456) provided by the payment gateway</li>
              <li>Timestamp of plan creation and payment completion status</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. How Data is Used</h2>
            <p>
              Your data is solely used to verify whether an installment has completed and to unlock subsequent installments in your plan. We do not sell or monetize personal shopping histories.
            </p>
          </section>
        </div>
      )}

      {page === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-extrabold text-slate-900">Security Architecture</h1>
          </div>
          <p className="text-xs text-slate-400">End-to-End Cryptographic & UPI Protocol Hardening</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">NPCI Deep-Link Standard</h3>
              <p className="text-xs text-slate-600">
                Payment URIs conform to the National Payments Corporation of India (NPCI) specification with exact URL-encoding of all parameters.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">Server Status Verification</h3>
              <p className="text-xs text-slate-600">
                Installment completion is authenticated through server-side queries and signed webhook callbacks from our banking provider. Client-side claims are never trusted alone.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">Untrusted QR Sanitization</h3>
              <p className="text-xs text-slate-600">
                QR content is sanitized to reject malicious external web links, script injections, and malformed VPAs before processing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">Idempotency Protection</h3>
              <p className="text-xs text-slate-600">
                Every payment request includes an Idempotency-Key header to prevent duplicate charges caused by network timeouts or accidental double clicks.
              </p>
            </div>
          </div>
        </div>
      )}

      {page === 'refund-policy' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-400">Last Updated: September 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Cancellations</h2>
            <p>
              Users may cancel an active split plan at any time prior to initiating an installment. Payments that have already been authorized and settled to the merchant cannot be cancelled unilaterally through MDR Free Split.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Merchant Returns & Refunds</h2>
            <p>
              Because MDR Free Split coordinates payments directed straight to the merchant's UPI address, any return or merchandise refund must be requested directly from the merchant. Refunds will be credited back to your original bank account according to UPI return protocols.
            </p>
          </section>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">Contact & Grievance</h1>
          <p className="text-xs text-slate-400">We are here to support your payment plan questions.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Mail className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs">Email Support</h4>
              <p className="text-xs text-slate-500 mt-1">support@mdfreesplit.dev</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs">Grievance Helpline</h4>
              <p className="text-xs text-slate-500 mt-1">+91 (80) 4123-9876</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-xs">Registered Address</h4>
              <p className="text-xs text-slate-500 mt-1">Koramangala, Bengaluru, Karnataka 560034</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
