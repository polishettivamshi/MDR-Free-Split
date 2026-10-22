import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CreateSplit } from './components/CreateSplit';
import { PaymentPlanView } from './components/PaymentPlanView';
import { SplitPlan } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('create-split');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Handle new plan created
  const handlePlanCreated = (plan: SplitPlan) => {
    setSelectedPlanId(plan.publicId || plan.id);
    setCurrentView('payment-plan');
  };

  // Reset scroll position when the active view changes, so switching between
  // the landing, create-split and payment-plan views always starts at the top.
  // 'how-it-works' is skipped because it performs its own scroll to a section.
  const skipScrollReset = useRef(false);

  // Central navigation handler. Both Header and Footer use it so views that are
  // not real routes (like 'how-it-works') can never leave <main> empty.
  const handleNavigate = (view: string) => {
    if (view === 'how-it-works') {
      skipScrollReset.current = true;
      setCurrentView('landing');
      window.setTimeout(() => {
        const el = document.getElementById('how-it-works-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    setCurrentView(view);
  };

  useEffect(() => {
    if (skipScrollReset.current) {
      skipScrollReset.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartSplit={() => setCurrentView('create-split')}
          />
        )}

        {currentView === 'create-split' && (
          <CreateSplit
            onPlanCreated={handlePlanCreated}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'payment-plan' && selectedPlanId && (
          <PaymentPlanView
            planId={selectedPlanId}
            onBack={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Compliance Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}