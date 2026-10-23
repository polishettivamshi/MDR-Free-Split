export interface SplitPlan {
  id: string;
  publicId: string;
  merchantName: string;
  merchantVpa: string;
  totalAmount: number;
  currency: string;
  numberOfPayments: number;
  createdAt: string;
  updatedAt: string;
  items?: SplitItem[];
}

export interface SplitItem {
  id: string;
  splitPlanId: string;
  sequenceNumber: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
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

export interface UPITaxCategory {
  id: string;
  name: string;
  mccCodes: string[];
  threshold: number;
  interchangePercent: number;
  gstPercent: number;
  effectivePercent: number;
  note: string;
}

export interface UPITaxRule {
  effectiveDate: string;
  lastUpdated: string;
  authority: string;
  currency: string;
  exemptionThreshold: number;
  baseInterchangeRatePercent: number;
  gstRatePercent: number;
  effectiveTaxRatePercent: number;
  mdrCapAmount?: number;
  mdrCapThreshold?: number;
  categories: UPITaxCategory[];
  rules: {
    underThresholdTax: number;
    description: string;
  };
}

export interface SplitOptionTaxComparison {
  splitCount: number;
  perInstallmentAmount: number;
  isExempt: boolean;
  totalTax: number;
  savingsVsFull: number;
  recommendationNote: string;
}

export interface UPITaxCalculationResult {
  totalAmount: number;
  exemptionThreshold: number;
  effectiveTaxRatePercent: number;
  singlePaymentTax: number;
  singlePaymentExceeds: boolean;
  installments: {
    sequenceNumber: number;
    amount: number;
    exceedsThreshold: boolean;
    taxAmount: number;
    taxRatePercent: number;
  }[];
  totalSplitTax: number;
  taxSaved: number;
  isFullyExempt: boolean;
  splitOptions: SplitOptionTaxComparison[];
  recommendedSplitCount: number;
}
