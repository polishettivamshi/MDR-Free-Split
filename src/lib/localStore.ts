import { SplitPlan, SplitItem, Payment, UPIApp } from '../types';

const STORAGE_KEY = 'mdfreesplit_plans';

function loadPlans(): SplitPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePlans(plans: SplitPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export const localStore = {
  getPlans(): SplitPlan[] {
    return loadPlans();
  },

  getPlan(publicId: string): SplitPlan | undefined {
    const plans = loadPlans();
    return plans.find(p => p.publicId === publicId || p.id === publicId);
  },

  createPlan(planData: Partial<SplitPlan> & { items: SplitItem[] }): SplitPlan {
    const plans = loadPlans();
    const plan: SplitPlan = {
      id: planData.id || 'plan_' + Math.random().toString(36).slice(2, 14),
      publicId: planData.publicId || 'sp_' + Math.random().toString(36).slice(2, 12),
      userId: planData.userId || 'local',
      merchantName: planData.merchantName || '',
      merchantVpa: planData.merchantVpa || '',
      totalAmount: planData.totalAmount || 0,
      currency: 'INR',
      numberOfPayments: planData.numberOfPayments || planData.items?.length || 1,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      items: planData.items
    };
    plans.push(plan);
    savePlans(plans);
    return plan;
  },

  updatePlan(updatedPlan: SplitPlan): void {
    const plans = loadPlans();
    const idx = plans.findIndex(p => p.id === updatedPlan.id);
    if (idx >= 0) {
      plans[idx] = updatedPlan;
      savePlans(plans);
    }
  },

  getUPIApps(): UPIApp[] {
    return [
      { id: 'phonepe', name: 'PhonePe', packageName: 'com.phonepe.app', icon: 'phonepe', deepLinkScheme: 'phonepe://pay', enabled: true, color: '#5f259f', description: 'UPI, Wallet & Cards' },
      { id: 'gpay', name: 'Google Pay', packageName: 'com.google.android.apps.nbu.paisa.user', icon: 'gpay', deepLinkScheme: 'tez://upi/pay', enabled: true, color: '#1a73e8', description: 'Fast & Secure with Google' },
      { id: 'paytm', name: 'Paytm', packageName: 'net.one97.paytm', icon: 'paytm', deepLinkScheme: 'paytmmp://pay', enabled: true, color: '#00b9f5', description: 'Payments Bank & UPI' },
      { id: 'bhim', name: 'BHIM UPI', packageName: 'in.org.npci.upiapp', icon: 'bhim', deepLinkScheme: 'upi://pay', enabled: true, color: '#005f73', description: 'National Payments Corp of India' },
      { id: 'cred', name: 'CRED UPI', packageName: 'com.dreamplug.androidapp', icon: 'cred', deepLinkScheme: 'cred://upi/pay', enabled: true, color: '#0f0f0f', description: 'Exclusive Member UPI & Rewards' },
      { id: 'amazonpay', name: 'Amazon Pay', packageName: 'in.amazon.mShop.android.shopping', icon: 'amazonpay', deepLinkScheme: 'amazonpay://upi/pay', enabled: true, color: '#232f3e', description: 'Cashback & Instant UPI' },
      { id: 'navi', name: 'Navi UPI', packageName: 'com.naviapp', icon: 'navi', deepLinkScheme: 'navi://upi/pay', enabled: true, color: '#0f172a', description: 'Zero Fee UPI & Lending' },
      { id: 'other', name: 'Other UPI App', packageName: undefined, icon: 'upi', deepLinkScheme: 'upi://pay', enabled: true, color: '#0f172a', description: 'Any Bank or Certified UPI App' }
    ];
  }
};
