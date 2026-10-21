import React, { useState } from 'react';
import { Layers, ShieldCheck, HelpCircle, ArrowRight, Menu, X, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
              {/* Distinctive Split Arrow Icon */}
              <div className="relative flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  MDR<span className="text-emerald-600">Free Split</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium tracking-wide -mt-0.5 hidden sm:block">
                Split to Pay Zero MDR Tax
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-scan-split-btn"
              onClick={() => handleNav('create-split')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'create-split' ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Scan & Split</span>
            </button>
            <button
              id="nav-landing-btn"
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'landing' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Overview
            </button>
            <button
              id="nav-how-it-works-btn"
              onClick={() => handleNav('how-it-works')}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
            >
              How It Works
            </button>
          </nav>

          {/* Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="header-start-split-btn"
              onClick={() => handleNav('create-split')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-300 hover:bg-indigo-700 active:scale-95 transition-all min-h-[42px] cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Scan QR & Split</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-start-split-quick-btn"
              onClick={() => handleNav('create-split')}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm active:scale-95 transition-all min-h-[40px] cursor-pointer"
            >
              Scan & Split
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-1.5 shadow-lg">
          <button
            onClick={() => handleNav('create-split')}
            className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-between cursor-pointer ${
              currentView === 'create-split' ? 'text-indigo-700 bg-indigo-100/80' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Scan QR & Split</span>
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
          <button
            onClick={() => handleNav('landing')}
            className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2.5 cursor-pointer ${
              currentView === 'landing' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2.5 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>How It Works</span>
          </button>
        </div>
      )}
    </header>
  );
};
