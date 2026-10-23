import React from 'react';

export type UpiAppType =
  | 'phonepe'
  | 'gpay'
  | 'googlepay'
  | 'paytm'
  | 'bhim'
  | 'cred'
  | 'amazonpay'
  | 'amazon'
  | 'navi'
  | 'whatsapp'
  | 'upi'
  | 'other';

interface UpiAppIconProps {
  app: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

/** Small brand marks for UPI apps. This site never handles a payment itself. */
export const UpiAppIcon: React.FC<UpiAppIconProps> = ({
  app,
  size = 'md',
  className = '',
  showBadge = false
}) => {
  const normalized = (app || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  }[size];

  const getIconMeta = (): { src: string; name: string } => {
    if (normalized.includes('phonepe')) {
      return { src: '/icons/phonepe.svg', name: 'PhonePe' };
    }
    if (normalized.includes('gpay') || normalized.includes('google') || normalized.includes('tez')) {
      return { src: '/icons/gpay.svg', name: 'Google Pay' };
    }
    if (normalized.includes('paytm')) {
      return { src: '/icons/paytm.svg', name: 'Paytm' };
    }
    if (normalized.includes('bhim') || normalized.includes('bhmi')) {
      return { src: '/icons/bhim.svg', name: 'BHIM UPI' };
    }
    if (normalized.includes('cred')) {
      return { src: '/icons/cred.svg', name: 'CRED UPI' };
    }
    if (normalized.includes('amazon')) {
      return { src: '/icons/amazonpay.svg', name: 'Amazon Pay' };
    }
    if (normalized.includes('navi')) {
      return { src: '/icons/navi.svg', name: 'Navi UPI' };
    }
    if (normalized.includes('whatsapp')) {
      return { src: '/icons/whatsapp.svg', name: 'WhatsApp Pay' };
    }
    if (normalized.includes('bank') || normalized.includes('other')) {
      return { src: '/icons/bank.svg', name: 'Bank UPI app' };
    }
    return { src: '/icons/upi.svg', name: 'UPI app' };
  };

  const meta = getIconMeta();

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      <span className={`${sizeClasses} flex items-center justify-center ${className}`}>
        <img
          src={meta.src}
          alt={meta.name}
          className="h-full w-full select-none rounded-xl object-contain shadow-xs"
          loading="lazy"
          draggable={false}
        />
      </span>
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
};
