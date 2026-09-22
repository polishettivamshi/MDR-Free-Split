import React from 'react';

export type GatewayType = 
  | 'phonepe' 
  | 'gpay' 
  | 'googlepay' 
  | 'paytm' 
  | 'bhim' 
  | 'cred' 
  | 'amazonpay' 
  | 'amazon' 
  | 'navi' 
  | 'razorpay' 
  | 'cashfree' 
  | 'upi' 
  | 'other';

interface PaymentGatewayIconProps {
  gateway: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const PaymentGatewayIcon: React.FC<PaymentGatewayIconProps> = ({
  gateway,
  size = 'md',
  className = '',
  showBadge = false
}) => {
  const normalized = (gateway || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg'
  }[size];

  // Authentic Vector Brand Icons for Payment Gateways & UPI Apps (saved in /public/icons/)
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
      return { src: '/icons/cred.svg', name: 'CRED' };
    }
    if (normalized.includes('amazon')) {
      return { src: '/icons/amazonpay.svg', name: 'Amazon Pay' };
    }
    if (normalized.includes('navi')) {
      return { src: '/icons/navi.svg', name: 'Navi UPI' };
    }
    if (normalized.includes('razorpay')) {
      return { src: '/icons/razorpay.svg', name: 'Razorpay' };
    }
    if (normalized.includes('cashfree')) {
      return { src: '/icons/cashfree.svg', name: 'Cashfree' };
    }
    if (normalized.includes('whatsapp')) {
      return { src: '/icons/whatsapp.svg', name: 'WhatsApp Pay' };
    }
    if (normalized.includes('bank') || normalized.includes('other') || normalized.includes('netbanking')) {
      return { src: '/icons/bank.svg', name: 'All Bank UPI' };
    }
    return { src: '/icons/upi.svg', name: 'NPCI UPI' };
  };

  const renderIcon = () => {
    const meta = getIconMeta();
    return (
      <div 
        className={`${sizeClasses} shrink-0 relative flex items-center justify-center ${className}`}
        title={meta.name}
      >
        <img 
          src={meta.src} 
          alt={meta.name} 
          className="w-full h-full object-contain select-none rounded-xl shadow-xs"
          loading="lazy"
          draggable={false}
        />
      </div>
    );
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {renderIcon()}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
      )}
    </div>
  );
};
