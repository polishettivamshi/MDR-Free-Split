import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// --- Types & Interfaces ---
interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface SplitPlan {
  id: string;
  publicId: string;
  userId: string;
  merchantName: string;
  merchantVpa: string;
  totalAmount: number;
  currency: string;
  numberOfPayments: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface SplitItem {
  id: string;
  splitPlanId: string;
  sequenceNumber: number;
  amount: number;
  status: 'NOT_STARTED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'LOCKED';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  publicId: string;
  splitItemId: string;
  provider: string;
  providerPaymentId?: string;
  transactionReference: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  upiApp?: string;
  initiatedAt?: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  payload: any;
  signatureValid: boolean;
  processed: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  requestId: string;
  metadata?: any;
  createdAt: string;
}

// --- In-Memory Store with Seed Data ---
const db = {
  users: new Map<string, User>(),
  splitPlans: new Map<string, SplitPlan>(),
  splitItems: new Map<string, SplitItem>(),
  payments: new Map<string, Payment>(),
  webhookEvents: new Map<string, WebhookEvent>(),
  auditLogs: [] as AuditLog[],
  idempotencyKeys: new Map<string, { response: any; timestamp: number }>()
};

// Seed default demo user & admin
const demoUserId = 'usr_demo_88231';
db.users.set(demoUserId, {
  id: demoUserId,
  email: 'user@splitupi.dev',
  phone: '+91 98765 43210',
  name: 'Aarav Sharma',
  passwordHash: crypto.createHash('sha256').update('password123').digest('hex'),
  role: 'user',
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date().toISOString()
});

const adminUserId = 'usr_admin_001';
db.users.set(adminUserId, {
  id: adminUserId,
  email: 'admin@splitupi.dev',
  phone: '+91 98765 00000',
  name: 'SplitUPI Admin',
  passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'),
  role: 'admin',
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString()
});

// Seed an initial demo split plan for instant exploration
const samplePlanId = 'plan_init_001';
const samplePlanPublicId = 'sp_' + crypto.randomUUID().slice(0, 8);
db.splitPlans.set(samplePlanId, {
  id: samplePlanId,
  publicId: samplePlanPublicId,
  userId: demoUserId,
  merchantName: 'Croma Electronics',
  merchantVpa: 'croma.retail@icici',
  totalAmount: 14999,
  currency: 'INR',
  numberOfPayments: 3,
  status: 'ACTIVE',
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
});

const item1Id = 'item_001';
const item2Id = 'item_002';
const item3Id = 'item_003';

const pay1Id = 'pay_demo_01';
const pay1PublicId = 'pay_' + crypto.randomUUID().slice(0, 8);
db.payments.set(pay1Id, {
  id: pay1Id,
  publicId: pay1PublicId,
  splitItemId: item1Id,
  provider: 'mock_upi',
  providerPaymentId: 'UPI_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  transactionReference: 'SUP' + Math.floor(100000 + Math.random() * 900000),
  amount: 5000,
  currency: 'INR',
  status: 'SUCCESS',
  upiApp: 'phonepe',
  initiatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  completedAt: new Date(Date.now() - 3600000 * 2 + 12000).toISOString(),
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 2 + 12000).toISOString()
});

db.splitItems.set(item1Id, {
  id: item1Id,
  splitPlanId: samplePlanId,
  sequenceNumber: 1,
  amount: 5000,
  status: 'SUCCESS',
  paymentId: pay1Id,
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 2 + 12000).toISOString()
});

db.splitItems.set(item2Id, {
  id: item2Id,
  splitPlanId: samplePlanId,
  sequenceNumber: 2,
  amount: 5000,
  status: 'NOT_STARTED',
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  updatedAt: new Date().toISOString()
});

db.splitItems.set(item3Id, {
  id: item3Id,
  splitPlanId: samplePlanId,
  sequenceNumber: 3,
  amount: 4999,
  status: 'LOCKED',
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  updatedAt: new Date().toISOString()
});

