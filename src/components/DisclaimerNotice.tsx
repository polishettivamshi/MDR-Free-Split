import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerNoticeProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}

/**
 * Consistent, explicit notice that this site only scans, calculates and
 * redirects to a UPI app. It never collects money or tracks payment status.
 */
export const DisclaimerNotice: React.FC<DisclaimerNoticeProps> = ({
  variant = 'light',
  compact = false,
  className = ''
}) => {
  const dark = variant === 'dark';

  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        dark
          ? 'border-amber-400/30 bg-amber-400/10'
          : 'border-amber-200 bg-amber-50'
      } ${className}`}
    >
      <AlertTriangle
        className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-amber-300' : 'text-amber-600'}`}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className={`text-xs font-bold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
          Calculation tool only — payment happens in your UPI app
        </p>
        {compact ? (
          <p className={`mt-1 text-[11px] leading-relaxed ${dark ? 'text-amber-100/80' : 'text-amber-800'}`}>
            MDR Free Split only calculates the split and opens a UPI payment link. It does not
            collect funds, confirm payments, or issue refunds. Pay the merchant directly in your
            UPI app.
          </p>
        ) : (
          <p className={`mt-1 text-[11px] leading-relaxed ${dark ? 'text-amber-100/80' : 'text-amber-800'}`}>
            MDR Free Split is an independent calculator and split-planning tool. It does not
            collect funds, confirm or settle payments, or issue refunds. All payments are made
            directly to the merchant through your UPI app. No refunds are provided by this
            website.
          </p>
        )}
      </div>
    </div>
  );
};
