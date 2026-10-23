import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CreateSplit } from './components/CreateSplit';
import { SplitPlanView } from './components/SplitPlanView';
import { GuidesPage } from './pages/GuidesPage';
import { GuidePage } from './pages/GuidePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPageView } from './pages/LegalPageView';
import { NotFoundPage } from './pages/NotFoundPage';
import { getLegalDoc } from './content/legal';
import { getGuide } from './content/guides';
import { isEditorialRoute, parseCurrentRoute, routeToPath } from './lib/routes';
import { localStore } from './lib/localStore';
import {
  isAdsensePageEnabled,
  loadAdsenseScript,
  resolveAdsenseClient,
} from './lib/adsense';
import type { SplitPlan } from './types';

export default function App() {
  const [route] = useState(parseCurrentRoute);
  const [recentPlans] = useState<SplitPlan[]>(() =>
    localStore
      .getPlans()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );

  // Guides always load AdSense. The homepage, calculator and plan screens are
  // opt-in through ADSENSE_PAGE_FLAGS and stay off while the site is reviewed.
  useEffect(() => {
    const toolAdPage =
      route.page === 'home' || route.page === 'split' || route.page === 'plan'
        ? route.page
        : null;

    if (!isEditorialRoute(route) && !(toolAdPage && isAdsensePageEnabled(toolAdPage))) {
      return;
    }

    if (route.page === 'guide' && !getGuide(route.slug || '')) return;

    // Never request an ad on a missing or expired local plan screen.
    if (route.page === 'plan') {
      if (!route.planId || !localStore.getPlan(route.planId)) return;
    }

    const client = resolveAdsenseClient();
    if (!client) return;

    void loadAdsenseScript(client).catch(() => {
      // Ad blockers and offline preview should not break the page.
    });
  }, [route]);

  // Full page navigation is used for routes, so the browser normally starts at
  // the top. Preserve an explicit anchor (for example /#how-it-works-section).
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/')) {
      const id = decodeURIComponent(hash.slice(1));
      const timeout = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return () => window.clearTimeout(timeout);
    }

    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const handlePlanCreated = (plan: SplitPlan) => {
    const planId = plan.publicId || plan.id;
    window.location.assign(`/plan/${encodeURIComponent(planId)}`);
  };

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <LandingPage recentPlans={recentPlans.slice(0, 3)} />;
      case 'split':
        return <CreateSplit onPlanCreated={handlePlanCreated} />;
      case 'plan':
        return route.planId ? (
          <SplitPlanView planId={route.planId} />
        ) : (
          <NotFoundPage title="Plan not found" />
        );
      case 'guides':
        return <GuidesPage />;
      case 'guide':
        return <GuidePage slug={route.slug || ''} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <LegalPageView doc={getLegalDoc('/privacy')} />;
      case 'terms':
        return <LegalPageView doc={getLegalDoc('/terms')} />;
      case 'disclaimer':
        return <LegalPageView doc={getLegalDoc('/disclaimer')} />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-lilac font-sans text-ink">
      <Header currentPath={routeToPath(route)} />

      <main className="flex-1">{renderPage()}</main>

      <Footer />
    </div>
  );
}