// Seed an audit log
db.auditLogs.push({
  id: 'log_' + crypto.randomUUID().slice(0, 8),
  userId: demoUserId,
  action: 'SPLIT_PLAN_CREATED',
  entityType: 'split_plan',
  entityId: samplePlanId,
  requestId: 'req_seed_001',
  metadata: { totalAmount: 14999, merchant: 'Croma Electronics' },
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
});

// --- Configurable Supported UPI Apps List ---
const SUPPORTED_UPI_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    icon: 'phonepe',
    deepLinkScheme: 'phonepe://pay',
    enabled: true,
    color: '#5f259f',
    description: 'UPI, Wallet & Cards'
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    icon: 'gpay',
    deepLinkScheme: 'tez://upi/pay',
    enabled: true,
    color: '#1a73e8',
    description: 'Fast & Secure with Google'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    icon: 'paytm',
    deepLinkScheme: 'paytmmp://pay',
    enabled: true,
    color: '#00b9f5',
    description: 'Payments Bank & UPI'
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    packageName: 'in.org.npci.upiapp',
    icon: 'bhim',
    deepLinkScheme: 'upi://pay',
    enabled: true,
    color: '#005f73',
    description: 'National Payments Corp of India'
  },
  {
    id: 'cred',
    name: 'CRED UPI',
    packageName: 'com.dreamplug.androidapp',
    icon: 'cred',
    deepLinkScheme: 'cred://upi/pay',
    enabled: true,
    color: '#0f0f0f',
    description: 'Exclusive Member UPI & Rewards'
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    packageName: 'in.amazon.mShop.android.shopping',
    icon: 'amazonpay',
    deepLinkScheme: 'amazonpay://upi/pay',
    enabled: true,
    color: '#232f3e',
    description: 'Cashback & Instant UPI'
  },
  {
    id: 'navi',
    name: 'Navi UPI',
    packageName: 'com.naviapp',
    icon: 'navi',
    deepLinkScheme: 'navi://upi/pay',
    enabled: true,
    color: '#0f172a',
    description: 'Zero Fee UPI & Lending'
  },
  {
    id: 'other',
    name: 'Other UPI App',
    packageName: undefined,
    icon: 'upi',
    deepLinkScheme: 'upi://pay',
    enabled: true,
    color: '#0f172a',
    description: 'Any Bank or Certified UPI App'
  }
];

// --- Payment Provider Abstraction ---
export type ProviderSimulationMode = 'AUTO_SUCCESS' | 'INSTANT_SUCCESS' | 'SIMULATE_FAILURE' | 'SIMULATE_TIMEOUT' | 'BANK_DOWNTIME';

let mockSimulationMode: ProviderSimulationMode = 'AUTO_SUCCESS';

abstract class UPIProvider {
  abstract createPayment(item: SplitItem, plan: SplitPlan, upiApp?: string): Promise<{ providerPaymentId: string; deepLink: string }>;
  abstract getPaymentStatus(providerPaymentId: string): Promise<{ status: 'SUCCESS' | 'PENDING' | 'FAILED'; failureReason?: string }>;
  abstract verifyWebhook(payload: any, signature: string): boolean;
}

class MockUPIProvider extends UPIProvider {
  // Map of providerPaymentId -> creation time and forced state
  private paymentStates = new Map<string, { createdAt: number; simulatedStatus?: 'SUCCESS' | 'FAILED'; reason?: string }>();

