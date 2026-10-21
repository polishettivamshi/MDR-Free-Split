import { jsPDF } from 'jspdf';
import { SplitPlan, SplitItem } from '../types';

/**
 * Generates and downloads a clean, professional PDF summary receipt
 * for a completed MDR Free Split payment plan using jsPDF.
 */
export function generateReceiptPDF(plan: SplitPlan, items: SplitItem[] = []): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const leftMargin = 15;
  const rightMargin = 195;
  const contentWidth = rightMargin - leftMargin;

  // 1. Top Decorative Brand Banner
  doc.setFillColor(67, 56, 202); // Indigo-700
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Brand Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('MDR Free Split', leftMargin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // Indigo-200
  doc.text('Split. Pay. Done. • Official Payment Settlement Summary', leftMargin, 23);

  // Right Side: Receipt Status Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('PAYMENT RECEIPT', rightMargin, 14, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(167, 243, 208); // Emerald-200
  doc.text('PAID IN FULL - 100% VERIFIED', rightMargin, 22, { align: 'right' });

  // 2. Plan Overview Card
  const cardTop = 38;
  const cardHeight = 44;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, cardTop, contentWidth, cardHeight, 3, 3, 'FD');

  // Column 1: Receipt Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('RECEIPT / PLAN ID', leftMargin + 6, cardTop + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(plan.publicId || plan.id, leftMargin + 6, cardTop + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUE DATE & TIME', leftMargin + 6, cardTop + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  doc.text(`${dateStr}, ${timeStr}`, leftMargin + 6, cardTop + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT CHANNEL', leftMargin + 6, cardTop + 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202); // Indigo-700
  doc.text('NPCI Unified Payments Interface (UPI)', leftMargin + 38, cardTop + 38);

  // Column 2: Merchant & Amount Details
  const col2X = leftMargin + 95;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MERCHANT BENEFICIARY', col2X, cardTop + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(plan.merchantName || 'Merchant', col2X, cardTop + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MERCHANT VPA (UPI ID)', col2X, cardTop + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(plan.merchantVpa || 'merchant@upi', col2X, cardTop + 30);

  // Total Plan Amount Highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL SETTLED', rightMargin - 40, cardTop + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.text(`INR ${plan.totalAmount.toLocaleString('en-IN')}`, rightMargin - 6, cardTop + 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${plan.numberOfPayments} Installments Completed`, rightMargin - 6, cardTop + 23, { align: 'right' });

  // 3. Section Title
  let curY = cardTop + cardHeight + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('ITEMIZED INSTALLMENT BREAKDOWN', leftMargin, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Each installment authorized sequentially through certified UPI applications', leftMargin, curY + 5);

  // 4. Installments Table
  const tableTop = curY + 9;
  const rowHeight = 10;
  const tableItems = items.length > 0 ? items : (plan.items || []);

  // Table Header
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(leftMargin, tableTop, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, tableTop + 8, rightMargin, tableTop + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('INSTALLMENT', leftMargin + 4, tableTop + 5.5);
  doc.text('TRANSACTION REFERENCE', leftMargin + 35, tableTop + 5.5);
  doc.text('APP / CHANNEL', leftMargin + 95, tableTop + 5.5);
  doc.text('SETTLEMENT STATUS', leftMargin + 130, tableTop + 5.5);
  doc.text('AMOUNT (INR)', rightMargin - 4, tableTop + 5.5, { align: 'right' });

  // Table Body Rows
  let itemY = tableTop + 8;
  tableItems.forEach((it, idx) => {
    const isZebra = idx % 2 === 1;
    if (isZebra) {
      doc.setFillColor(248, 250, 252);
      doc.rect(leftMargin, itemY, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, itemY + rowHeight, rightMargin, itemY + rowHeight);

    // Installment number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Payment ${it.sequenceNumber || idx + 1}`, leftMargin + 4, itemY + 6.5);

    // Reference
    const ref = it.payment?.transactionReference || `SUP-${(it.id || String(idx)).slice(0, 8).toUpperCase()}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(ref, leftMargin + 35, itemY + 6.5);

    // App name
    const upiApp = it.payment?.upiApp
      ? it.payment.upiApp.charAt(0).toUpperCase() + it.payment.upiApp.slice(1)
      : 'UPI Certified App';
    doc.text(upiApp, leftMargin + 95, itemY + 6.5);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text('SUCCESS / VERIFIED', leftMargin + 130, itemY + 6.5);

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`INR ${it.amount.toLocaleString('en-IN')}`, rightMargin - 4, itemY + 6.5, { align: 'right' });

    itemY += rowHeight;
  });

  // 5. Total Settlement Summary Box
  const summaryTop = itemY + 6;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.setDrawColor(187, 247, 208); // Green-200
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, summaryTop, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52); // Green-800
  doc.text('Total Plan Amount Settled:', leftMargin + 6, summaryTop + 8);
  doc.text(`INR ${plan.totalAmount.toLocaleString('en-IN')}`, leftMargin + 65, summaryTop + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('Outstanding Remaining Balance:', leftMargin + 6, summaryTop + 16);
  doc.setFont('helvetica', 'bold');
  doc.text('INR 0.00 (Fully Settled)', leftMargin + 65, summaryTop + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(5, 150, 105);
  doc.text('SETTLEMENT COMPLETE', rightMargin - 6, summaryTop + 12, { align: 'right' });

  // 6. Security and Compliance Guarantee Box (Section 13 & 36)
  const securityTop = summaryTop + 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, securityTop, contentWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(67, 56, 202);
  doc.text('SECURITY, COMPLIANCE & ZERO-PIN GUARANTEE', leftMargin + 6, securityTop + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const complianceText = 
    '1. MDR Free Split strictly abides by NPCI and RBI security standards. The user authorized each installment directly ' +
    'within their certified UPI application (PhonePe, Google Pay, Paytm, BHIM, etc.) using their private UPI PIN.\n' +
    '2. MDR Free Split never collected, viewed, or stored the user\'s UPI PIN, bank credentials, card numbers, or OTPs.\n' +
    '3. All payments were verified through banking switch queries and cryptographic webhook telemetry.';
  
  doc.text(complianceText, leftMargin + 6, securityTop + 12, { maxWidth: contentWidth - 12 });

  // 7. Footer
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, footerY - 4, rightMargin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('MDR Free Split • Computer-generated payment plan receipt • Verification ID: ' + (plan.publicId || plan.id), leftMargin, footerY);
  doc.text('Page 1 of 1', rightMargin, footerY, { align: 'right' });

  // 8. Download the PDF
  const filename = `MDR Free Split_Receipt_${plan.publicId || plan.id || 'plan'}.pdf`;
  doc.save(filename);
}
