export interface HomeFaq {
  q: string;
  a: string;
}

export const HOME_FAQS: HomeFaq[] = [
  {
    q: 'What is MDR Free Split?',
    a: 'MDR Free Split divides a merchant UPI bill into installments and shows how the standard ₹2,000 threshold affects an MDR estimate. It is a calculator and planner, not a payment service. The merchant’s actual MDR depends on their classification, category, provider fees and GST.'
  },
  {
    q: 'Does it store my UPI PIN?',
    a: 'Never. You enter your UPI PIN only inside your official UPI app (PhonePe, Google Pay, Paytm, BHIM). MDR Free Split never sees, collects, or stores your PIN, OTP, or card data.'
  },
  {
    q: 'Which UPI apps work?',
    a: 'Any NPCI-compliant UPI app can be used, including PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, Navi, and bank UPI apps from HDFC, ICICI, SBI, Axis, and others.'
  },
  {
    q: 'Is it free to use?',
    a: 'Yes. MDR Free Split is completely free. There are no platform fees, no hidden charges, and no subscriptions. Everything runs locally in your browser.'
  },
  {
    q: 'Does MDR Free Split take payments or issue refunds?',
    a: 'No. It only calculates a split and opens a UPI payment link. You pay the merchant directly in your own UPI app. This site does not collect funds, confirm payments, or issue refunds; any refund request must be handled by the merchant.'
  },
  {
    q: 'How do I split a UPI payment into installments?',
    a: 'Scan the merchant’s UPI QR or enter the UPI ID, choose the bill amount, and select the number of installments. The calculator keeps the total exact and creates a local plan. Open each installment in your UPI app and approve it there. Confirm with the merchant that they accept part-payments before you begin.'
  },
  {
    q: 'What is the UPI MDR rate in 2026?',
    a: 'The notified 2026 framework uses a ₹2,000 per-transaction threshold for standard person-to-merchant payments. At or below ₹2,000, the base MDR is zero; above ₹2,000, the standard rate is 0.4%, capped at ₹300 per transaction from ₹75,000. NPCI has deferred implementation on select P2M transactions to a date after Diwali. Category rates, GST and provider terms can differ.'
  },
  {
    q: 'Does splitting a UPI payment reduce MDR?',
    a: 'Splitting a bill creates separate UPI payment instructions, each assessed on its own amount. That arithmetic can keep individual payments at or below the ₹2,000 threshold, but it does not change the merchant’s classification or guarantee a particular outcome. Use splits for genuine shared bills or agreed part-payments, not to disguise a transaction.'
  }
];