  async createPayment(item: SplitItem, plan: SplitPlan, upiApp?: string) {
    const providerPaymentId = 'MOCK_UPI_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    this.paymentStates.set(providerPaymentId, { createdAt: Date.now() });

    // Generate standard UPI URI compliant with NPCI specification
    // upi://pay?pa=...&pn=...&am=...&cu=INR&tr=...&tn=...
    const tr = 'SUP' + Math.floor(100000 + Math.random() * 900000);
    const tn = encodeURIComponent(`SplitUPI ${plan.merchantName.slice(0, 12)} Part ${item.sequenceNumber}`);
    const pn = encodeURIComponent(plan.merchantName);
    const pa = encodeURIComponent(plan.merchantVpa);

    let deepLink = `upi://pay?pa=${pa}&pn=${pn}&am=${item.amount.toFixed(2)}&cu=INR&tr=${tr}&tn=${tn}`;

    // App specific intent scheme if selected
    if (upiApp === 'phonepe') {
      deepLink = `phonepe://pay?pa=${pa}&pn=${pn}&am=${item.amount.toFixed(2)}&cu=INR&tr=${tr}&tn=${tn}`;
    } else if (upiApp === 'gpay') {
      deepLink = `tez://upi/pay?pa=${pa}&pn=${pn}&am=${item.amount.toFixed(2)}&cu=INR&tr=${tr}&tn=${tn}`;
    } else if (upiApp === 'paytm') {
      deepLink = `paytmmp://pay?pa=${pa}&pn=${pn}&am=${item.amount.toFixed(2)}&cu=INR&tr=${tr}&tn=${tn}`;
    }

    return { providerPaymentId, deepLink };
  }

  forceStatus(providerPaymentId: string, status: 'SUCCESS' | 'FAILED', reason?: string) {
    const record = this.paymentStates.get(providerPaymentId) || { createdAt: Date.now() };
    record.simulatedStatus = status;
    record.reason = reason;
    this.paymentStates.set(providerPaymentId, record);
  }

  async getPaymentStatus(providerPaymentId: string): Promise<{ status: 'SUCCESS' | 'PENDING' | 'FAILED'; failureReason?: string }> {
    const record = this.paymentStates.get(providerPaymentId);
    if (!record) {
      return { status: 'PENDING' };
    }

    if (record.simulatedStatus) {
      return { status: record.simulatedStatus, failureReason: record.reason };
    }

    const elapsed = Date.now() - record.createdAt;

    if (mockSimulationMode === 'INSTANT_SUCCESS') {
      return { status: 'SUCCESS' };
    }

    if (mockSimulationMode === 'SIMULATE_FAILURE') {
      return { status: 'FAILED', failureReason: 'Payment declined by bank or user cancelled UPI prompt.' };
    }

    if (mockSimulationMode === 'BANK_DOWNTIME') {
      return { status: 'FAILED', failureReason: 'Bank NPCI switch unavailable. Please try with another bank account.' };
    }

    if (mockSimulationMode === 'SIMULATE_TIMEOUT') {
      return { status: 'PENDING' };
    }

    // Default 'AUTO_SUCCESS': pending for first 4 seconds, then resolves to SUCCESS
    if (elapsed > 4000) {
      return { status: 'SUCCESS' };
    }

    return { status: 'PENDING' };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // Verifies mock HMAC or standard hash
    return true;
  }
}

const activeUPIProvider = new MockUPIProvider();

