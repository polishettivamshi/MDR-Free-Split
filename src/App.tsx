import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CreateSplit } from './components/CreateSplit';
import { SplitPlanView } from './components/SplitPlanView';
import { SplitPlan } from './types';
import { localStore } from './lib/localStore';

type AppView = 'landing' | 'create-split' | 'split-plan';

interface RouteState {
  view: AppView;
  planId: string | null;
}

function readRoute(): RouteState {
  const hash = window.location.hash;
  const planMatch = hash.match(/^#\/plan\/([^/?#]+)/);

  if (planMatch) {
    try {
      return { view: 'split-plan', planId: decodeURIComponent(planMatch[1]) };
    } catch {
      return { view: 'landing', planId: null };
    }
  }
  if (/^#\/split\/?$/.test(hash)) {
    return { view: 'create-split', planId: null };
  }
  return { view: 'landing', planId: null };
}

function routeUrl(view: AppView, planId: string | null): string {
  const base = `${window.location.pathname}${window.location.search}`;
  if (view === 'split-plan' && planId) {
    return `${base}#/plan/${encodeURIComponent(planId)}`;
  }
  if (view === 'create-split') {
    return `${base}#/split`;
  }
  return base;
}

export default function App() {
  const initialRoute = useRef<RouteState>(readRoute()).current;
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialRoute.planId);
  const [recentPlans, setRecentPlans] = useState<SplitPlan[]>([]);

  const pushRoute = (view: AppView, planId: string | null = null) => {
    window.history.pushState({ view, planId }, '', routeUrl(view, planId));
  };

  const goTo = (view: AppView, planId: string | null = null) => {
    pushRoute(view, planId);
    setSelectedPlanId(planId);
    setCurrentView(view);
  };

  // Keep the locally saved plan list fresh whenever the view changes.
  useEffect(() => {
    const plans = localStore
      .getPlans()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentPlans(plans);
  }, [currentView]);

  // Browser back/forward should restore the plan view when its hash is present.
  useEffect(() => {
    const handlePopState = () => {
      const route = readRoute();
      setSelectedPlanId(route.planId);
      setCurrentView(route.view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show the freshly calculated split plan and give it a refreshable URL.
  const handlePlanCreated = (plan: SplitPlan) => {
    goTo('split-plan', plan.publicId || plan.id);
  };

  // Reset scroll position when the active view changes, so switching between
  // the landing, create-split and split-plan views always starts at the top.
  // 'how-it-works' is skipped because it performs its own scroll to a section.
  const skipScrollReset = useRef(false);

  // Central navigation handler. Both Header and Footer use it so views that are
  // not real routes (like 'how-it-works') can never leave <main> empty.
  const handleNavigate = (view: string) => {
    if (view === 'how-it-works') {
      if (currentView !== 'landing') {
        skipScrollReset.current = true;
        goTo('landing');
      } else {
        skipScrollReset.current = false;
      }
      window.setTimeout(() => {
        const el = document.getElementById('how-it-works-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (view === 'create-split') {
      goTo('create-split');
      return;
    }

    goTo('landing');
  };

  useEffect(() => {
    if (skipScrollReset.current) {
      skipScrollReset.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="flex flex-col min-h-screen bg-lilac text-ink font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartSplit={() => goTo('create-split')}
            recentPlans={recentPlans.slice(0, 3)}
            onOpenPlan={(planId) => goTo('split-plan', planId)}
          />
        )}

        {currentView === 'create-split' && (
          <CreateSplit
            onPlanCreated={handlePlanCreated}
            onCancel={() => goTo('landing')}
          />
        )}

        {currentView === 'split-plan' && selectedPlanId && (
          <SplitPlanView
            planId={selectedPlanId}
            onBack={() => goTo('landing')}
            onStartNew={() => goTo('create-split')}
          />
        )}
      </main>

      {/* Compliance Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
