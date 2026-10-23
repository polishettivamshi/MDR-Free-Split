import { ParsedUPI } from '../types';

export function parseUPIUri(rawText: string): ParsedUPI {
  const errors: string[] = [];
  const text = rawText.replace(/^\uFEFF/, '').trim();
  const lowerText = text.toLowerCase();

  let pa = '';
  let pn = '';
  let am: number | undefined;
  let cu = 'INR';
  let tr = '';
  let tn = '';
  let mc = '';

  if (lowerText.startsWith('upi://pay?') || lowerText.startsWith('upi://pay/')) {
    try {
      const normalizedText = text.replace(/^upi:\/\/pay\//i, 'upi://pay?');
      const url = new URL(normalizedText);
      const params = url.searchParams;
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
      errors.push('Malformed UPI URI parameters');
    }
  } else if (text.includes('@') && !text.includes(' ') && !text.includes('/') && !text.includes(':')) {
    // Plain VPA string
    pa = text;
    pn = text.split('@')[0].toUpperCase();
  } else if (text.includes('pa=')) {
    try {
      const queryString = text.includes('?') ? text.split('?')[1] : text;
      const params = new URLSearchParams(queryString);
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
      errors.push('Could not parse query parameters in QR text');
    }
  } else {
    errors.push('QR content does not contain a recognized UPI payment scheme');
  }

  // Reject web links, but allow valid UPI links that carry a URL in an extra parameter.
  if (lowerText.startsWith('http://') || lowerText.startsWith('https://') || lowerText.startsWith('javascript:')) {
    errors.push('Security rejection: QR code contains a prohibited external web URL.');
  }

  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z0-9.\-_]{2,}$/;
  if (!pa || !vpaRegex.test(pa)) {
    errors.push('Invalid UPI VPA format (e.g. merchant@icici or brand@okhdfcbank)');
  }

  if (cu && cu.toUpperCase() !== 'INR') {
    errors.push('Only INR currency is supported for UPI');
  }

  return {
    pa,
    pn: pn || (pa ? pa.split('@')[0] : 'Merchant'),
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

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}
