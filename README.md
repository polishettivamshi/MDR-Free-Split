# MDR Free Split

> **Tagline:** Split. Pay Zero MDR.

MDR Free Split is a client-side only fintech web application engineered to enable users to enter a total payment amount, scan or upload a merchant UPI QR code, generate an installment-based split payment plan, and authorize each payment sequentially inside certified UPI applications (**PhonePe, Google Pay, Paytm, BHIM, or any installed bank UPI app**).

All data is stored locally in the browser (localStorage). There is **no backend** — everything runs entirely in the browser.

---

## Key Capabilities

- **Merchant QR Decoding & Validation**: Reads uploaded images using `jsQR`, decodes standard `upi://pay` URIs, extracts Payee VPA, Payee Name, Amount, and Currency, and sanitizes untrusted input before confirmation.
- **Strict Split Math Engine**: Guarantees that the sum of all installments equals the total payment amount down to 0 paise. Rounding errors are strictly prevented.
- **Sequential Payment State Machine**: Enforces strict sequential authorization. Subsequent installments remain locked (`LOCKED`) until the preceding installment is verified as `SUCCESS`.
- **Multi-App UPI Intent Dispatch**: Dispatches standard NPCI deep links with URL-encoded parameters to PhonePe, Google Pay, Paytm, BHIM, CRED, Amazon Pay, Navi, or desktop QR fallback.
- **UPI Tax & Surcharge Advisor**: Live client-side calculation of NPCI UPI surcharge rules (₹2,000 exemption threshold, 1.1% interchange + 18% GST). Splitting installments at or below ₹2,000 eliminates surcharges entirely (0% tax).
- **PDF Receipt Generation**: Download official payment settlement receipts via jsPDF.

---

## Zero-Credential & Zero-PIN Security Architecture

MDR Free Split NEVER collects, handles, logs, or stores:
- User UPI PIN
- Net-banking login credentials or passwords
- Debit / Credit card numbers, CVVs, or expiry dates
- One-Time Passwords (OTPs)

All PIN authorization occurs exclusively inside certified third-party UPI applications operating under RBI/NPCI banking security frameworks.

---

## Local Setup Guide

```bash
# Clone the repository
git clone https://github.com/your-org/mdfreesplit.git
cd mdfreesplit/Split-upi

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Access the application at `http://localhost:5173` (Vite default).

---

## How It Works

1. **Scan QR / Enter Amount**: Scan any merchant UPI QR code (camera or upload) or enter the merchant VPA and amount manually.
2. **View Live Tax**: See the UPI tax/surcharge impact on the full amount vs. split installments.
3. **Configure Split**: Choose number of installments (2–12) so each installment stays at or below ₹2,000 to qualify for 0% surcharge exemption.
4. **Create Plan**: Save the split plan locally (localStorage).
5. **Authorize Payments**: Open your UPI app (PhonePe, GPay, Paytm, BHIM, etc.) via deep link to authorize each installment sequentially.
6. **Download Receipt**: Once all installments are complete, download a PDF receipt.

---

## Regulatory & Compliance Notices

### Non-Banking Entity Disclaimer
MDR Free Split is an independent software application designed for partial payment planning and coordination. MDR Free Split is **NOT a bank, non-banking financial company (NBFC), or licensed payment system operator**. All financial transactions are authorized by users directly inside certified UPI applications.

### Anti-Evasion Mandate (Section 36 Compliance)
MDR Free Split does not advertise, support, or facilitate any functionality intended to manipulate, bypass, evade, or circumvent payment-network merchant discount rate (MDR) fees, interchange fees, or banking controls. The split feature is strictly provided as a consumer budgeting and partial-payment scheduling aid.

### Trademark Notice
PhonePe, Google Pay, Paytm, BHIM, and other bank names are registered trademarks of their respective owners. Mention of these services does not imply any partnership, affiliation, endorsement, or sponsorship.