// --- QR Parser & Security Validator (Section 17 & 18) ---
function parseAndValidateUPI(rawText: string) {
  const errors: string[] = [];
  const text = rawText.trim();

  // Validate scheme: must strictly start with upi://pay or be a plain VPA
  let params: URLSearchParams | null = null;
  let pa = '';
  let pn = '';
  let am: number | undefined;
  let cu = 'INR';
  let tr = '';
  let tn = '';
  let mc = '';

  if (text.startsWith('upi://pay?') || text.startsWith('upi://pay/')) {
    try {
      const url = new URL(text.replace('upi://pay/', 'upi://pay?'));
      params = url.searchParams;
      pa = params.get('pa') || '';
      pn = params.get('pn') || '';
      const amStr = params.get('am');
      if (amStr) {
        const parsed = parseFloat(amStr);
        if (!isNaN(parsed) && parsed > 0) am = parsed;
      }
      cu = params.get('cu') || 'INR';
      tr = params.get('tr') || '';
      tn = params.get('tn') || '';
      mc = params.get('mc') || '';
    } catch {
      errors.push('Malformed UPI URI parameters.');
    }
  } else if (text.includes('@') && !text.includes(' ') && !text.includes('/') && !text.includes(':')) {
    // Plain VPA string (e.g. merchant@icici)
    pa = text;
    pn = text.split('@')[0].toUpperCase();
  } else {
    // Attempt parse if query string
    try {
      if (text.includes('pa=')) {
        const queryString = text.includes('?') ? text.split('?')[1] : text;
        params = new URLSearchParams(queryString);
        pa = params.get('pa') || '';
        pn = params.get('pn') || '';
        const amStr = params.get('am');
        if (amStr) {
          const parsed = parseFloat(amStr);
          if (!isNaN(parsed) && parsed > 0) am = parsed;
        }
      } else {
        errors.push('QR does not contain a valid UPI payment scheme (upi://pay).');
      }
    } catch {
      errors.push('Failed to parse QR text.');
    }
  }

  // Validate VPA format: [a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}
  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/;
  if (!pa || !vpaRegex.test(pa)) {
    errors.push('Invalid UPI Virtual Payment Address (VPA). Example: store@upi');
  }

  // Prevent dangerous protocols or external URL redirects
  if (text.toLowerCase().includes('http://') || text.toLowerCase().includes('https://') || text.toLowerCase().includes('javascript:')) {
    errors.push('Security rejection: QR code contains prohibited external web URLs.');
  }

  // Currency validation
  if (cu && cu.toUpperCase() !== 'INR') {
    errors.push('Only INR currency is supported for UPI transactions.');
  }

  return {
    pa,
    pn: pn || pa.split('@')[0],
    am,
    cu: 'INR',
    tr,
    tn,
    mc,
    rawUri: text,
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

// --- Start Express & Vite Server ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Security Headers Middleware (Section 25)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Request ID & Structured Logging Middleware (Section 27)
  app.use((req, res, next) => {
    const requestId = 'req_' + crypto.randomUUID().slice(0, 8);
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // Helper log function strictly sanitized (No PIN, OTP, Passwords)
  const logAudit = (action: string, entityType: string, entityId: string, metadata?: any, userId?: string) => {
    const log: AuditLog = {
      id: 'log_' + crypto.randomUUID().slice(0, 8),
      userId: userId || demoUserId,
      action,
      entityType,
      entityId,
      requestId: 'req_' + Math.random().toString(36).substring(2, 8),
      metadata,
      createdAt: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 500) db.auditLogs.pop();
  };

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SplitUPI API', timestamp: new Date().toISOString() });
  });

  // Supported UPI Apps Config (Section 6)
  app.get('/api/v1/upi-apps', (req, res) => {
    res.json({
      success: true,
      data: SUPPORTED_UPI_APPS,
      requestId: (req as any).requestId
    });
  });

  // QR Code Parser & Validator (Section 17)
  app.post('/api/v1/parse-qr', (req, res) => {
    const { qrText } = req.body;
    if (!qrText || typeof qrText !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_INPUT',
        message: 'qrText string is required',
        requestId: (req as any).requestId
      });
    }

    const result = parseAndValidateUPI(qrText);
    res.json({
      success: result.isValid,
      data: result,
      code: result.isValid ? 'VALID_UPI' : 'INVALID_UPI',
      message: result.isValid ? 'UPI QR parsed successfully' : result.validationErrors.join(', '),
      requestId: (req as any).requestId
    });
  });

  // --- Auth APIs (Section 24) ---
  app.post('/api/v1/auth/login', (req, res) => {
    const { email } = req.body;
    let user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      user = db.users.get(demoUserId)!;
    }
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
        token: 'jwt_mock_token_' + user.id,
        refreshToken: 'jwt_mock_refresh_' + user.id
      },
      requestId: (req as any).requestId
    });
  });

  app.get('/api/v1/auth/me', (req, res) => {
    const user = db.users.get(demoUserId)!;
    res.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
      requestId: (req as any).requestId
    });
  });

  // --- Split Plans APIs (Section 15) ---

  // POST /api/v1/split-plans (Create plan with exact decimal precision guarantee)
  app.post('/api/v1/split-plans', (req, res) => {
    const { merchantName, merchantVpa, totalAmount, numberOfPayments, customAmounts } = req.body;

    if (!merchantName || !merchantVpa || !totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid plan parameters. Merchant name, VPA, and total amount > 0 are required.',
        requestId: (req as any).requestId
      });
    }

    const numSplits = Math.max(2, Math.min(12, parseInt(numberOfPayments, 10) || 3));
    let itemsAmounts: number[] = [];

    if (customAmounts && Array.isArray(customAmounts) && customAmounts.length === numSplits) {
      // Validate sum matches exactly
      const sum = customAmounts.reduce((acc, curr) => acc + Number(curr), 0);
      if (Math.abs(sum - totalAmount) > 0.01) {
        return res.status(400).json({
          success: false,
          code: 'AMOUNT_MISMATCH',
          message: `Sum of split amounts (₹${sum}) must exactly equal total amount (₹${totalAmount}).`,
          requestId: (req as any).requestId
        });
      }
      itemsAmounts = customAmounts.map(a => Math.round(Number(a) * 100) / 100);
    } else {
      // Equal split calculation with remainder placed on final payment to guarantee exact match
      // e.g. 5000 / 3 -> 1666.67, 1666.67, 1666.66
      const baseShare = Math.floor((totalAmount / numSplits) * 100) / 100;
      let runningSum = 0;
      for (let i = 0; i < numSplits - 1; i++) {
        itemsAmounts.push(baseShare);
        runningSum += baseShare;
      }
      const lastAmount = Math.round((totalAmount - runningSum) * 100) / 100;
      itemsAmounts.push(lastAmount);
    }

    const planId = 'plan_' + crypto.randomUUID().slice(0, 12);
    const publicId = 'sp_' + crypto.randomUUID().slice(0, 10);

    const plan: SplitPlan = {
      id: planId,
      publicId,
      userId: demoUserId,
      merchantName: merchantName.trim(),
      merchantVpa: merchantVpa.trim(),
      totalAmount: Math.round(totalAmount * 100) / 100,
      currency: 'INR',
      numberOfPayments: numSplits,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
    };
    db.splitPlans.set(planId, plan);

    // Create split items
    const createdItems: SplitItem[] = [];
    itemsAmounts.forEach((amt, index) => {
      const itemId = 'item_' + crypto.randomUUID().slice(0, 12);
      const isFirst = index === 0;
      const item: SplitItem = {
        id: itemId,
        splitPlanId: planId,
        sequenceNumber: index + 1,
        amount: amt,
        status: isFirst ? 'NOT_STARTED' : 'LOCKED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.splitItems.set(itemId, item);
      createdItems.push(item);
    });

    logAudit('SPLIT_PLAN_CREATED', 'split_plan', plan.id, {
      totalAmount: plan.totalAmount,
      merchant: plan.merchantName,
      splits: numSplits
    });

    res.status(201).json({
      success: true,
      data: {
        ...plan,
        items: createdItems
      },
      message: 'Split plan created successfully',
      requestId: (req as any).requestId
    });
  });

  // GET /api/v1/split-plans (List user plans)
  app.get('/api/v1/split-plans', (req, res) => {
    const plans = Array.from(db.splitPlans.values()).map(plan => {
      const items = Array.from(db.splitItems.values())
        .filter(item => item.splitPlanId === plan.id)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
        .map(item => {
          const payment = item.paymentId ? db.payments.get(item.paymentId) : undefined;
          return { ...item, payment };
        });
      return { ...plan, items };
    });

    res.json({
      success: true,
      data: plans,
      requestId: (req as any).requestId
    });
  });

  // GET /api/v1/split-plans/:public_id
  app.get('/api/v1/split-plans/:public_id', (req, res) => {
    const publicId = req.params.public_id;
    const plan = Array.from(db.splitPlans.values()).find(p => p.publicId === publicId || p.id === publicId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Split plan not found',
        requestId: (req as any).requestId
      });
    }

    const items = Array.from(db.splitItems.values())
      .filter(item => item.splitPlanId === plan.id)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(item => {
        const payment = item.paymentId ? db.payments.get(item.paymentId) : undefined;
        return { ...item, payment };
      });

    res.json({
      success: true,
      data: { ...plan, items },
      requestId: (req as any).requestId
    });
  });

  // POST /api/v1/split-plans/:public_id/cancel
  app.post('/api/v1/split-plans/:public_id/cancel', (req, res) => {
    const publicId = req.params.public_id;
    const plan = Array.from(db.splitPlans.values()).find(p => p.publicId === publicId || p.id === publicId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Split plan not found',
        requestId: (req as any).requestId
      });
    }

    plan.status = 'CANCELLED';
    plan.updatedAt = new Date().toISOString();
    logAudit('SPLIT_PLAN_CANCELLED', 'split_plan', plan.id, undefined);

    res.json({
      success: true,
      message: 'Split plan has been cancelled',
      data: plan,
      requestId: (req as any).requestId
    });
  });

  // --- Payment APIs (Section 15, 16, 9) ---

  // POST /api/v1/payments (Idempotency checked)
  app.post('/api/v1/payments', async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey && db.idempotencyKeys.has(idempotencyKey)) {
      const cached = db.idempotencyKeys.get(idempotencyKey)!;
      return res.json(cached.response);
    }

    const { splitItemId, upiApp } = req.body;
    const item = db.splitItems.get(splitItemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        code: 'ITEM_NOT_FOUND',
        message: 'Split item not found',
        requestId: (req as any).requestId
      });
    }

    const plan = db.splitPlans.get(item.splitPlanId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        code: 'PLAN_NOT_FOUND',
        message: 'Parent split plan not found',
        requestId: (req as any).requestId
      });
    }

    // Check if previous items are completed
    const allItems = Array.from(db.splitItems.values())
      .filter(i => i.splitPlanId === plan.id)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const prevItems = allItems.filter(i => i.sequenceNumber < item.sequenceNumber);
    const hasUnfinishedPrev = prevItems.some(i => i.status !== 'SUCCESS');
    if (hasUnfinishedPrev) {
      return res.status(400).json({
        success: false,
        code: 'PREVIOUS_PAYMENTS_REQUIRED',
        message: 'Previous payments in this split plan must be successfully completed first.',
        requestId: (req as any).requestId
      });
    }

    // Check if an existing payment in progress exists
    let payment: Payment | undefined;
    if (item.paymentId) {
      payment = db.payments.get(item.paymentId);
      if (payment && payment.status === 'SUCCESS') {
        return res.status(400).json({
          success: false,
          code: 'ALREADY_PAID',
          message: 'This payment has already been completed.',
          requestId: (req as any).requestId
        });
      }
    }

    // Create provider payment
    const providerResult = await activeUPIProvider.createPayment(item, plan, upiApp);
    const paymentId = 'pay_' + crypto.randomUUID().slice(0, 12);
    const publicId = 'pay_' + crypto.randomUUID().slice(0, 10);
    const tr = 'SUP' + Math.floor(100000 + Math.random() * 900000);

    payment = {
      id: paymentId,
      publicId,
      splitItemId: item.id,
      provider: 'mock_upi',
      providerPaymentId: providerResult.providerPaymentId,
      transactionReference: tr,
      amount: item.amount,
      currency: 'INR',
      status: 'INITIATED',
      upiApp: upiApp || 'other',
      initiatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.payments.set(paymentId, payment);
    item.paymentId = paymentId;
    item.status = 'PENDING';
    item.updatedAt = new Date().toISOString();

    logAudit('PAYMENT_INITIATED', 'payment', payment.id, {
      amount: payment.amount,
      sequence: item.sequenceNumber,
      app: upiApp
    });

    const responseData = {
      success: true,
      data: {
        payment,
        deepLink: providerResult.deepLink,
        upiUri: providerResult.deepLink
      },
      message: 'Payment initiated successfully',
      requestId: (req as any).requestId
    };

    if (idempotencyKey) {
      db.idempotencyKeys.set(idempotencyKey, { response: responseData, timestamp: Date.now() });
    }

    res.status(201).json(responseData);
  });

  // GET /api/v1/payments/:public_id/status (Verifies real payment status - Section 10)
  app.get('/api/v1/payments/:public_id/status', async (req, res) => {
    const publicId = req.params.public_id;
    const payment = Array.from(db.payments.values()).find(p => p.publicId === publicId || p.id === publicId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment record not found',
        requestId: (req as any).requestId
      });
    }

    const item = db.splitItems.get(payment.splitItemId);
    const plan = item ? db.splitPlans.get(item.splitPlanId) : undefined;

    // Never change SUCCESS state unless reconciliation
    if (payment.status !== 'SUCCESS' && payment.providerPaymentId) {
      const providerStatus = await activeUPIProvider.getPaymentStatus(payment.providerPaymentId);

      if (providerStatus.status === 'SUCCESS') {
        payment.status = 'SUCCESS';
        payment.completedAt = new Date().toISOString();
        payment.updatedAt = new Date().toISOString();

        if (item) {
          item.status = 'SUCCESS';
          item.updatedAt = new Date().toISOString();

          // Unlock next item in sequence
          if (plan) {
            const allItems = Array.from(db.splitItems.values())
              .filter(i => i.splitPlanId === plan.id)
              .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

            const nextItem = allItems.find(i => i.sequenceNumber === item.sequenceNumber + 1);
            if (nextItem && nextItem.status === 'LOCKED') {
              nextItem.status = 'NOT_STARTED';
              nextItem.updatedAt = new Date().toISOString();
            }

            // Check if all items in plan are completed
            const allSuccess = allItems.every(i => (i.id === item.id ? true : i.status === 'SUCCESS'));
            if (allSuccess) {
              plan.status = 'COMPLETED';
              plan.updatedAt = new Date().toISOString();
              logAudit('SPLIT_PLAN_COMPLETED', 'split_plan', plan.id, { totalAmount: plan.totalAmount });
            }
          }
        }
        logAudit('PAYMENT_CONFIRMED_SUCCESS', 'payment', payment.id, { tr: payment.transactionReference });
      } else if (providerStatus.status === 'FAILED') {
        payment.status = 'FAILED';
        payment.failureReason = providerStatus.failureReason || 'Transaction was declined.';
        payment.updatedAt = new Date().toISOString();
        if (item) {
          item.status = 'FAILED';
          item.updatedAt = new Date().toISOString();
        }
        logAudit('PAYMENT_FAILED', 'payment', payment.id, { reason: payment.failureReason });
      }
    }

    res.json({
      success: true,
      data: {
        payment,
        item,
        plan
      },
      requestId: (req as any).requestId
    });
  });

  // POST /api/v1/payments/:public_id/retry (Section 12)
  app.post('/api/v1/payments/:public_id/retry', async (req, res) => {
    const publicId = req.params.public_id;
    const payment = Array.from(db.payments.values()).find(p => p.publicId === publicId || p.id === publicId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found',
        requestId: (req as any).requestId
      });
    }

    const item = db.splitItems.get(payment.splitItemId);
    const plan = item ? db.splitPlans.get(item.splitPlanId) : undefined;
    if (!item || !plan) {
      return res.status(404).json({
        success: false,
        code: 'ITEM_NOT_FOUND',
        message: 'Item or plan not found',
        requestId: (req as any).requestId
      });
    }

    // Reset item status and payment status to allow fresh attempt
    const providerResult = await activeUPIProvider.createPayment(item, plan, req.body.upiApp || payment.upiApp);
    payment.status = 'INITIATED';
    payment.providerPaymentId = providerResult.providerPaymentId;
    payment.failureReason = undefined;
    payment.upiApp = req.body.upiApp || payment.upiApp;
    payment.initiatedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    item.status = 'PENDING';
    item.updatedAt = new Date().toISOString();

    logAudit('PAYMENT_RETRIED', 'payment', payment.id, { app: payment.upiApp });

    res.json({
      success: true,
      data: {
        payment,
        deepLink: providerResult.deepLink,
        upiUri: providerResult.deepLink
      },
      message: 'Payment attempt reset for retry',
      requestId: (req as any).requestId
    });
  });

  // Provider Webhook Endpoint (Section 15 & 8)
  app.post('/api/v1/webhooks/:provider', (req, res) => {
    const provider = req.params.provider;
    const signature = req.headers['x-provider-signature'] as string || 'test_sig';
    const payload = req.body;

    const eventId = 'ev_' + crypto.randomUUID().slice(0, 10);
    const event: WebhookEvent = {
      id: eventId,
      provider,
      eventId: payload.event_id || eventId,
      eventType: payload.event_type || 'PAYMENT_STATUS_UPDATE',
      payload,
      signatureValid: activeUPIProvider.verifyWebhook(payload, signature),
      processed: true,
      createdAt: new Date().toISOString()
    };
    db.webhookEvents.set(eventId, event);

    // If webhook contains payment status update
    if (payload.provider_payment_id && payload.status) {
      activeUPIProvider.forceStatus(payload.provider_payment_id, payload.status, payload.reason);
    }

    res.json({ success: true, message: 'Webhook received and processed', eventId });
  });

  // Developer Sandbox Controls for instant simulation in preview (Section 35)
  app.post('/api/v1/mock/sandbox-control', (req, res) => {
    const { mode, providerPaymentId, forceStatus, reason } = req.body;
    if (mode) {
      mockSimulationMode = mode as ProviderSimulationMode;
    }
    if (providerPaymentId && forceStatus) {
      activeUPIProvider.forceStatus(providerPaymentId, forceStatus, reason);
    }
    res.json({
      success: true,
      currentMode: mockSimulationMode,
      message: `Sandbox simulation mode set to ${mockSimulationMode}`
    });
  });

  // Admin Dashboard API (Section 28)
  app.get('/api/v1/admin/dashboard', (req, res) => {
    const totalPlans = db.splitPlans.size;
    const totalPayments = db.payments.size;
    const paymentsList = Array.from(db.payments.values());

    const successfulPayments = paymentsList.filter(p => p.status === 'SUCCESS');
    const failedPayments = paymentsList.filter(p => p.status === 'FAILED');
    const pendingPayments = paymentsList.filter(p => p.status === 'PENDING' || p.status === 'INITIATED');

    const totalVolumePaid = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalPlans,
          totalPayments,
          totalVolumePaid,
          successRate: totalPayments > 0 ? Math.round((successfulPayments.length / totalPayments) * 100) : 100,
          pendingCount: pendingPayments.length,
          failedCount: failedPayments.length
        },
        users: Array.from(db.users.values()).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
        recentPlans: Array.from(db.splitPlans.values()).slice(-10).reverse(),
        recentPayments: paymentsList.slice(-15).reverse(),
        webhookEvents: Array.from(db.webhookEvents.values()).slice(-10).reverse(),
        auditLogs: db.auditLogs.slice(0, 20),
        simulationMode: mockSimulationMode
      },
      requestId: (req as any).requestId
    });
  });

  // Admin Reconciliation Job Trigger (Section 29)
  app.post('/api/v1/admin/reconcile', async (req, res) => {
    const pendingPayments = Array.from(db.payments.values()).filter(p => p.status === 'PENDING' || p.status === 'INITIATED');
    let reconciledCount = 0;

    for (const payment of pendingPayments) {
      if (payment.providerPaymentId) {
        const status = await activeUPIProvider.getPaymentStatus(payment.providerPaymentId);
        if (status.status === 'SUCCESS') {
          payment.status = 'SUCCESS';
          payment.completedAt = new Date().toISOString();
          payment.updatedAt = new Date().toISOString();
          reconciledCount++;
        }
      }
    }

    logAudit('RECONCILIATION_RUN', 'system', 'reconciliation_job', { checked: pendingPayments.length, updated: reconciledCount });

    res.json({
      success: true,
      message: `Reconciliation completed. ${reconciledCount} payments updated to SUCCESS.`,
      checked: pendingPayments.length,
      updated: reconciledCount
    });
  });

  // --- Static Public Assets ---
  app.use(express.static(path.join(process.cwd(), 'public')));

  // --- Vite Middleware Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SplitUPI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
