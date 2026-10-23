import React from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Layers,
  Linkedin,
  Mail,
  Phone,
  QrCode
} from 'lucide-react';
import { DisclaimerNotice } from './DisclaimerNotice';

const FOOTER_LINKS = [
  { label: 'Scan & Split', href: '/split', icon: QrCode },
  { label: 'Overview', href: '/', icon: Layers },
  { label: 'Guides', href: '/guides', icon: BookOpen },
  {
    label: 'How It Works',
    href: '/guides/how-mdr-free-split-works',
    icon: HelpCircle
  }
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

const LEGAL_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' }
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      <div className="h-1 w-full bg-brand-gradient" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.3fr)] xl:grid-cols-4 xl:gap-x-12">
          <div className="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-1">
            <a href="/" className="mb-3 flex min-h-10 items-center gap-2.5" aria-label="MDR Free Split home">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/30">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                MDR <span className="text-brand-300">Free Split</span>
              </span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              A free UPI split calculator and source-linked guide library. Plan
              the installments here, then pay the merchant in your own UPI app.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
              Product
            </h2>
            <nav aria-label="Product">
              {FOOTER_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 transition-all duration-200 hover:pl-1 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white/50" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
              Company &amp; Connect
            </h2>
            <nav aria-label="Company and social links">
              {COMPANY_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex min-h-10 items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white/50 transition-colors group-hover:text-brand-300" />
                    <span className="min-w-0 leading-snug">{link.label}</span>
                    <ExternalLink className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
              Contact
            </h2>
            <nav aria-label="Contact">
              <a
                href="mailto:polishettivamshi123@gmail.com"
                className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="break-all sm:break-normal">
                  polishettivamshi123@gmail.com
                </span>
              </a>
              <a
                href="tel:+919000859695"
                className="interactive flex min-h-10 items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span>+91 9000859695</span>
              </a>
            </nav>
          </div>
        </div>

        <DisclaimerNotice variant="dark" compact className="mb-6" />

        <div className="border-t border-white/10 pt-5">
          <nav
            aria-label="Site information"
            className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-10 min-w-10 items-center text-xs font-medium text-white/55 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
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
                  className="inline-flex min-h-10 items-center font-semibold text-white/70 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-brand-300"
                >
                  Vamshi Polishetti
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
              <span className="text-white/55">
                Standard P2M payments up to ₹2,000: 0% base MDR under the notified 2026 framework.
              </span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <div className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Zero PIN Stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
