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
- **UPI Tax & Surcharge Advisor**: Live client-side calculation of the UPI MDR framework (₹2,000 exemption threshold, 0.4% MDR above the threshold, capped at ₹300 for transactions of ₹75,000 and above, 0% GST). Splitting installments at or below ₹2,000 eliminates MDR entirely (0% tax).
- **PDF Receipt Generation**: Download official payment settlement receipts via jsPDF.
- **Google AdSense**: Responsive ad units rendered at two in-app placements through the official AdSense loader — no backend and no environment variables required.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Build | Vite 8 (SPA, static output in `dist/`) |
| Icons | `lucide-react` |
| QR scanning | `jsQR` (with native `BarcodeDetector` fast path) + camera capture via `getUserMedia` |
| QR generation | `qrcode` |
| Receipts | `jspdf` |
| Celebration | `canvas-confetti` |
| Ads | Google AdSense loader (`pagead2.googlesyndication.com`) |
| Persistence | Browser `localStorage` only — no backend, no accounts, no telemetry |

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
git clone https://github.com/polishettivamshi/Split-upi.git
cd Split-upi

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

> Run `npm run lint` before committing — the production build (`vite build`) does **not** type-check.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on `http://localhost:5173`. |
| `npm run build` | Produce the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally to verify the build. |
| `npm run lint` | Type-check the project with `tsc --noEmit`. |

---

## How It Works

1. **Scan QR / Enter Amount**: Scan any merchant UPI QR code (camera or upload) or enter the merchant VPA and amount manually.
2. **View Live Tax**: See the UPI tax/surcharge impact on the full amount vs. split installments.
3. **Configure Split**: Choose the number of installments (preset buttons for 2, 3, 4, 5, 6 and 8, or a custom stepper from 2 upwards) so each installment stays at or below ₹2,000 to qualify for 0% MDR.
4. **Create Plan**: Save the split plan locally (localStorage).
5. **Authorize Payments**: Open your UPI app (PhonePe, GPay, Paytm, BHIM, etc.) via deep link to authorize each installment sequentially.
6. **Download Receipt**: Once all installments are complete, download a PDF receipt.
## Google AdSense Integration

AdSense is integrated with publisher ID **`ca-pub-6633100438556373`**. The project
deliberately uses **no environment variables** — a publisher ID is a *public*
identifier that ships inside every ad tag served to visitors, so it is hardcoded
and the deployed build can never be missing it.

### Where it lives

| Concern | File |
| --- | --- |
| Publisher ID, slot map, loader + push helpers | `src/lib/adsense.ts` |
| Loader `<script>` tag and `google-adsense-account` meta | `index.html` |
| Reusable ad unit component | `src/components/GoogleAdSlot.tsx` |
| Placement 1 — compact unit on the Create Split screen | `src/components/CreateSplit.tsx` |
| Placement 2 — banner unit on the Payment Plan screen | `src/components/PaymentPlanView.tsx` |

### How the loader is driven

`index.html` loads Google's async loader once, in `<head>`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6633100438556373"
 crossorigin="anonymous"></script>
