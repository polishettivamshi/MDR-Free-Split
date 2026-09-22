import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Store, 
  Calendar, 
  IndianRupee, 
  ChevronRight, 
  PlusCircle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { formatINR } from '../lib/upi';
import { SplitPlan } from '../types';
import { PaymentGatewayIcon } from './PaymentGatewayIcon';
import { SponsoredAdCard } from './SponsoredAdCard';

interface DashboardProps {
  onSelectPlan: (planId: string) => void;
  onStartNewSplit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectPlan, onStartNewSplit }) => {
  const [plans, setPlans] = useState<SplitPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/v1/split-plans');
      const data = await res.json();
      if (data.success && data.data) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Compute metrics (Section 22: Active Splits, Completed Splits, Failed Payments, Total Amount Paid)
  const activeSplits = plans.filter(p => p.status === 'ACTIVE');
  const completedSplits = plans.filter(p => p.status === 'COMPLETED');

  let failedPaymentsCount = 0;
  let totalAmountPaid = 0;

  plans.forEach(plan => {
    (plan.items || []).forEach(item => {
      if (item.status === 'SUCCESS') {
        totalAmountPaid += item.amount;
      } else if (item.status === 'FAILED') {
        failedPaymentsCount++;
      }
    });
  });

  // Filter plans based on tab and search
  const filteredPlans = plans.filter(plan => {
    if (filterTab === 'ACTIVE' && plan.status !== 'ACTIVE') return false;
    if (filterTab === 'COMPLETED' && plan.status !== 'COMPLETED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        plan.merchantName.toLowerCase().includes(q) ||
        plan.merchantVpa.toLowerCase().includes(q) ||
        plan.publicId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Split Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor installment schedules, continue active splits, and download receipts.
          </p>
        </div>

        <button
          onClick={onStartNewSplit}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start a Split</span>
        </button>
      </div>

      {/* 4 Metric Cards (Section 22 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1: Total Amount Paid */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Amount Paid
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatINR(totalAmountPaid)}</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Across {completedSplits.length} completed & {activeSplits.length} active plans
          </p>
        </div>

        {/* Metric 2: Active Splits */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Splits
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeSplits.length}</div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            Installments ready to authorize
          </p>
        </div>

        {/* Metric 3: Completed Splits */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Splits
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{completedSplits.length}</div>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            100% verified & settled
          </p>
        </div>

        {/* Metric 4: Failed Payments */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Failed Payments
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{failedPaymentsCount}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {failedPaymentsCount > 0 ? 'Retry available' : 'Zero payment failures'}
          </p>
        </div>
      </div>

      {/* Sponsored Financial Partner Offer Banner */}
      <SponsoredAdCard placement="banner" selectedAdId="rupay-upi-offer" className="mb-6" />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[38px] flex items-center justify-center text-center ${
              filterTab === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Splits ({plans.length})
          </button>
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[38px] flex items-center justify-center text-center ${
              filterTab === 'ACTIVE' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeSplits.length})
          </button>
          <button
            onClick={() => setFilterTab('COMPLETED')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[38px] flex items-center justify-center text-center ${
              filterTab === 'COMPLETED' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedSplits.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search merchant, VPA, plan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading your payment splits...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No split plans found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'No plans matched your search terms.'
              : 'You have not created any split payment plans yet.'}
          </p>
          <button
            onClick={onStartNewSplit}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs inline-flex items-center justify-center cursor-pointer shadow-md shadow-indigo-100"
          >
            Create Your First Split
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map(plan => {
            const items = plan.items || [];
            const doneCount = items.filter(i => i.status === 'SUCCESS').length;
            const isCompleted = plan.status === 'COMPLETED' || doneCount === items.length;

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.publicId || plan.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {plan.merchantName}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">{plan.merchantVpa}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Total Amount</span>
                    <span className="text-lg font-black text-slate-900">{formatINR(plan.totalAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-medium">Progress</span>
                    <span className="font-extrabold text-indigo-600">
                      {doneCount} / {plan.numberOfPayments} payments completed
                    </span>
                  </div>
                </div>

                {/* Progress mini bar */}
                <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${(doneCount / plan.numberOfPayments) * 100}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center -space-x-1">
                      <PaymentGatewayIcon gateway="phonepe" size="xs" />
                      <PaymentGatewayIcon gateway="gpay" size="xs" />
                      <PaymentGatewayIcon gateway="paytm" size="xs" />
                      <PaymentGatewayIcon gateway="bhim" size="xs" />
                    </div>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">UPI Certified</span>
                  </div>
                  <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isCompleted ? 'View Plan & Receipt' : 'Continue Payment'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
