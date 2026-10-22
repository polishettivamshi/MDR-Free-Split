import React from 'react';
import { Layers, QrCode, HelpCircle, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const FOOTER_LINKS = [
  { label: 'Scan & Split', view: 'create-split', icon: QrCode },
  { label: 'Overview', view: 'landing', icon: Layers },
  { label: 'How It Works', view: 'how-it-works', icon: HelpCircle },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/50 bg-slate-950 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-lg">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                MDR<span className="text-emerald-400">Free Split</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Split merchant UPI payments into installments under ₹2,000 each to pay 0% MDR tax. Authorize securely in your UPI app.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Product</h4>
            <nav className="space-y-3">
              {FOOTER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.view}
                    onClick={() => onNavigate(link.view)}
                    className="interactive flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Contact</h4>
            <nav className="space-y-3">
              <a href="mailto:polishettivamshi123@gmail.com" className="interactive flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200">
                <Mail className="w-3.5 h-3.5" />
                <span>polishettivamshi123@gmail.com</span>
              </a>
              <a href="tel:+919000859695" className="interactive flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 90008 59695</span>
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-slate-800/50 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} MDR Free Split. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">Under NPCI guidelines, merchant transactions up to ₹2,000 are 0% MDR exempt.</span>
              <span className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero PIN Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
