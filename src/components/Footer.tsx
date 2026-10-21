import React from 'react';
import { Layers, QrCode, HelpCircle, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white text-base font-extrabold tracking-tight">MDR<span className="text-emerald-400">Free Split</span></span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0% Tax Exemption Engine
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Scan merchant QR codes, calculate live UPI taxes, and optimize split payments.
              </p>
            </div>
          </div>

          {/* Quick Essential Navigation */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => onNavigate('create-split')}
              className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scan & Split</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Minimal Regulatory Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-slate-500 text-[11px]">
          <p className="text-center sm:text-left">
            Under NPCI guidelines, merchant transactions up to ₹2,000 are 0% surcharge exempt. MDR Free Split coordinates payments via verified UPI deep-links.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <span>© {new Date().getFullYear()} MDR Free Split</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero PIN Stored
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
