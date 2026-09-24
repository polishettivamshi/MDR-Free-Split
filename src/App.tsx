import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CreateSplit } from './components/CreateSplit';
import { PaymentPlanView } from './components/PaymentPlanView';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalPages } from './components/LegalPages';
import { SplitPlan } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('create-split');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeSplitsCount, setActiveSplitsCount] = useState<number>(0);

  // Fetch active splits count for badge
  useEffect(() => {
    fetch('/api/v1/split-plans')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const active = data.data.filter((p: SplitPlan) => p.status === 'ACTIVE').length;
          setActiveSplitsCount(active);
        }
      })
      .catch(() => {});
  }, [currentView]);

  // Handle new plan created
  const handlePlanCreated = (plan: SplitPlan) => {
    setSelectedPlanId(plan.publicId || plan.id);
    setCurrentView('payment-plan');
  };

  // Handle plan selected from dashboard
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentView('payment-plan');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'how-it-works') {
            setCurrentView('landing');
            setTimeout(() => {
              const el = document.getElementById('how-it-works-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            setCurrentView(view);
          }
        }}
        activeSplitsCount={activeSplitsCount}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartSplit={() => setCurrentView('create-split')}
            onNavigate={(view) => setCurrentView(view)}
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
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectPlan={handleSelectPlan}
            onStartNewSplit={() => setCurrentView('create-split')}
          />
        )}

        {currentView === 'admin' && <AdminDashboard />}

        {(['terms', 'privacy', 'security', 'refund-policy', 'contact'].includes(currentView)) && (
          <LegalPages
            page={currentView as any}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* Compliance Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
}
