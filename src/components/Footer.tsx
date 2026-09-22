import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Heart, Layers } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-white text-lg font-bold tracking-tight">SplitUPI</span>
              <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40">
                Split. Pay. Done.
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              SplitUPI is a modern payment-planning and partial-payment workflow platform.
              We enable users to plan merchant payments into structured parts and authorize
              each payment securely directly inside their supported UPI app.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2.5 max-w-md">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Zero Credential Storage:</strong> We never collect, process, or store your UPI PIN, OTP, or bank passwords.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Product & Features</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('create-split')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Start a Split
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  My Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 flex items-center gap-1.5 text-left"
                >
                  <span>Admin Console</span>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Compliance & Trust</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('security')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Security Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('refund-policy')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Refund & Cancellation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer py-1.5 block text-left"
                >
                  Contact & Grievance
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Disclaimer Banner */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-300 space-y-2">
          <p>
            <strong>Regulatory Disclaimer:</strong> SplitUPI is not a bank, non-banking financial company (NBFC), or payment system operator licensed by the Reserve Bank of India (RBI) or NPCI. All transactions are authorized directly by the customer using their installed UPI applications under standard NPCI UPI protocols. Mention of PhonePe, Google Pay, Paytm, BHIM, and other registered trademarks does not imply sponsorship, partnership, or endorsement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-slate-400 gap-2">
            <div>© {new Date().getFullYear()} SplitUPI. All rights reserved.</div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                NPCI UPI Deep Link Compatible
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
