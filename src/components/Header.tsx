import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, ShieldCheck, Smartphone, ChevronDown, Menu, X, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const NAV_LINKS = [
  { id: 'create-split', label: 'Scan & Split', icon: Smartphone, description: 'Split your UPI payment' },
  { id: 'landing', label: 'Overview', icon: Layers, description: 'How it works' },
  { id: 'how-it-works', label: 'How It Works', icon: BarChart3, description: 'Step-by-step flow' },
];

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLHeadingElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const isActive = (view: string) => currentView === view;

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 border-b ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-slate-200'
            : 'bg-white/60 backdrop-blur-md border-slate-100/50'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div
              id="brand-logo-btn"
              onClick={() => handleNav('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 rounded-2xl" />
                <Layers className="w-5 h-5 text-white relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    MDR<span className="text-emerald-600">Free Split</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5 hidden sm:block uppercase">
                  Split to Pay Zero MDR
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    id={`nav-${link.id}`}
                    onClick={() => handleNav(link.id)}
                    className={`interactive px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 min-h-[9px] ${
                      isActive(link.id)
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300/50'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200 border-transparent border'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive(link.id) ? 'text-white' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Action CTA */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                id="header-start-split-btn"
                onClick={() => handleNav('create-split')}
                className="interactive inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-300/60 hover:bg-indigo-700 hover:shadow-indigo-400/60 hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 min-h-[44px] cursor-pointer"
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
                className="interactive inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-md hover:-translate-y-[1px] active:scale-[0.96] transition-all duration-200 min-h-[40px] cursor-pointer"
              >
                Scan & Split
              </button>
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="interactive min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-slate-100 bg-white backdrop-blur-lg px-4 pt-3 pb-6 shadow-xl transition-all duration-300 animate-slide-up"
          >
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    className={`interactive w-full min-h-[44px] text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isActive(link.id)
                        ? 'text-indigo-700 bg-indigo-50 font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive(link.id) ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <span>{link.label}</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive(link.id) ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
