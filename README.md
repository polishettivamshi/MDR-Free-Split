# MDR Free Split

> **Tagline:** Split. Pay Zero MDR.

MDR Free Split is a client-side UPI calculator and split planner. It scans or accepts a merchant UPI QR, divides the bill into installments, estimates MDR, and opens each installment in the user's own UPI app.

**Scope:** scan → calculate → redirect to a UPI app. The site does not collect funds, process payments, verify payments, store UPI PINs, or issue refunds. Payment happens directly between the payer and the merchant inside the UPI app.

---

## Key Capabilities

- **Merchant QR decoding**: camera scanning, QR image upload, or manual UPI ID entry. UPI URIs are parsed and validated before use.
- **Strict split math**: the sum of installments must equal the bill amount to 0 paise.
- **MDR guide**: compares the estimated MDR on a single payment against installments at or below the ₹2,000 threshold. The 0.4% MDR and ₹300 cap information is shown with the "merchant pays MDR" caveat.
- **Local split plans**: plans are saved in `localStorage`; no account or backend is used.
- **UPI app redirect**: each installment generates a standard `upi://pay` link with the merchant VPA, name, amount, and note. On mobile this opens the user's chosen UPI app; on desktop a QR code is shown.
- **Plan summary**: users can copy the calculated plan. This is not a receipt or proof of payment.
- **No payment tracking**: plans do not have paid/failed/complete states. There are no transaction logs, payment records, or receipts.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Build | Vite 8 (static SPA output in `dist/`) |
| Icons | `lucide-react` |
| QR scanning | `jsQR` with a native `BarcodeDetector` fast path and camera capture via `getUserMedia` |
| QR generation | `qrcode` |
| Persistence | Browser `localStorage` only |

---

## Zero-Credential Architecture

MDR Free Split never collects, handles, logs, or stores:

- UPI PIN
- Net-banking credentials or passwords
- Debit/credit card numbers, CVVs, or expiry dates
- OTPs

PIN entry and payment authorization happen only inside the user's UPI app.

---

## Local Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Type-check
npm run lint

# Production build
npm run build

# Preview the production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run lint` | Type-check with `tsc --noEmit`. |
| `npm run build` | Build the production bundle into `dist/`. |
| `npm run preview` | Serve the production bundle locally. |

---

## How It Works

1. **Scan or enter merchant details**: scan a UPI QR with the camera, upload an image, or enter the merchant UPI ID manually.
2. **Enter the bill amount**: the app estimates MDR on a single payment.
3. **Configure the split**: choose 2–8 installments, a custom count, or custom amounts. Installments at or below ₹2,000 stay within the 0% MDR threshold.
4. **Create the split plan**: the plan is saved locally in the browser.
5. **Open an installment**: choose any installment and open it in a UPI app. The amount and merchant details are pre-filled.
6. **Pay in the UPI app**: the user completes payment directly with the merchant. MDR Free Split receives no payment status.

---

## Project Structure

```text
Split-upi/
├── index.html                  # HTML shell, metadata, AdSense loader, JSON-LD
├── site.config.ts              # Canonical site URL
├── vite.config.ts              # Vite, Tailwind, and site-URL substitution
├── public/
│   ├── googlee1c80eb3c72a40ab.html  # Google Search Console verification — keep deployed
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── App.tsx                 # View switching: landing / create-split / split-plan
    ├── main.tsx                # React entry point
    ├── types.ts                # SplitPlan, SplitItem, UPI and MDR types
    ├── index.css               # Tailwind entry and theme utilities
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── LandingPage.tsx
    │   ├── CreateSplit.tsx     # QR scanning, amount entry, split configuration
    │   ├── SplitPlanView.tsx   # Installment list and UPI app redirect
    │   ├── CameraQRScanner.tsx
    │   ├── UPITaxAdvisor.tsx   # MDR comparison guide
    │   ├── UpiAppIcon.tsx      # UPI app brand marks
    │   ├── DisclaimerNotice.tsx
    │   └── GoogleAdSlot.tsx    # Optional AdSense unit component
    └── lib/
        ├── adsense.ts
        ├── upi.ts              # UPI parsing, validation, INR formatting
        ├── localStore.ts       # localStorage-backed split plans
        └── qrDecoder.ts
```

---

## Deployment

MDR Free Split is a static single-page app. `npm run build` emits `dist/`; the live site runs on Vercel.

Before deploying:

- Confirm `SITE_URL` in `site.config.ts` matches the deployment domain.
- Keep `public/googlee1c80eb3c72a40ab.html` in the deployment. Google Search Console verification remains pending and expects exactly:

```text
google-site-verification: googlee1c80eb3c72a40ab.html
```

After deployment, verify `https://mdr-free-split.vercel.app/googlee1c80eb3c72a40ab.html`, then complete verification in Search Console.

---

## Regulatory & Compliance Notes

MDR Free Split is not a bank, NBFC, payment aggregator, or licensed payment system operator. It does not process, hold, verify, or settle payments and does not issue refunds. All payments happen directly between the user and the merchant inside a UPI app.

MDR Free Split does not provide features intended to bypass or evade payment-network fees or banking controls. The split calculator is provided as a planning aid. MDR rules and rates can change; verify current NPCI and issuer guidance before relying on any estimate.

PhonePe, Google Pay, Paytm, BHIM, and other names are trademarks of their respective owners. Mention does not imply partnership, endorsement, or sponsorship.
