import type { Guide } from './types';

export const GUIDES: Guide[] = [
  {
    slug: 'upi-mdr-in-2026',
    title: 'UPI MDR in 2026: The ₹2,000 Threshold Explained',
    metaTitle: 'UPI MDR in 2026: ₹2,000 Threshold, 0.4% Rate and ₹300 Cap',
    description:
      'A plain-language guide to UPI merchant discount rate in 2026: who pays MDR, the ₹2,000 threshold, the 0.4% rate, the ₹300 cap, P2PM exemptions and category rules.',
    category: 'MDR basics',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 9,
    takeaways: [
      'MDR is a merchant-side payment acceptance cost. A customer is not charged a separate MDR by their UPI app under the framework discussed here.',
      'For standard person-to-merchant transactions, payments of ₹2,000 or less have zero base MDR under the notified 2026 framework. Above ₹2,000, the standard rate is 0.4%, capped at ₹300 per transaction from ₹75,000 onwards. Implementation timing is noted below.',
      'Small merchants classified under P2PM can remain zero-MDR up to ₹1 lakh of UPI receipts per month. Person-to-person transfers remain free.',
      'Essential categories and capital-market payments have separate rates. The actual amount depends on the merchant’s classification, category and acquiring bank or payment service provider.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'The merchant discount rate, usually shortened to **MDR**, is the fee a merchant pays to accept a digital payment. It is not a tax and it is not normally a fee added to the customer’s bill. The money helps cover the cost of processing, settling and maintaining a payment acceptance service.'
      },
      {
        type: 'p',
        text: 'India’s 2026 UPI framework set a per-transaction threshold of ₹2,000, with different treatment for small merchants and specified categories. The framework was notified with an effective date of **15 October 2026**, but on **13 October 2026** NPCI announced that implementation on select P2M transactions would begin immediately after Diwali, at a date to be notified separately. This guide explains the notified structure in practical terms and flags where timing matters.'
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'This is general information, not tax or legal advice',
        text: 'Rates, merchant classifications and invoices are decided by the merchant’s bank, payment service provider and applicable rules. Confirm your own charges with them before making a business decision.'
      },
      { type: 'h2', text: 'What is UPI MDR?' },
      {
        type: 'p',
        text: 'A UPI payment moves money between a payer’s bank account and a payee’s bank account through the UPI network. A merchant payment involves additional participants, including the merchant’s acquiring bank or payment service provider. MDR is the commercial fee associated with accepting that payment.'
      },
      {
        type: 'p',
        text: 'For a customer, the important point is simple: **MDR is normally deducted from the merchant’s settlement**, not added as a separate line item when you enter your UPI PIN. The amount you approve in your UPI app is the amount sent to the merchant, and the merchant’s provider handles its fee separately.'
      },
      { type: 'h2', text: 'What does the 2026 framework change?' },
      {
        type: 'p',
        text: 'The 2026 framework introduced a standard MDR for eligible person-to-merchant (P2M) UPI transactions above ₹2,000. It also preserved zero-MDR treatment for several groups and created category-specific rules.'
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Implementation timing changed on 13 October 2026',
        text: 'The notified framework had a 15 October 2026 effective date. NPCI then announced that implementation on select P2M transactions would begin immediately after Diwali, at a date to be notified separately. The rate structure below is the notified model, not a claim that every provider is already charging it. Check the current start date with NPCI or your payment provider.'
      },
      {
        type: 'table',
        caption: 'Illustrative base MDR under the standard P2M framework. These figures exclude GST and do not account for category-specific rates.',
        headers: ['UPI transaction', 'Base MDR', 'Why'],
        rows: [
          ['₹1,500', '₹0', 'At or below the ₹2,000 per-transaction threshold'],
          ['₹2,000', '₹0', 'The threshold is inclusive: ₹2,000 is still zero MDR'],
          ['₹3,000', '₹12', '0.4% of ₹3,000'],
          ['₹10,000', '₹40', '0.4% of ₹10,000'],
          ['₹75,000', '₹300', '0.4% would be ₹300, so the cap applies'],
          ['₹1,00,000', '₹300', 'The ₹300 per-transaction cap applies']
        ]
      },
      {
        type: 'p',
        text: 'The headline rate is **0.4%** for standard P2M transactions above ₹2,000, with a **₹300 cap** for transactions of ₹75,000 or more. The cap is per transaction, not a monthly cap. Ten separate ₹1,00,000 payments are ten separate capped transactions, subject to the merchant’s agreement and category rules.'
      },
      { type: 'h2', text: 'Who pays the MDR?' },
      {
        type: 'p',
        text: 'The merchant pays MDR as part of its payment acceptance arrangement. A customer using UPI should not be asked by their bank or UPI app to pay a separate MDR charge on a normal merchant payment. Commercial pricing is different: a merchant is free to set its own prices, just as it can for any other business cost.'
      },
      {
        type: 'p',
        text: 'For a person-to-person transfer, there is no merchant acquiring relationship in the same way. P2P transfers remain free regardless of value. The 2026 framework is aimed at merchant payments, not at money sent to friends or family.'
      },
      { type: 'h2', text: 'The ₹2,000 threshold is per transaction' },
      {
        type: 'p',
        text: 'The threshold is not a daily spending limit and it is not a limit on how many payments a customer can make. It is a per-transaction threshold for the standard MDR framework. A ₹1,500 payment is assessed as a ₹1,500 transaction; a separate ₹1,500 payment is assessed separately.'
      },
      {
        type: 'p',
        text: 'That is why the number of payments matters when you are estimating costs: several smaller transactions are not the same as one larger transaction. The calculator on this site shows the arithmetic, but it does not decide how a merchant should bill or how a bank should classify a transaction.'
      },
      { type: 'h2', text: 'Small merchants: the P2PM framework' },
      {
        type: 'p',
        text: 'NPCI’s person-to-person-merchant (P2PM) framework is designed for small vendors who receive payments into a personal bank account through a UPI QR code. Under the framework described in the 2026 FAQs, eligible P2PM merchants with UPI receipts of up to **₹1 lakh per month** continue to receive zero-MDR treatment.'
      },
      {
        type: 'p',
        text: 'Receiving a payment above ₹2,000 does not automatically make a small P2PM merchant liable for MDR. Classification matters. Reporting has also indicated that a small merchant whose monthly UPI receipts exceed ₹1 lakh for three consecutive months may be transitioned to the P2M category. The merchant’s bank or payment service provider is the right place to confirm the current status.'
      },
      { type: 'h2', text: 'Category-specific rates' },
      {
        type: 'p',
        text: 'The standard 0.4% rate is not the only rate in the framework. Two important groups are treated differently:'
      },
      {
        type: 'ul',
        items: [
          '**Essential and thin-margin sectors:** specified categories such as railways, telecom services, insurance, fuel, utility-bill payments, education and agricultural inputs are described as attracting a flat **₹5 per transaction** above ₹2,000.',
          '**Capital-market payments:** mutual funds, securities and stockbroker-related payments are described as attracting **0.02%**, capped at ₹300 per transaction.',
          '**UPI AutoPay and mandates:** recurring payments such as utility bills or mutual-fund subscriptions are outside the standard transaction MDR described here.'
        ]
      },
      {
        type: 'p',
        text: 'The exact merchant category code and the provider’s implementation determine which rate applies. A calculator cannot infer a merchant’s category from a QR code alone, so treat category-specific figures as illustrations rather than a bill.'
      },
      { type: 'h2', text: 'Why splitting a payment does not change the merchant’s classification' },
      {
        type: 'p',
        text: 'A split plan creates several separate UPI payment instructions. It does not turn a P2M merchant into a P2PM merchant, change a merchant category code, or rewrite the merchant’s acquiring agreement. A customer should not assume that dividing a bill automatically changes the merchant’s MDR treatment.'
      },
      {
        type: 'p',
        text: 'Installment arrangements can be useful when both sides genuinely agree to them, for example when a merchant accepts part-payments for a large order or a group is sharing a bill. They should not be used to disguise one transaction solely to avoid a fee or to create misleading records. When in doubt, ask the merchant and follow their billing process.'
      },
      { type: 'h2', text: 'How to use an MDR estimate responsibly' },
      {
        type: 'ol',
        items: [
          'Start with the per-transaction amount, not the monthly total.',
          'Apply the standard 0.4% rate only above ₹2,000, then apply the ₹300 cap from ₹75,000.',
          'Check whether the merchant is in a category with a different rate or is classified as P2PM.',
          'Remember that the figures here are base amounts. GST and provider fees may be added to the merchant’s invoice.',
          'Use the merchant’s settlement statement or provider dashboard as the final source of truth.'
        ]
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'What the MDR Free Split calculator is for',
        text: 'It helps you see how a bill divides into installments and how the standard threshold arithmetic changes. It is a planning tool, not a payment processor, tax calculator or merchant statement.'
      },
    ],
    faqs: [
      {
        q: 'Is MDR charged to the customer?',
        a: 'Under the framework described here, MDR is a merchant-side acceptance cost. Customers are not charged a separate MDR by their UPI app on a standard merchant payment. A merchant may set its own prices, but that is separate from the UPI fee itself.'
      },
      {
        q: 'Does a ₹2,000 payment attract MDR?',
        a: 'Under the notified standard framework, no: the threshold is inclusive, so ₹2,000 or less has zero base MDR and MDR begins above ₹2,000 for eligible transactions. Implementation timing and the merchant’s category still matter, so confirm the current treatment with the provider.'
      },
      {
        q: 'Is the ₹300 cap monthly?',
        a: 'The cap is described as a per-transaction cap for transactions of ₹75,000 or more. It is not a monthly maximum for the merchant.'
      },
      {
        q: 'Does splitting a ₹10,000 bill into five ₹2,000 payments remove MDR?',
        a: 'It creates five separate ₹2,000 payment instructions, each at or below the standard threshold. That arithmetic does not change the merchant’s classification or agreement, and using multiple payments solely to avoid fees is not advisable. Confirm the arrangement with the merchant and check whether the framework is being applied yet.'
      }
    ],
    sources: [
      {
        label: 'NPCI: FAQs on MDR for select UPI P2M transactions',
        href: 'https://www.npci.org.in/uploads/FA_Qs_Merchant_Discount_Rate_MDR_on_Select_UPI_P2_M_Transactions_58dba1d39e.pdf'
      },
      {
        label: 'NPCI: UPI MDR on select merchant transactions to be implemented post-Diwali (13 Oct 2026)',
        href: 'https://www.npci.org.in/uploads/UPI_MDR_on_Select_Merchant_Transactions_Shall_be_Implemented_Post_Diwali_4c9cdd77d5.pdf'
      },
      {
        label: 'Department of Financial Services: MDR FAQs for select UPI P2M transactions',
        href: 'https://financialservices.gov.in/faqs-merchant-discount-rate-mdr-select-upi-p2m-transactions'
      },
      {
        label: 'PIB: UPI continues to remain free for person-to-person transactions',
        href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310586&lang=1&reg=48'
      },
      {
        label: 'Business Standard: What customers and merchants need to know about the 2026 MDR framework',
        href: 'https://www.business-standard.com/finance/news/mdr-on-upi-payments-what-customers-merchants-need-to-know-from-oct-15-126092401287_1.html'
      }
    ]
  },
  {
    slug: 'how-to-split-upi-payment',
    title: 'How to Split a UPI Payment Into Smaller Installments',
    metaTitle: 'How to Split a UPI Payment Into Installments: A Practical Guide',
    description:
      'A step-by-step guide to splitting a merchant UPI bill into smaller payments, with examples, a pre-payment checklist and the limits of a calculation plan.',
    category: 'Payment planning',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 8,
    takeaways: [
      'A split plan is a series of separate UPI payments, not an automatic installment facility.',
      'Confirm with the merchant that partial payments are acceptable before you begin.',
      'The calculator keeps the total exact, but you still approve every payment and enter your PIN in your UPI app.',
      'Use splits for genuine shared bills or agreed part-payments, not to disguise a transaction or avoid a fee.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'A UPI payment is usually a single transfer from your bank account to a merchant. Sometimes the amount is too large for the way you want to pay, or a group wants to divide a bill. In those situations, a split plan can turn one bill into a sequence of smaller UPI payment instructions.'
      },
      {
        type: 'p',
        text: 'MDR Free Split is a calculator and planner. It does **not** create an installment contract, hold money, collect a payment or confirm that a merchant received anything. Every payment still happens inside your own UPI app.'
      },
      { type: 'h2', text: 'When splitting a UPI payment makes sense' },
      {
        type: 'ul',
        items: [
          '**Shared bills:** several people want to contribute to one merchant bill, such as a group meal, a family purchase or a joint gift.',
          '**Agreed part-payments:** the merchant has agreed to accept the bill in stages, for example a deposit followed by a balance.',
          '**Payment-limit planning:** a payer wants to keep individual transfers smaller for personal cash-flow or bank-limit reasons, subject to the merchant’s agreement.',
          '**Record clarity:** you want a clear list of the amounts you intend to pay, even though the site will not track whether they are paid.'
        ]
      },
      { type: 'h2', text: 'When you should not split' },
      {
        type: 'ul',
        items: [
          'The merchant has asked for one payment and cannot reconcile partial payments.',
          'The split is designed to hide the true size or nature of a transaction.',
          'You are trying to change a merchant’s category or avoid a fee through transaction structuring.',
          'A refund, chargeback or dispute process would become unclear because nobody can identify which payment is being reversed.',
          'You do not have enough UPI balance or transaction limit for the full plan.'
        ]
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Ask first',
        text: 'Before making multiple payments, confirm that the merchant can accept them and that their billing or accounting system will treat them correctly. Keep the merchant’s invoice or receipt for your records.'
      },
      { type: 'h2', text: 'Step-by-step: creating a split plan' },
      {
        type: 'ol',
        items: [
          '**Open the calculator** at [Scan & Split](/split). You do not need an account.',
          '**Scan or upload the merchant’s UPI QR code**, or enter the merchant’s UPI ID and name manually. Check the decoded merchant details against the QR or invoice.',
          '**Enter the total bill amount.** If the QR contains an amount, the calculator can pre-fill it, but you should still verify it.',
          '**Choose the number of installments.** The tool suggests amounts under the ₹2,000 threshold and lets you adjust the count.',
          '**Check that the sum equals the bill.** If you use custom amounts, the plan is only valid when every rupee of the total is allocated.',
          '**Create the plan.** It is saved in this browser for seven days, and each installment can be opened in a UPI app.',
          '**Pay each installment in your UPI app.** You will review the merchant and amount and enter your UPI PIN. MDR Free Split never sees your PIN or receives the money.'
        ]
      },
      { type: 'h2', text: 'Worked examples' },
      {
        type: 'table',
        caption: 'Illustrative splits. The last installment is adjusted so the total remains exact.',
        headers: ['Bill', 'Installments', 'Amounts', 'Notes'],
        rows: [
          ['₹6,000', '3', '₹2,000 + ₹2,000 + ₹2,000', 'A clean split at the standard threshold'],
          ['₹5,000', '3', '₹1,667 + ₹1,667 + ₹1,666', 'The final paise round-off keeps the total exact'],
          ['₹10,000', '5', '5 × ₹2,000', 'Five separate payment approvals'],
          ['₹3,500', '2', '₹1,750 + ₹1,750', 'Useful when a group is sharing a bill'],
          ['₹12,345.67', '7', 'Six equal shares plus a rounded final share', 'Verify the total before paying']
        ]
      },
      {
        type: 'p',
        text: 'Splitting does not mean the UPI app will pay the installments automatically. Each installment is a separate action. A saved plan is a checklist, not a mandate or an autopay instruction.'
      },
      { type: 'h2', text: 'What to check before you pay' },
      {
        type: 'ul',
        items: [
          'The merchant name and UPI ID match the invoice or the QR you intended to scan.',
          'The total in the plan equals the bill, including any tax or service charge shown by the merchant.',
          'The number of payments is acceptable to the merchant and workable for your bank or UPI app limits.',
          'You have enough available balance for all installments, not just the first one.',
          'You know how the merchant will issue a receipt for multiple payments.',
          'You are paying the merchant directly, not a random person who sent you a QR code.'
        ]
      },
      { type: 'h2', text: 'What happens after the plan is created' },
      {
        type: 'p',
        text: 'The plan screen shows each installment and an **Open in UPI app** action. On a phone, the action opens a UPI payment intent. On a desktop, the site can show a QR code for the installment. You can pay in any order, and you can stop at any time.'
      },
      {
        type: 'p',
        text: 'The site does not mark an installment as paid. It has no connection to your bank account, the merchant’s account or any UPI app. If you pay only some installments, the merchant will see partial payments, and the remaining balance is a matter between you and the merchant.'
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Refunds and disputes stay with the merchant and your UPI app',
        text: 'MDR Free Split cannot reverse a payment or confirm a refund. If something goes wrong, use the merchant’s refund process and the dispute or support channel in the UPI app you used.'
      }
    ],
    faqs: [
      {
        q: 'Does the merchant automatically know I created a split plan?',
        a: 'No. The plan exists only in your browser. The merchant only sees the individual UPI payments that are actually made.'
      },
      {
        q: 'Can I pay the installments in any order?',
        a: 'Yes. The plan is a calculation checklist, not a sequenced payment mandate. Paying in a different order does not change the planned amounts.'
      },
      {
        q: 'What if I close the browser before paying everything?',
        a: 'Plans are stored locally for seven days. If the plan is still within that period and in the same browser, you can reopen it from the Overview page. Clearing browser data removes it immediately.'
      },
      {
        q: 'Can I use a credit card or bank transfer instead?',
        a: 'The plan is designed to open a UPI payment intent. Whether a particular UPI app supports a linked account or card depends on that app and the merchant’s acceptance setup.'
      }
    ],
    sources: [
      {
        label: 'NPCI: UPI product overview',
        href: 'https://www.npci.org.in/what-we-do/upi/product-overview/'
      },
      {
        label: 'NPCI: MDR FAQs for select UPI merchant transactions',
        href: 'https://www.npci.org.in/uploads/FA_Qs_Merchant_Discount_Rate_MDR_on_Select_UPI_P2_M_Transactions_58dba1d39e.pdf'
      }
    ]
  },
  {
    slug: 'merchant-upi-qr-safety',
    title: 'Merchant UPI QR Codes: Scan, Upload, and Verify Safely',
    metaTitle: 'Merchant UPI QR Codes: How to Scan, Upload and Verify Them',
    description:
      'Learn what a merchant UPI QR code contains, how to scan or upload one, why some images fail, and how to verify the payee before entering your UPI PIN.',
    category: 'QR & safety',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 8,
    takeaways: [
      'A UPI QR code usually contains a payee address, the merchant name and sometimes an amount or category code.',
      'Always verify the merchant name, UPI ID and amount in your UPI app before approving a payment.',
      'Uploaded QR images are decoded in your browser by this tool; they are not sent to a server by the calculator.',
      'A QR code cannot take money by itself. Your UPI PIN is the final authorization step.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'A merchant UPI QR code is a shortcut for payment details. Instead of typing a UPI ID and amount, you point a camera at the code or choose a saved screenshot. The code can make checkout faster, but it also means you should check what was decoded.'
      },
      { type: 'h2', text: 'What is inside a UPI QR code?' },
      {
        type: 'p',
        text: 'A typical merchant QR carries a UPI payment URI. The parameters can include:'
      },
      {
        type: 'ul',
        items: [
          '**pa (payee address):** the merchant’s UPI ID, such as a business handle.',
          '**pn (payee name):** the name that should be displayed in your UPI app.',
          '**am (amount):** an optional fixed amount. Many static merchant QRs leave this blank so the customer can enter the bill.',
          '**cu (currency):** normally INR.',
          '**mc (merchant category code):** an optional code used by payment systems and acquirers.',
          '**tn or tr:** an optional note or transaction reference supplied by the merchant.'
        ]
      },
      {
        type: 'p',
        text: 'A QR code is not a bank account, a card number or a PIN. It is data that your UPI app interprets. The app should show the payee and amount before asking for authorization.'
      },
      { type: 'h2', text: 'Static versus dynamic QR codes' },
      {
        type: 'p',
        text: 'A **static QR** stays fixed at a counter or on an invoice. It usually identifies the merchant without an amount. A **dynamic QR** is generated for a specific bill and may include the amount or reference. Dynamic codes can reduce typing errors, but you should still confirm the displayed merchant details.'
      },
      { type: 'h2', text: 'How to scan or upload a merchant QR safely' },
      {
        type: 'ol',
        items: [
          'Open [Scan & Split](/split) and choose **Scan camera**, **Upload QR**, or **Manual** input.',
          'If you are using the camera, grant permission only in your browser and point the camera at the complete QR code. Keep the code flat and well lit.',
          'If you are uploading, choose the original QR image or a clear screenshot. The image is decoded locally in your browser.',
          'Check the decoded merchant name and UPI ID against the merchant, invoice or display board.',
          'Enter the bill amount if the QR did not include one. Do not blindly accept a pre-filled amount.',
          'Create the plan, then review the merchant and amount again inside your UPI app before entering your PIN.'
        ]
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Images are processed in your browser',
        text: 'The QR scanner and image decoder run on your device. MDR Free Split does not upload your camera frames or uploaded QR images to a server. The plan data is saved locally in the browser for seven days.'
      },
      { type: 'h2', text: 'Why an uploaded QR image can fail' },
      {
        type: 'ul',
        items: [
          'The image is blurred, compressed, cropped or photographed at an angle with reflections.',
          'The QR code occupies only a tiny part of a very large screenshot.',
          'The QR has a transparent background or very low contrast. This tool now draws uploaded images on a white background before decoding.',
          'The file is an unsupported format such as a HEIC photo rather than a PNG, JPG or WEBP image.',
          'The code is a website link or another kind of QR code, not a UPI payment QR.',
          'The image contains sensitive content or was corrupted during download.'
        ]
      },
      {
        type: 'p',
        text: 'If decoding fails, try a clearer crop containing the complete code, use the original image rather than a forwarded copy, or enter the merchant’s UPI ID manually and verify it independently.'
      },
      { type: 'h2', text: 'How to verify the payee before paying' },
      {
        type: 'ul',
        items: [
          'Compare the payee name shown in your UPI app with the merchant’s sign, invoice or staff confirmation.',
          'Check the UPI ID character by character if the amount is significant.',
          'Confirm the amount in the UPI app, especially when a QR pre-fills it.',
          'Be cautious if a QR code appears as a sticker over another QR, or if someone rushes you to pay.',
          'Never trust a QR code sent by an unknown person who promises a refund, prize or cashback.',
          'Remember that entering a UPI PIN authorizes a **payment**. You do not enter a PIN to receive money.'
        ]
      },
      { type: 'h2', text: 'Common QR and UPI scams' },
      {
        type: 'ul',
        items: [
          '**Sticker swaps:** a fraudster covers a real merchant QR with one linked to another account.',
          '**Fake collect requests:** a request to “receive” money is actually a request that will debit you if approved.',
          '**Screen-sharing support:** a caller claiming to be from a bank or UPI app asks to see your screen or OTP.',
          '**Refund links:** a fake refund QR asks you to enter your PIN or approve a collect request.',
          '**Payment screenshots:** a screenshot is not proof that money reached the merchant. The merchant or bank should verify settlement.'
        ]
      },
      {
        type: 'p',
        text: 'If a payment goes wrong, contact the merchant and use the support or dispute flow in your UPI app. In India, cyber-financial fraud can also be reported through the national cybercrime portal and the 1930 helpline.'
      }
    ],
    faqs: [
      {
        q: 'Does scanning a QR code pay the merchant automatically?',
        a: 'No. Scanning or decoding only prepares a payment. You still review the details in your UPI app and authorize the debit with your PIN or another approved method.'
      },
      {
        q: 'Can a merchant see my UPI PIN or bank balance?',
        a: 'No. A merchant QR should never ask for your PIN, OTP, password or screen access. Only your UPI app should receive your payment authorization.'
      },
      {
        q: 'Why does the amount sometimes appear after scanning?',
        a: 'Static QR codes often omit the amount. Dynamic QR codes can include it. In both cases, verify the amount in your UPI app before authorizing.'
      },
      {
        q: 'Is it safe to upload a screenshot of my QR?',
        a: 'The calculator decodes the image locally in your browser. Still avoid uploading images that contain personal information outside the QR itself, and use the original merchant QR rather than an unknown forwarded image.'
      }
    ],
    sources: [
      {
        label: 'NPCI: UPI product overview',
        href: 'https://www.npci.org.in/what-we-do/upi/product-overview/'
      },
      {
        label: 'National Cyber Crime Reporting Portal',
        href: 'https://cybercrime.gov.in/'
      }
    ]
  },
  {
    slug: 'upi-mdr-small-merchants',
    title: 'UPI MDR for Small Merchants: P2PM, P2M and the ₹1 Lakh Rule',
    metaTitle: 'UPI MDR for Small Merchants: P2PM, P2M and ₹1 Lakh Rule',
    description:
      'A merchant-focused guide to UPI MDR in 2026: P2PM classification, the ₹1 lakh monthly threshold, standard P2M rates, category exceptions and reconciliation tips.',
    category: 'For merchants',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 9,
    takeaways: [
      'P2PM is a small-merchant framework; eligible merchants with up to ₹1 lakh of UPI receipts a month remain zero-MDR under the notified 2026 framework.',
      'Standard P2M UPI payments above ₹2,000 carry 0.4% base MDR, capped at ₹300 from ₹75,000.',
      'Some essential categories and capital-market payments have separate rates.',
      'Your bank or payment service provider decides your classification and invoices the actual charges.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'If you accept UPI at a shop, stall or small business, the fee you pay depends on more than the payment amount. The merchant category, the account used to receive money and the acquiring arrangement all matter. The 2026 UPI framework has made those distinctions more visible.'
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Check whether the new rate is live',
        text: 'NPCI announced on 13 October 2026 that implementation of the new MDR on select P2M transactions would begin immediately after Diwali, at a date to be notified separately. The structure below is the notified model. Confirm the current start date and your own fee schedule with your bank or payment provider.'
      },
      { type: 'h2', text: 'P2PM and P2M in plain English' },
      {
        type: 'p',
        text: 'UPI transactions are commonly described as person-to-person (P2P), person-to-merchant (P2M) or person-to-person-merchant (P2PM). The labels describe the relationship and the payment setup, not just the value of the transfer.'
      },
      {
        type: 'table',
        caption: 'A simplified comparison. Classification and fees are determined by the merchant’s bank or payment service provider.',
        headers: ['Type', 'Typical use', 'MDR treatment in this guide'],
        rows: [
          ['P2P', 'Money sent to a friend or family member', 'Free, regardless of amount'],
          ['P2PM', 'Small vendor using a personal account and UPI QR', 'Zero MDR up to ₹1 lakh of UPI receipts per month for eligible merchants'],
          ['P2M', 'Formal merchant with a business acceptance setup', 'Standard 0.4% above ₹2,000, capped at ₹300; category exceptions may apply']
        ]
      },
      {
        type: 'p',
        text: 'A QR code alone does not tell you whether a merchant is P2PM or P2M. The classification sits with the bank or payment service provider and the merchant’s account setup. Ask your provider if you are unsure.'
      },
      { type: 'h2', text: 'The ₹1 lakh monthly P2PM threshold' },
      {
        type: 'p',
        text: 'Eligible P2PM merchants can receive up to ₹1 lakh per month through UPI without MDR under the framework described in the 2026 FAQs. This is a monthly receipts threshold, not a per-payment limit. A ₹2,500 payment can still be received under the P2PM arrangement; the merchant is not automatically pushed into MDR just because one payment is above ₹2,000.'
      },
      {
        type: 'p',
        text: 'Reporting has also described a transition mechanism: if a small merchant receives more than ₹1 lakh through UPI for three consecutive months, the merchant may be transitioned to the P2M category. The exact process and timing should be confirmed with your bank or provider.'
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Do not rely on a label alone',
        text: 'A merchant may say “zero MDR” because of a promotional plan, a P2PM classification or a specific category. The only reliable answer is the fee schedule and settlement statement from the provider that processes your payments.'
      },
      { type: 'h2', text: 'Standard P2M costs' },
      {
        type: 'p',
        text: 'For a standard P2M merchant transaction above ₹2,000, the base rate is 0.4%. Transactions at or below ₹2,000 are zero MDR. For ₹75,000 and above, the fee is capped at ₹300 per transaction under the standard framework.'
      },
      {
        type: 'table',
        caption: 'Illustrative base MDR for standard P2M payments, excluding GST and category-specific rules.',
        headers: ['Daily sale amount', 'Base MDR', 'Merchant receives before other fees'],
        rows: [
          ['₹1,000', '₹0', '₹1,000'],
          ['₹2,000', '₹0', '₹2,000'],
          ['₹5,000', '₹20', '₹4,980'],
          ['₹25,000', '₹100', '₹24,900'],
          ['₹75,000', '₹300', '₹74,700'],
          ['₹1,00,000', '₹300', '₹99,700']
        ]
      },
      {
        type: 'p',
        text: 'These numbers are base MDR only. A provider may also charge a platform fee, subscription, settlement fee or GST. Read the provider’s full pricing sheet rather than comparing only the headline percentage.'
      },
      { type: 'h2', text: 'Special categories' },
      {
        type: 'p',
        text: 'The standard rate does not apply to every merchant category. The 2026 framework describes a flat ₹5 MDR per transaction above ₹2,000 for essential and thin-margin sectors including railways, telecom services, insurance, fuel, utility bills, education and agricultural inputs. Capital-market payments have a separate 0.02% rate, capped at ₹300.'
      },
      {
        type: 'p',
        text: 'Your merchant category code and acquiring agreement determine eligibility. A generic calculator cannot tell your provider which category you are in. Check the merchant category on your onboarding documents.'
      },
      { type: 'h2', text: 'Reconciling MDR on your statements' },
      {
        type: 'ol',
        items: [
          'Download the settlement report from your provider, not just the UPI app notification.',
          'Separate gross sales, MDR, GST and any platform or subscription fees.',
          'Check whether a transaction was classified as P2PM, P2M or a special category.',
          'Compare the per-transaction fee with the published rate and cap.',
          'Raise a support ticket with the provider if a line item is unexplained.',
          'Keep invoices and order references so a payment can be matched to a sale.'
        ]
      },
      {
        type: 'p',
        text: 'Reconciling small-value sales is easier when every payment has a clear invoice number. If you accept split payments for one order, record the order reference on each payment and keep a note of the relationship between them.'
      },
      { type: 'h2', text: 'Why splitting transactions is not a compliance strategy' },
      {
        type: 'p',
        text: 'A merchant should not divide a single sale into multiple payments solely to avoid a fee or change how the transaction appears. That can create reconciliation problems, confuse customers and conflict with the provider’s terms. The proper path is to confirm your classification and use the billing process required by your acquiring agreement.'
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Get advice for your business',
        text: 'This guide is general information. MDR treatment can depend on your provider, category and turnover. Consult your chartered accountant or acquiring bank for advice about your actual bills and statements.'
      }
    ],
    faqs: [
      {
        q: 'Does a small merchant pay MDR when a customer sends ₹5,000?',
        a: 'Not necessarily. An eligible P2PM merchant can receive UPI payments under its monthly framework even when an individual payment is above ₹2,000. Classification and monthly receipts matter, so confirm with the provider.'
      },
      {
        q: 'Is GST included in the 0.4% figure?',
        a: 'The 0.4% is the base MDR discussed in the framework. GST may be charged on the MDR by the provider. Check your invoice for the total deduction.'
      },
      {
        q: 'Do I need to change my QR code?',
        a: 'The NPCI FAQs indicate that small merchants operating under exempted tiers do not need to change their QR code simply because a payment is above ₹2,000. Follow any specific instructions from your bank or provider.'
      },
      {
        q: 'Who decides if I am P2PM or P2M?',
        a: 'Your bank or payment service provider handles onboarding and classification. Ask them to show you your current category and the fee schedule attached to it.'
      }
    ],
    sources: [
      {
        label: 'NPCI: MDR FAQs for select UPI P2M transactions',
        href: 'https://www.npci.org.in/uploads/FA_Qs_Merchant_Discount_Rate_MDR_on_Select_UPI_P2_M_Transactions_58dba1d39e.pdf'
      },
      {
        label: 'NPCI: UPI MDR implementation deferred to post-Diwali (13 Oct 2026)',
        href: 'https://www.npci.org.in/uploads/UPI_MDR_on_Select_Merchant_Transactions_Shall_be_Implemented_Post_Diwali_4c9cdd77d5.pdf'
      },
      {
        label: 'PIB: Zero MDR for small merchants and payments up to ₹2,000',
        href: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310586&lang=1&reg=48'
      },
      {
        label: 'Business Standard: What customers and merchants need to know about the 2026 MDR framework',
        href: 'https://www.business-standard.com/finance/news/mdr-on-upi-payments-what-customers-merchants-need-to-know-from-oct-15-126092401287_1.html'
      }
    ]
  },
  {
    slug: 'upi-payment-safety',
    title: 'UPI Payment Safety: PIN, OTP, Collect Requests and Refunds',
    metaTitle: 'UPI Payment Safety Guide: PIN, OTP, Collect Requests and Refunds',
    description:
      'A practical UPI safety guide covering PIN rules, collect requests, QR tampering, fake support calls, payment verification and what to do when a payment goes wrong.',
    category: 'Safety',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 7,
    takeaways: [
      'You enter a UPI PIN to send money, not to receive it.',
      'A collect request is an authorization request, not proof that a refund is waiting.',
      'Verify the merchant and amount in your UPI app before approving any debit.',
      'Refunds and disputes are handled by the merchant and the UPI app or bank you used.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'UPI is convenient because a payment can be completed in seconds. That speed is also why the final review screen matters. A QR code, payment link or request can look ordinary while directing money somewhere unexpected. These checks reduce the most common mistakes.'
      },
      { type: 'h2', text: 'The PIN rule: sending, not receiving' },
      {
        type: 'p',
        text: 'A UPI PIN authorizes a debit from your bank account. You do not need to enter a PIN to receive money. If someone says you must enter a PIN to “activate” a refund, “verify” your account or receive a prize, treat it as a red flag.'
      },
      {
        type: 'p',
        text: 'Your PIN should only be entered inside your UPI app after you have checked the payee and amount. No merchant, bank official, customer-care agent or website needs your PIN. OTPs and screen-sharing access are equally sensitive.'
      },
      { type: 'h2', text: 'Collect requests and payment requests' },
      {
        type: 'p',
        text: 'A collect request asks you to approve a debit. It may be legitimate when you owe a merchant money, but it can also be used to trick someone who is expecting a refund. Read the request carefully: who is asking, how much, and why? If you are not expecting to pay that person, decline it.'
      },
      {
        type: 'ul',
        items: [
          'A refund does not require you to approve a new debit request.',
          'A screenshot of a “payment initiated” screen is not proof of settlement.',
          'Check the payee name in your app, not only the name in a chat message.',
          'Do not approve a request just because someone says it will be reversed later.'
        ]
      },
      { type: 'h2', text: 'QR code tampering' },
      {
        type: 'p',
        text: 'A static merchant QR is easy to replace with a sticker. Before paying at a counter, check whether the code looks tampered with and whether the decoded payee matches the merchant. If the displayed name is a person you do not recognize, stop and ask staff.'
      },
      {
        type: 'p',
        text: 'For online merchants, use the payment link or QR shown in the merchant’s official app or website. Avoid QR codes forwarded by unknown accounts, even if the message looks like a known brand.'
      },
      { type: 'h2', text: 'Fake support, cashback and screen sharing' },
      {
        type: 'p',
        text: 'Fraudsters often pretend to be from a bank, UPI app, merchant or government office. They may claim there is a pending cashback, a failed payment, a KYC problem or a refund. Common tactics include:'
      },
      {
        type: 'ul',
        items: [
          'Asking you to install a remote-access or screen-sharing app.',
          'Sending a QR code and saying it is needed to receive money.',
          'Asking for an OTP, UPI PIN, card details or bank password.',
          'Creating urgency so you do not check the merchant or amount.',
          'Sending a fake payment screenshot and asking you to “return” an amount that never arrived.'
        ]
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Hang up and use an official channel',
        text: 'If a caller creates pressure, end the call. Open your UPI app or bank’s official website yourself and use the support number printed there. Do not use a link or number supplied by the caller.'
      },
      { type: 'h2', text: 'A safe payment checklist' },
      {
        type: 'ol',
        items: [
          'Confirm the merchant and the amount from the invoice or display.',
          'Check the payee name and UPI ID in your UPI app.',
          'Make sure you are sending money, not approving an unexpected request.',
          'Enter your PIN only in the official UPI app.',
          'Save the payment confirmation and merchant receipt.',
          'If the payment fails, do not retry blindly; check the status and the bank account first.'
        ]
      },
      { type: 'h2', text: 'Refunds and payment disputes' },
      {
        type: 'p',
        text: 'A refund is normally initiated by the merchant through the same payment channel. The timing depends on the merchant, bank and UPI app. MDR Free Split does not process payments and cannot issue a refund, reverse a transfer or confirm that a merchant received money.'
      },
      {
        type: 'p',
        text: 'If a merchant does not deliver what was agreed, contact the merchant first and keep the invoice, chat and payment reference. Then use the dispute or support process in your UPI app or bank. For cyber-financial fraud in India, report through the national cybercrime portal and call the 1930 helpline as soon as possible.'
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Time matters in fraud reports',
        text: 'Report unauthorized or fraudulent transactions quickly. The sooner your bank or the cybercrime channel is alerted, the more options may be available for tracing or blocking the funds.'
      }
    ],
    faqs: [
      {
        q: 'Can a merchant ask for my UPI PIN?',
        a: 'No. A merchant should never ask for your UPI PIN, OTP, password or screen access. Enter your PIN only inside your own UPI app.'
      },
      {
        q: 'Is a payment screenshot proof that money was sent?',
        a: 'No. Screenshots can be edited, and a pending or failed payment is not a completed transfer. Verify the credit in the merchant’s account or the payment status in the bank or UPI app.'
      },
      {
        q: 'What should I do if I approved a collect request by mistake?',
        a: 'Contact your bank and the UPI app support immediately, keep the reference number, and report the transaction. Also report cyber-financial fraud through the official channels.'
      },
      {
        q: 'Does MDR Free Split store my PIN or OTP?',
        a: 'No. The site never asks for or stores your UPI PIN, OTP, card details or bank credentials. Payments happen in your UPI app.'
      }
    ],
    sources: [
      {
        label: 'National Cyber Crime Reporting Portal',
        href: 'https://cybercrime.gov.in/'
      },
      {
        label: 'NPCI: UPI product overview',
        href: 'https://www.npci.org.in/what-we-do/upi/product-overview/'
      }
    ]
  },
  {
    slug: 'how-mdr-free-split-works',
    title: 'How the MDR Free Split Calculator Works',
    metaTitle: 'How the MDR Free Split Calculator Works: Features and Limits',
    description:
      'A transparent walkthrough of how MDR Free Split scans a merchant QR, calculates installments, opens UPI apps, stores plans locally and avoids collecting payments.',
    category: 'Using the tool',
    publishedAt: '2026-10-23',
    updatedAt: '2026-10-23',
    readingMinutes: 6,
    takeaways: [
      'The tool scans or decodes a merchant QR, calculates a split and opens a UPI payment intent.',
      'It does not hold funds, confirm payments, track settlement or issue refunds.',
      'Plans are stored only in your browser for seven days; there is no account.',
      'MDR figures are estimates and may not reflect the merchant’s category, GST or provider fees.'
    ],
    blocks: [
      {
        type: 'p',
        text: 'MDR Free Split is deliberately narrow. It helps you turn one merchant bill into a list of installment amounts, then opens each installment in a UPI app. It is not a wallet, a payment gateway or a merchant settlement dashboard.'
      },
      { type: 'h2', text: 'What happens when you create a split' },
      {
        type: 'ol',
        items: [
          '**Scan or enter the merchant details.** You can use the camera, upload a QR image, or type the UPI ID and merchant name. The QR and image decoding happens on your device.',
          '**Enter the total bill.** The calculator can use an amount supplied by a dynamic QR, but you should check it against the bill.',
          '**Choose an installment count.** Presets range from 2x to 8x, and you can use the custom stepper for a different count.',
          '**Review the split.** Equal mode keeps amounts close and puts any rounding difference in the final installment. Custom mode lets you edit individual amounts.',
          '**Create the plan.** The plan is saved in local storage with a URL you can open again in the same browser.',
          '**Open an installment in a UPI app.** On mobile, the button opens a UPI intent. On desktop, the plan can show a QR code for the installment.'
        ]
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'You make every payment',
        text: 'The calculator never auto-debits an installment. Each button opens a payment instruction that you review and authorize inside your own UPI app.'
      },
      { type: 'h2', text: 'What the calculator does not do' },
      {
        type: 'ul',
        items: [
          'It does not collect, hold or settle money.',
          'It does not know whether an installment was paid.',
          'It does not verify a merchant’s bank account or business registration.',
          'It does not issue receipts, refunds or payment confirmations.',
          'It does not store a UPI PIN, OTP, card number or bank password.',
          'It does not produce a tax invoice or a legally binding installment contract.'
        ]
      },
      { type: 'h2', text: 'How the MDR estimate is calculated' },
      {
        type: 'p',
        text: 'The calculator uses the standard ₹2,000 per-transaction threshold and a 0.4% base rate above that amount, with a ₹300 cap at ₹75,000 and above. It compares one payment with a proposed installment plan and highlights how many installments fall at or below the threshold.'
      },
      {
        type: 'p',
        text: 'Those figures are estimates. The actual merchant MDR depends on the merchant’s classification (P2PM or P2M), category-specific rules, provider fees and GST. A QR code does not contain enough information for the calculator to determine all of that. The merchant’s settlement statement is the authoritative source.'
      },
      {
        type: 'table',
        caption: 'Example: the calculator’s standard-rate arithmetic for a ₹6,000 bill.',
        headers: ['Plan', 'Per payment', 'Base MDR estimate'],
        rows: [
          ['One payment', '₹6,000', '₹24'],
          ['Three payments', '₹2,000 each', '₹0'],
          ['Six payments', '₹1,000 each', '₹0']
        ]
      },
      { type: 'h2', text: 'Privacy and local storage' },
      {
        type: 'p',
        text: 'Plans are stored in your browser’s local storage under a single key. There is no account and no server database of plans. The site automatically removes plans older than seven days when it next reads the saved list. Clearing site data removes them immediately.'
      },
      {
        type: 'p',
        text: 'Camera frames and uploaded QR images are processed in memory for decoding. The calculator does not send those images to a server. The content pages load Google AdSense for advertising; see the [Privacy Policy](/privacy) for details about cookies and third-party advertising.'
      },
      { type: 'h2', text: 'What to do when a QR will not decode' },
      {
        type: 'p',
        text: 'Try a clear, tightly cropped image with the complete QR visible. PNG, JPG and WEBP are supported. Transparent-background QRs are drawn on white before decoding. If the image still fails, verify the merchant’s UPI ID through another source and enter it manually.'
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Use the plan as a checklist',
        text: 'Keep the merchant invoice and the payment confirmations from your UPI app. The saved plan helps you remember the intended amounts, but it is not a receipt or proof of payment.'
      }
    ],
    faqs: [
      {
        q: 'Is MDR Free Split a payment gateway?',
        a: 'No. It is a calculator and planner. It does not collect funds, connect to a merchant account, settle payments or verify transactions.'
      },
      {
        q: 'Do I need an account?',
        a: 'No. The calculator works without registration. Plans are stored in the browser for seven days.'
      },
      {
        q: 'Can I share a plan link?',
        a: 'The plan file lives in your browser’s local storage. A link works only in the same browser profile that saved the plan. Use the copy-plan action to share the amounts as text instead.'
      },
      {
        q: 'Does the site show ads on the calculator?',
        a: 'Advertising is limited to editorial guide pages, not the calculator or plan screens. The site may still load basic resources from its hosting provider on every page.'
      }
    ],
    sources: [
      {
        label: 'NPCI: UPI product overview',
        href: 'https://www.npci.org.in/what-we-do/upi/product-overview/'
      },
      {
        label: 'NPCI: MDR FAQs for select UPI merchant transactions',
        href: 'https://www.npci.org.in/uploads/FA_Qs_Merchant_Discount_Rate_MDR_on_Select_UPI_P2_M_Transactions_58dba1d39e.pdf'
      }
    ]
  }
];

export const getGuide = (slug: string): Guide | undefined =>
  GUIDES.find((guide) => guide.slug === slug);

export const FEATURED_GUIDES = GUIDES.slice(0, 3);

export const formatGuideDate = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
