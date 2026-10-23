import React from 'react';
import {
  Layers,
  QrCode,
  HelpCircle,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { DisclaimerNotice } from './DisclaimerNotice';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const FOOTER_LINKS = [
  { label: 'Scan & Split', view: 'create-split', icon: QrCode },
  { label: 'Overview', view: 'landing', icon: Layers },
  { label: 'How It Works', view: 'how-it-works', icon: HelpCircle },
];

const COMPANY_LINKS = [
  {
    label: 'SmartScaleTech',
    href: 'https://smartscaletech.vercel.app/',
    icon: Briefcase
  },
  {
    label: 'LinkedIn Profile',
    href: 'https://www.linkedin.com/in/polishettivamshi/',
    icon: Linkedin
  }
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      <div className="h-1 w-full bg-brand-gradient" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.3fr)] xl:grid-cols-4 gap-x-10 gap-y-6 xl:gap-x-12 mb-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-brand/30">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                MDR <span className="text-brand-300">Free Split</span>
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Split merchant UPI payments into installments under ₹2,000 each to plan for 0% MDR. Payments stay in your UPI app.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Product</h4>
            <nav>
              {FOOTER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.view}
                    onClick={() => onNavigate(link.view)}
                    className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-white/50" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Company & Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Company &amp; Connect</h4>
            <nav>
              {COMPANY_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex min-h-10 items-center gap-2 text-sm text-white/65 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-white/50 group-hover:text-brand-300 transition-colors" />
                    <span className="min-w-0 leading-snug">{link.label}</span>
                    <ExternalLink className="pointer-events-none absolute right-0 top-1/2 w-3 h-3 -translate-y-1/2 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Contact</h4>
            <nav>
              <a href="mailto:polishettivamshi123@gmail.com" className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 hover:text-white transition-colors duration-200">
                <Mail className="w-3.5 h-3.5 shrink-0 text-white/50" />
                <span className="break-all sm:break-normal">polishettivamshi123@gmail.com</span>
              </a>
              <a href="tel:+919000859695" className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 hover:text-white transition-colors duration-200">
                <Phone className="w-3.5 h-3.5 shrink-0 text-white/50" />
                <span>+91 9000859695</span>
              </a>
            </nav>
          </div>
        </div>

        <DisclaimerNotice variant="dark" compact className="mb-6" />

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-xs text-white/55">
                © {new Date().getFullYear()} MDR Free Split. All rights reserved.
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-white/55">
                <span>Developed by</span>{' '}
                <a
                  href="https://polishettivamshi.github.io/Portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center font-semibold text-white/70 hover:text-white underline decoration-white/20 hover:decoration-brand-300 underline-offset-2 transition-colors"
                >
                  Vamshi Polishetti
                </a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs">
              <span className="text-white/55">Under NPCI guidelines, merchant transactions up to ₹2,000 are 0% MDR exempt.</span>
              <span className="hidden sm:block w-px h-3 bg-white/15" />
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
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
