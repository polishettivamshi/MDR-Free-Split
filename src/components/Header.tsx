import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Info,
  Layers,
  Menu,
  Smartphone,
  X
} from 'lucide-react';

interface HeaderProps {
  currentPath: string;
}

const NAV_LINKS = [
  {
    path: '/',
    label: 'Overview',
    icon: Layers,
    description: 'How the calculator works'
  },
  {
    path: '/guides',
    label: 'Guides',
    icon: BookOpen,
    description: 'UPI MDR and payment guides'
  },
  {
    path: '/about',
    label: 'About',
    icon: Info,
    description: 'About this independent project'
  }
];

export const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const isActive = (path: string) =>
    path === '/'
      ? currentPath === '/'
      : currentPath === path || currentPath.startsWith(`${path}/`);

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        scrolled
          ? 'bg-white/90 shadow-[0_8px_30px_-24px_rgba(17,20,57,0.35)] backdrop-blur-xl border-line'
          : 'bg-lilac/85 border-line-soft/70 backdrop-blur-xl'
      } transition-all duration-300`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            id="brand-logo-btn"
            href="/"
            className="group flex min-h-11 min-w-10 items-center gap-2 sm:gap-3"
            aria-label="MDR Free Split home"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand/35 sm:h-10 sm:w-10">
              <div className="absolute inset-0 rounded-xl bg-white/10" />
              <Layers className="relative z-10 h-5 w-5 text-white" />
            </div>
            <div className="hidden min-[360px]:block">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-lg font-extrabold tracking-tight text-ink sm:text-xl">
                  MDR <span className="text-brand-gradient">Free Split</span>
                </span>
              </div>
              <p className="hidden text-[10px] font-medium uppercase tracking-wide text-muted-soft sm:block">
                Understand. Split. Pay in UPI.
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 lg:flex lg:gap-2" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <a
                  key={link.path}
                  id={`nav-${link.label.toLowerCase()}`}
                  href={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`interactive flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-ink text-white shadow-lg shadow-ink/20'
                      : 'border border-transparent text-muted hover:border-line hover:bg-white/80 hover:text-ink'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      active ? 'text-white' : 'text-muted-soft'
                    }`}
                  />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              id="header-start-split-btn"
              href="/split"
              className="btn-primary min-h-11 whitespace-nowrap px-5 py-2.5 text-sm"
            >
              <Smartphone className="h-4 w-4" />
              <span>Scan QR &amp; Split</span>
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              id="mobile-start-split-quick-btn"
              href="/split"
              className="btn-primary shrink-0 whitespace-nowrap px-3 py-2 text-[11px] min-h-10 min-[360px]:px-3.5 min-[360px]:text-xs"
            >
              Scan &amp; Split
            </a>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="interactive flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-transparent p-2 text-muted transition-colors duration-200 hover:border-line hover:bg-white hover:text-ink focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-lilac/95 px-4 pb-6 pt-3 shadow-xl backdrop-blur-xl lg:hidden"
        >
          <div className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`interactive flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-ink font-bold text-white shadow-sm'
                      : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? 'text-white' : 'text-muted'
                      }`}
                    />
                    <span>{link.label}</span>
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 ${
                      active ? 'text-white/70' : 'text-muted-soft'
                    }`}
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
