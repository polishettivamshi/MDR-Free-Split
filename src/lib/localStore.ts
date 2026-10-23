import { SplitPlan, SplitItem } from '../types';

const STORAGE_KEY = 'mdfreesplit_plans';

export const PLAN_RETENTION_DAYS = 7;
const PLAN_RETENTION_MS = PLAN_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Keep only the calculation data a split plan needs. Older versions of the
 * app stored payment statuses and other legacy fields; those are intentionally
 * dropped because MDR Free Split does not track payments.
 */
function sanitizePlan(raw: Partial<SplitPlan> & { items?: Partial<SplitItem>[] }): SplitPlan {
  const id = raw.id || 'plan_' + Math.random().toString(36).slice(2, 14);
  const createdAt = raw.createdAt || new Date().toISOString();

  return {
    id,
    publicId: raw.publicId || 'sp_' + Math.random().toString(36).slice(2, 12),
    merchantName: raw.merchantName || '',
    merchantVpa: raw.merchantVpa || '',
    totalAmount: Number(raw.totalAmount) || 0,
    currency: 'INR',
    numberOfPayments: Number(raw.numberOfPayments) || raw.items?.length || 1,
    createdAt,
    updatedAt: raw.updatedAt || createdAt,
    items: (raw.items || []).map((item, index) => ({
      id: item.id || 'item_' + Math.random().toString(36).slice(2, 14),
      splitPlanId: id,
      sequenceNumber: Number(item.sequenceNumber) || index + 1,
      amount: Number(item.amount) || 0,
      createdAt: item.createdAt || createdAt,
      updatedAt: item.updatedAt || createdAt,
    })),
  };
}

function loadPlans(): SplitPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    const cutoff = Date.now() - PLAN_RETENTION_MS;
    const plans = parsed
      .filter((plan): plan is Partial<SplitPlan> & { items?: Partial<SplitItem>[] } =>
        Boolean(plan) && typeof plan === 'object'
      )
      .map(sanitizePlan)
      .filter((plan) => {
        const createdAt = new Date(plan.createdAt).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      });

    // Clear legacy payment metadata and expired plans from local storage.
    if (JSON.stringify(parsed) !== JSON.stringify(plans)) {
      savePlans(plans);
    }
    return plans;
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
    const planId = planData.id || 'plan_' + Math.random().toString(36).slice(2, 14);
    const now = new Date().toISOString();
    const plan: SplitPlan = {
      id: planId,
      publicId: planData.publicId || 'sp_' + Math.random().toString(36).slice(2, 12),
      merchantName: planData.merchantName || '',
      merchantVpa: planData.merchantVpa || '',
      totalAmount: planData.totalAmount || 0,
      currency: 'INR',
      numberOfPayments: planData.numberOfPayments || planData.items?.length || 1,
      createdAt: now,
      updatedAt: now,
      items: (planData.items || []).map(item => ({
        id: item.id,
        splitPlanId: planId,
        sequenceNumber: item.sequenceNumber,
        amount: item.amount,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || now,
      })),
    };
    plans.push(plan);
    savePlans(plans);
    return plan;
  }
};
