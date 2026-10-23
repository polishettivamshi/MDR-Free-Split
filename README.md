# MDR Free Split

> **Tagline:** Understand. Split. Pay in UPI.

MDR Free Split is a client-side UPI calculator and split planner, with a source-linked guide library. It scans or accepts a merchant UPI QR, divides the bill into installments, estimates MDR, and opens each installment in the user's own UPI app.

**Scope:** scan → calculate → redirect to a UPI app. The site does not collect funds, process payments, verify payments, store UPI PINs, or issue refunds. Payment happens directly between the payer and the merchant inside the UPI app.

---

## Key Capabilities

- **Merchant QR decoding**: camera scanning, QR image upload, or manual UPI ID entry. UPI URIs are parsed and validated before use.
- **Strict split math**: the sum of installments must equal the bill amount to 0 paise.
- **MDR guide**: compares the estimated MDR on a single payment against installments at or below the ₹2,000 threshold. The 0.4% base MDR and ₹300 cap information is shown with the "merchant pays MDR" caveat.
- **Local split plans**: plans are saved in `localStorage` for seven days; no account or backend is used.
- **UPI app redirect**: each installment generates a standard `upi://pay` link with the merchant VPA, name, amount, and note. On mobile this opens the user's chosen UPI app; on desktop a QR code is shown.
- **Plan summary**: users can copy the calculated plan. This is not a receipt or proof of payment.
- **No payment tracking**: plans do not have paid/failed/complete states. There are no transaction logs, payment records, or receipts.

## Editorial Content

The site includes six long-form guides, an About page, a Contact page, a Privacy Policy, Terms of Use, a Disclaimer and a dedicated 404 screen.

Canonical routes use clean URLs:

```text
/                         Home
/guides                   Guide library
/guides/<slug>            Individual guide
/about                    Project and editorial standards
/contact                  Contact details and correction guidance
/privacy                  Privacy Policy
/terms                    Terms of Use
/disclaimer               Disclaimer
/split                    Calculator (noindex)
/plan/<id>                Locally saved plan (noindex)
```

Legacy `#/split` and `#/plan/<id>` links redirect to their clean equivalents. `vercel.json` rewrites deep links to `index.html` for the static SPA deployment.

### Advertising

Google AdSense is loaded dynamically **only on `/guides` and `/guides/<slug>`**. The calculator, saved-plan, home and legal screens do not load the advertising script. This is intentional: advertising should appear alongside original editorial content, never on tool or behavioral screens.

The AdSense account meta tag and `public/ads.txt` remain in place.

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
| Routing | Clean-path SPA routing with legacy hash redirects |

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
3. **Configure the split**: choose 2–8 installments, a custom count, or custom amounts. Installments at or below ₹2,000 sit at the standard 0% base-MDR threshold.
4. **Create the split plan**: the plan is saved locally in the browser for seven days.
5. **Open an installment**: choose any installment and open it in a UPI app. The amount and merchant details are pre-filled.
6. **Pay in the UPI app**: the user completes payment directly with the merchant. MDR Free Split receives no payment status.

---

## Project Structure

```text
Split-upi/
├── index.html                  # HTML shell, site metadata and static JSON-LD
├── site.config.ts              # Canonical site URL
├── vite.config.ts              # Vite, Tailwind, and site-URL substitution
├── vercel.json                 # SPA deep-link rewrites
├── public/
│   ├── googlee1c80eb3c72a40ab.html  # Google Search Console verification — keep deployed
│   ├── ads.txt
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── App.tsx                 # Route-to-page rendering and guide-only AdSense loading
    ├── main.tsx                # React entry point
    ├── types.ts                # SplitPlan, SplitItem, UPI and MDR types
    ├── index.css               # Tailwind entry and theme utilities
    ├── content/
    │   ├── types.ts            # Content-block, guide and legal-document types
    │   ├── guides.ts           # Six long-form guides, FAQs and sources
    │   └── legal.ts            # Privacy, Terms and Disclaimer documents
    ├── pages/
    │   ├── GuidesPage.tsx
    │   ├── GuidePage.tsx
    │   ├── AboutPage.tsx
    │   ├── ContactPage.tsx
    │   ├── LegalPageView.tsx
    │   └── NotFoundPage.tsx
    ├── components/
    │   ├── content/            # Article renderer, cards, breadcrumbs, calculator CTA
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── LandingPage.tsx
    │   ├── CreateSplit.tsx     # QR scanning, amount entry, split configuration
    │   ├── SplitPlanView.tsx   # Installment list and UPI app redirect
    │   ├── CameraQRScanner.tsx
    │   ├── UPITaxAdvisor.tsx   # MDR comparison guide
    │   ├── UpiAppIcon.tsx      # UPI app brand marks
    │   └── DisclaimerNotice.tsx
    └── lib/
        ├── adsense.ts
        ├── routes.ts           # Clean-path parsing and legacy hash redirects
        ├── seo.ts              # Per-page title, description, canonical and JSON-LD
        ├── upi.ts              # UPI parsing, validation, INR formatting
        ├── localStore.ts       # localStorage-backed split plans
        └── qrDecoder.ts
```

---

## Deployment

MDR Free Split is a static single-page app. `npm run build` runs Vite and then `scripts/prerender-seo.ts`, which emits `dist/` with route-specific HTML shells, canonical/social tags, JSON-LD, static fallback content and a regenerated sitemap. The live site runs on Vercel.

Before deploying:

- Confirm `SITE_URL` in `site.config.ts`, `index.html`, `public/robots.txt` and `public/sitemap.xml` match the deployment domain.
- Keep `public/googlee1c80eb3c72a40ab.html` in the deployment. Google Search Console verification expects exactly:

```text
google-site-verification: googlee1c80eb3c72a40ab.html
```

- Confirm `vercel.json` is present. It enables `cleanUrls`, serves the prerendered route files, rewrites `/plan/<id>` to the plan shell, and returns `404.html` for unknown paths.
- Confirm `public/ads.txt` still contains the correct publisher line.
- Confirm the build log reports `SEO metadata written for ... routes` and no unresolved `%SITE_URL%` placeholder.

After deployment, verify the verification file and a guide deep link directly:

```text
https://mdr-free-split.vercel.app/googlee1c80eb3c72a40ab.html
https://mdr-free-split.vercel.app/guides/upi-mdr-in-2026
```

Then complete verification in Search Console.

---

## Regulatory & Compliance Notes

MDR Free Split is not a bank, NBFC, payment aggregator, or licensed payment system operator. It does not process, hold, verify, or settle payments and does not issue refunds. All payments happen directly between the user and the merchant inside a UPI app.

MDR Free Split does not provide features intended to bypass or evade payment-network fees or banking controls. The split calculator is provided as a planning aid. MDR rules and rates can change; verify current NPCI, PIB and issuer guidance before relying on any estimate. Splitting a bill does not change a merchant's P2M/P2PM classification or category.

PhonePe, Google Pay, Paytm, BHIM, and other names are trademarks of their respective owners. Mention does not imply partnership, endorsement, or sponsorship.