```

`src/lib/adsense.ts` handles the React side of the integration:

1. **`loadAdsenseScript(client)`** — idempotent; every caller receives the same promise. It reuses the `<script>` already present in `index.html` and only injects a new one if that tag is missing. Because the loader is `async` it may already have executed before React mounts, so readiness is detected by polling `window.adsbygoogle.loaded === true` (the loader replaces the initial queue array with its own object exposing `push()`). A 10-second timeout guarantees the promise always settles, so a blocked or failed loader can never hang the app.
2. **`pushAdRequest(element)`** — pushes `{ element }` into `window.adsbygoogle`. Targeting the element explicitly (instead of relying on document order) keeps the mapping correct while slots mount and unmount as the user moves between views. A `WeakSet` guards against duplicate pushes: React's StrictMode double-invokes effects in development, and Google's loader throws `'element' has already been filled.` when the same element is requested twice.
3. **`GoogleAdSlot`** renders the `<ins>` element and calls `pushAdRequest` once the loader reports ready.

### The `<ins>` element

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-6633100438556373"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

- `data-ad-client` is **required** — Google's loader throws `Ad client is missing from the slot.` without it.
- `data-ad-slot` is **optional**. It is only emitted when a slot ID is configured, so the placement falls back to AdSense **Auto ads**.
- `data-ad-format="auto"` together with `data-full-width-responsive="true"` lets the unit resize to its container (mobile, tablet and desktop) without hard-coded pixel dimensions.

### Pinning a placement to a specific ad unit

Auto ads work as soon as the site is approved. To pin a placement to a dedicated ad unit instead:

1. In AdSense open **Ad units → New ad unit** and create a display ad unit.
2. Copy its slot ID (the numeric ID inside the ad code, e.g. `1234567890`).
3. Paste it into `ADSENSE_SLOTS` in `src/lib/adsense.ts`:

```ts
export const ADSENSE_SLOTS = {
  createSplit: '1234567890',
  paymentPlan: '9876543210',
} as const;
```

4. Rebuild. The `data-ad-slot` attribute now appears on the matching `<ins>` element.

### Going live

The code ships with the integration wired up, but ads stay invisible until the
account and the domain are approved:

1. **Account** — the publisher ID must belong to an approved AdSense account.
2. **Site review** — add the domain under **AdSense → Sites** and wait for approval (usually a few days).
3. **Ad units** — either enable **Auto ads** in the AdSense dashboard, or create specific ad units as described above.
4. **Verification** — confirm both requests in the browser Network tab: `adsbygoogle.js?client=ca-pub-6633100438556373` (loader) and `pagead2.googlesyndication.com/pagead/adsbygoogle/ads?...` (ad request).

### Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| No `adsbygoogle.js` request at all | The loader `<script>` was removed from `index.html`. |
| `Ad client is missing from the slot.` | The `<ins>` element lost its `data-ad-client` attribute. |
| `'element' has already been filled.` | The same element was pushed twice. The `WeakSet` guard in `src/lib/adsense.ts` prevents this — do not call `pushAdRequest` from outside the component effect. |
| Ad slot renders but stays empty | Usually the account/site is still in review, the ad unit is disabled, or an ad blocker is active. |
| A specific placement shows no ad | The slot ID in `ADSENSE_SLOTS` is wrong, or that ad unit is paused in AdSense. |

---

## Site Configuration

The canonical URL is hardcoded in `site.config.ts` — no environment variables are
needed to build or deploy:

```ts
export const SITE_URL = 'https://mdr-free-split.vercel.app';
```

`vite.config.ts` substitutes the `%SITE_URL%` placeholder into:

- `index.html` — canonical link, Open Graph `og:url`, and the JSON-LD `url` / `logo` fields
- `public/robots.txt` — the `Sitemap:` line
- `public/sitemap.xml` — the `<loc>` value

Files inside `public/` are copied verbatim by Vite after the bundle is written, so
they are rewritten in the plugin's `closeBundle` hook instead. Both `%SITE_URL%`
and the legacy `%VITE_SITE_URL%` placeholder forms are supported.

**When the domain changes**, update `SITE_URL` in `site.config.ts` and rebuild —
there is no deploy-time configuration to keep in sync.

---

## Deployment

MDR Free Split is a static single-page app: `npm run build` emits everything into
`dist/`, which can be hosted on any static platform (the live site runs on
Vercel). There is no server-side runtime, no secrets and no environment variables.

Before deploying, confirm that:

- `SITE_URL` in `site.config.ts` matches the domain you are deploying to, and
- the domain has been added and approved in your AdSense account.

---

## Project Structure

```
Split-upi/
├── index.html                  # HTML shell, AdSense loader, JSON-LD, %SITE_URL% placeholders
├── site.config.ts              # Canonical site URL — single source of truth
├── vite.config.ts              # Vite + Tailwind + site-url substitution plugin
├── metadata.json               # App metadata (camera permission, capabilities)
├── public/
│   ├── robots.txt              # %SITE_URL% substituted at build time
│   └── sitemap.xml             # %SITE_URL% substituted at build time
└── src/
    ├── App.tsx                 # View router: landing / create-split / payment-plan
    ├── main.tsx                # React entry point
    ├── types.ts                # Domain models (SplitPlan, SplitItem, Payment, …)
    ├── index.css               # Tailwind v4 entry + custom utilities
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── LandingPage.tsx
    │   ├── CreateSplit.tsx     # QR scan, split configuration, compact ad slot
    │   ├── PaymentPlanView.tsx # Installment list, UPI dispatch, banner ad slot
    │   ├── CameraQRScanner.tsx # Live camera scanning (BarcodeDetector → jsQR)
    │   ├── UPITaxAdvisor.tsx   # MDR / surcharge calculator
    │   ├── PaymentGatewayIcon.tsx
    │   └── GoogleAdSlot.tsx    # Reusable AdSense <ins> unit
    └── lib/
        ├── adsense.ts          # Publisher ID, slot map, loader + push helpers
        ├── upi.ts              # UPI URI parsing, validation, INR formatting
        ├── localStore.ts       # localStorage-backed plan storage
        └── pdfReceipt.ts       # jsPDF receipt generation
```

---

## Regulatory & Compliance Notices

### Non-Banking Entity Disclaimer
MDR Free Split is an independent software application designed for partial payment planning and coordination. MDR Free Split is **NOT a bank, non-banking financial company (NBFC), or licensed payment system operator**. All financial transactions are authorized by users directly inside certified UPI applications.

### Anti-Evasion Mandate (Section 36 Compliance)
MDR Free Split does not advertise, support, or facilitate any functionality intended to manipulate, bypass, evade, or circumvent payment-network merchant discount rate (MDR) fees, interchange fees, or banking controls. The split feature is strictly provided as a consumer budgeting and partial-payment scheduling aid.

### Trademark Notice
PhonePe, Google Pay, Paytm, BHIM, and other bank names are registered trademarks of their respective owners. Mention of these services does not imply any partnership, affiliation, endorsement, or sponsorship.
