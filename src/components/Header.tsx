import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Smartphone, ChevronDown, Menu, X, BarChart3 } from 'lucide-react';

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
        className={`sticky top-0 z-50 border-b ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_-24px_rgba(17,20,57,0.35)] border-line'
            : 'bg-lilac/85 backdrop-blur-xl border-line-soft/70'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div
              id="brand-logo-btn"
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-brand/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand/35 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 rounded-xl" />
                <Layers className="w-5 h-5 text-white relative z-10" />
              </div>
              <div className="hidden min-[360px]:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-ink whitespace-nowrap">
                    MDR <span className="text-brand-gradient">Free Split</span>
                  </span>
                </div>
                <p className="text-[10px] text-muted-soft font-medium tracking-wide -mt-0.5 hidden sm:block uppercase">
                  Split to Pay Zero MDR
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 lg:gap-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    id={`nav-${link.id}`}
                    onClick={() => handleNav(link.id)}
                    className={`interactive px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 min-h-11 whitespace-nowrap ${
                      isActive(link.id)
                        ? 'bg-ink text-white shadow-lg shadow-ink/20'
                        : 'text-muted hover:bg-white/80 hover:text-ink border border-transparent hover:border-line'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive(link.id) ? 'text-white' : 'text-muted-soft'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Action CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                id="header-start-split-btn"
                onClick={() => handleNav('create-split')}
                className="btn-primary px-5 py-2.5 text-sm min-h-11 cursor-pointer whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4" />
                <span>Scan QR & Split</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                id="mobile-start-split-quick-btn"
                onClick={() => handleNav('create-split')}
                className="btn-primary shrink-0 whitespace-nowrap px-3 min-[360px]:px-3.5 py-2 text-[11px] min-[360px]:text-xs min-h-10 cursor-pointer"
              >
                Scan & Split
              </button>
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="interactive min-h-11 min-w-11 flex items-center justify-center p-2 rounded-full text-muted hover:bg-white hover:text-ink border border-transparent hover:border-line transition-colors duration-200 focus:outline-none cursor-pointer"
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
            className="lg:hidden border-t border-line bg-lilac/95 backdrop-blur-xl px-4 pt-3 pb-6 shadow-xl transition-all duration-300 animate-slide-up"
          >
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    className={`interactive w-full min-h-11 text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      isActive(link.id)
                        ? 'bg-ink text-white font-bold shadow-sm'
                        : 'text-muted hover:bg-white hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive(link.id) ? 'text-white' : 'text-muted'}`} />
                      <span>{link.label}</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive(link.id) ? 'text-white/70' : 'text-muted-soft'}`} />
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
