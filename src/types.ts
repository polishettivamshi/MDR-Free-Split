export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type ItemStatus = 'NOT_STARTED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'LOCKED';
export type PaymentStatus = 'CREATED' | 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface SplitPlan {
  id: string;
  publicId: string;
  userId: string;
  merchantName: string;
  merchantVpa: string;
  totalAmount: number;
  currency: string;
  numberOfPayments: number;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  items?: SplitItem[];
}

export interface SplitItem {
  id: string;
  splitPlanId: string;
  sequenceNumber: number;
  amount: number;
  status: ItemStatus;
  paymentId?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  publicId: string;
  splitItemId: string;
  provider: string;
  providerPaymentId?: string;
  transactionReference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  upiApp?: string;
  initiatedAt?: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UPIApp {
  id: string;
  name: string;
  packageName?: string;
  icon: string;
  deepLinkScheme?: string;
  enabled: boolean;
  color: string;
  description: string;
}

export interface ParsedUPI {
  pa: string; // Payee VPA
  pn: string; // Payee Name
  am?: number; // Amount
  cu: string; // Currency
  tr?: string; // Transaction Ref
  tn?: string; // Note
  mc?: string; // Merchant Code
  rawUri?: string;
  isValid: boolean;
  validationErrors: string[];
}

export interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  signatureValid: boolean;
  processed: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  requestId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
  requestId: string;
}
