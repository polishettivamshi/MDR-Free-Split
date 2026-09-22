import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  Webhook, 
  FileText, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { formatINR } from '../lib/upi';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'PLANS' | 'PAYMENTS' | 'FAILED' | 'PENDING' | 'WEBHOOKS' | 'RECONCILIATION' | 'AUDIT_LOGS'>('SUMMARY');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reconciling, setReconciling] = useState<boolean>(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/v1/admin/dashboard');
      const d = await res.json();
      if (d.success && d.data) {
        setData(d.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRunReconciliation = async () => {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const res = await fetch('/api/v1/admin/reconcile', { method: 'POST' });
      const d = await res.json();
      setReconcileResult(d.message || 'Reconciliation batch processed');
      fetchAdminData();
    } catch {
      setReconcileResult('Failed to run reconciliation');
    } finally {
      setReconciling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading admin console telemetry...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const payments: any[] = data?.recentPayments || [];
  const plans: any[] = data?.recentPlans || [];
  const webhooks: any[] = data?.webhookEvents || [];
  const auditLogs: any[] = data?.auditLogs || [];
  const users: any[] = data?.users || [];

  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'INITIATED');

  // Search filter across payments
  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.publicId?.toLowerCase().includes(q) ||
      p.transactionReference?.toLowerCase().includes(q) ||
      p.providerPaymentId?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      p.upiApp?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Admin Restricted
            </span>
            <span className="text-xs text-slate-400">• Internal Compliance & Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            System Operations & Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time transaction tracing, webhook telemetry, and banking reconciliation. (Zero sensitive credentials stored).
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Plans</span>
          <span className="text-2xl font-black text-slate-900">{summary.totalPlans || 0}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Volume Settled</span>
          <span className="text-2xl font-black text-emerald-600">{formatINR(summary.totalVolumePaid || 0)}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Success Rate</span>
          <span className="text-2xl font-black text-indigo-600">{summary.successRate || 100}%</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pending Queue</span>
          <span className="text-2xl font-black text-amber-600">{summary.pendingCount || 0}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Failed Txns</span>
          <span className="text-2xl font-black text-rose-600">{summary.failedCount || 0}</span>
        </div>
      </div>

      {/* Section Tabs (Section 28) */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 mb-6 border-b border-slate-200 text-xs font-bold scrollbar-none">
        {[
          { key: 'SUMMARY', label: 'Overview' },
          { key: 'PAYMENTS', label: `Payments (${payments.length})` },
          { key: 'FAILED', label: `Failed (${failedPayments.length})` },
          { key: 'PENDING', label: `Pending (${pendingPayments.length})` },
          { key: 'PLANS', label: `Split Plans (${plans.length})` },
          { key: 'RECONCILIATION', label: 'Reconciliation Job' },
          { key: 'WEBHOOKS', label: `Webhooks (${webhooks.length})` },
          { key: 'AUDIT_LOGS', label: `Audit Logs (${auditLogs.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar for Transactions */}
      {(activeTab === 'PAYMENTS' || activeTab === 'FAILED' || activeTab === 'PENDING') && (
        <div className="mb-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Payment ID, Transaction Reference, Provider ID, UPI App, Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[42px] pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Plans */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center justify-between">
              <span>Recent Split Plans</span>
              <button onClick={() => setActiveTab('PLANS')} className="text-xs text-indigo-600 hover:underline">
                View all
              </button>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {plans.slice(0, 5).map(p => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{p.merchantName}</span>
                    <span className="block text-[11px] text-slate-400 font-mono">VPA: {p.merchantVpa}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{formatINR(p.totalAmount)}</span>
                    <span className="block text-[10px] font-bold text-indigo-600">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Users */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">System Accounts</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {users.map(u => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {u.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{u.name}</span>
                      <span className="block text-[11px] text-slate-400">{u.email}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS TABLE */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">UPI App</th>
                  <th className="py-3 px-4">Provider ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Initiated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.transactionReference}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.publicId || p.id}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 capitalize font-semibold">{p.upiApp || 'UPI App'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{p.providerPaymentId || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(p.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FAILED TRANSACTIONS */}
      {activeTab === 'FAILED' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Failed Transaction Audit</h3>
          {failedPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No failed transactions in the system.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {failedPayments.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-700">Ref: {p.transactionReference}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">Reason: {p.failureReason || 'Bank declined / Timeout'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatINR(p.amount)}</span>
                    <span className="block text-[10px] text-slate-400">App: {p.upiApp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECONCILIATION JOB (Section 29) */}
      {activeTab === 'RECONCILIATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Background Bank Reconciliation Engine</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Periodically inspects payments remaining in <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">PENDING</code> state for over 60 seconds.
            Queries the banking switch / provider status API directly and synchronizes database state, avoiding reliance on browser callbacks.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Pending Transactions to Reconcile:</span>
              <span className="text-xl font-black text-slate-900">{pendingPayments.length}</span>
            </div>
            <button
              onClick={handleRunReconciliation}
              disabled={reconciling}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
              <span>{reconciling ? 'Running Job...' : 'Run Reconciliation Now'}</span>
            </button>
          </div>

          {reconcileResult && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✓ {reconcileResult}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WEBHOOK EVENTS */}
      {activeTab === 'WEBHOOKS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Webhook className="w-4 h-4 text-indigo-600" />
            <span>Webhook Events Ingestion Log</span>
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {webhooks.length === 0 ? (
              <p className="py-6 text-center text-slate-400">No external webhook events logged.</p>
            ) : (
              webhooks.map(wh => (
                <div key={wh.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{wh.eventType}</span>
                    <span className="block text-[11px] text-slate-400 font-mono">Provider: {wh.provider} • Event: {wh.eventId}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wh.signatureValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {wh.signatureValid ? 'SIG_VALID ✓' : 'SIG_INVALID'}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(wh.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS (Section 27) */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Structured Audit Trail (Sanitized)</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                <div>
                  <span className="font-bold text-indigo-700">{log.action}</span>
                  <span className="text-slate-500 ml-2">[{log.entityType}: {log.entityId}]</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">ReqID: {log.requestId}</div>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
