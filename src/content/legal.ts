import type { LegalDoc } from './types';

export const LEGAL_DOCS: LegalDoc[] = [
  {
    path: '/privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy — MDR Free Split',
    description:
      'How MDR Free Split handles split plans, local browser storage, QR images, camera access, contact messages, hosting logs and advertising cookies.',
    updatedAt: '2026-10-23',
    intro:
      'This policy explains what MDR Free Split stores, what stays on your device, and how third-party advertising and hosting services may process technical data. It applies to the website at [mdr free split](https://mdr-free-split.vercel.app).',
    blocks: [
      { type: 'h2', text: 'Who we are' },
      {
        type: 'p',
        text: 'MDR Free Split is an independent calculator and planning website operated by Vamshi Polishetti. You can contact us at **polishettivamshi123@gmail.com**.'
      },
      { type: 'h2', text: 'The short version' },
      {
        type: 'ul',
        items: [
          'You do not need an account to use the calculator.',
          'Split plans are saved in your browser, not in a server-side account.',
          'Camera frames and uploaded QR images are processed on your device for decoding.',
          'We never ask for your UPI PIN, OTP, card number or bank password.',
          'Advertising is limited to editorial guide pages. The calculator and plan screens do not load the advertising script.'
        ]
      },
      { type: 'h2', text: 'Information stored in your browser' },
      {
        type: 'p',
        text: 'When you create a split plan, the calculator stores the merchant name, merchant UPI ID, total amount, installment amounts, timestamps and internal plan identifiers in your browser’s local storage under the key **mdfreesplit_plans**. This information is used to show recent plans and to reopen a plan URL in the same browser.'
      },
      {
        type: 'p',
        text: 'Plans are automatically treated as expired after **seven days** and are removed the next time the site reads the saved list. You can remove all plans immediately by clearing site data or local storage for this website in your browser settings. Plans do not sync across browsers or devices.'
      },
      { type: 'h2', text: 'Camera access and QR images' },
      {
        type: 'p',
        text: 'If you choose the camera scanner, your browser asks for camera permission. Camera frames are used in the browser to locate and decode a QR code. If you upload an image, the file is read and decoded in your browser. MDR Free Split does not upload your camera feed or QR image to a server.'
      },
      {
        type: 'p',
        text: 'Your browser or device may retain camera permissions and recent files according to its own settings. You can revoke camera access at any time in your browser or operating-system settings.'
      },
      { type: 'h2', text: 'Information you choose to send us' },
      {
        type: 'p',
        text: 'If you email or call us, we receive the information you provide, such as your name, email address, phone number and message. We use it to respond to your enquiry, investigate a correction, or handle a privacy request. Please do not send UPI PINs, OTPs, card details, bank passwords or other authentication secrets.'
      },
      { type: 'h2', text: 'Advertising and cookies' },
      {
        type: 'p',
        text: 'Our editorial guide pages may use Google AdSense to display advertising. Google and its partners may use cookies or similar technologies to serve ads based on your visits to this and other websites. These technologies are controlled by Google and its partners, not by the calculator.'
      },
      {
        type: 'p',
        text: 'You can learn about Google’s advertising practices and manage personalized advertising through [Google Ads Settings](https://adssettings.google.com/) and [Google’s advertising technologies page](https://policies.google.com/technologies/ads). You can also use the [Digital Advertising Alliance opt-out page](https://www.aboutads.info/choices/) where available. Blocking or clearing cookies may affect how ads are personalized.'
      },
      {
        type: 'p',
        text: 'We do not currently use a separate analytics product, sell personal information, or build user profiles from calculator inputs. Third-party advertising and hosting providers process data under their own policies.'
      },
      { type: 'h2', text: 'Hosting and technical data' },
      {
        type: 'p',
        text: 'The site is hosted by Vercel. Like most hosting providers, Vercel may process technical request data such as IP address, device and browser information, requested URL, timestamps and error logs to deliver and protect the service. We may also receive aggregated or diagnostic information from the hosting platform.'
      },
      { type: 'h2', text: 'How we use information' },
      {
        type: 'ul',
        items: [
          'To operate the calculator, save plans locally and open installment payment links.',
          'To respond to questions, corrections and privacy requests.',
          'To maintain site security, diagnose errors and prevent abuse.',
          'To display advertising on editorial pages, subject to your choices and applicable law.',
          'To comply with legal obligations and enforce our terms.'
        ]
      },
      { type: 'h2', text: 'Sharing' },
      {
        type: 'p',
        text: 'We do not sell your split plans or contact information. We may share information with service providers that help host the site or serve ads, when required by law, or when necessary to protect rights and safety. Payment information is handled by your bank and UPI app, not by this website.'
      },
      { type: 'h2', text: 'Retention' },
      {
        type: 'p',
        text: 'Local plans remain for up to seven days or until you clear them. Contact correspondence is kept only as long as reasonably necessary to respond and maintain records. Hosting and advertising providers set their own retention periods.'
      },
      { type: 'h2', text: 'Your choices and rights' },
      {
        type: 'p',
        text: 'You can clear local plan data through your browser settings, revoke camera permission, block or delete cookies, and manage personalized advertising through the links above. Depending on where you live, you may have additional rights to access, correct or delete personal information, or to object to certain processing. Contact us to make a request.'
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Never send authentication secrets',
        text: 'We will never ask for your UPI PIN, OTP, card number, CVV, bank password or remote access to your device. If someone asks for these while claiming to represent MDR Free Split, stop and contact us through the email address on this page.'
      },
      { type: 'h2', text: 'Children' },
      {
        type: 'p',
        text: 'The site is intended for adults who can use UPI and enter into payment arrangements. It is not directed to children under 13, and we do not knowingly collect personal information from children.'
      },
      { type: 'h2', text: 'Changes to this policy' },
      {
        type: 'p',
        text: 'We may update this policy when the site, legal requirements or third-party services change. The “last updated” date at the top of this page shows the latest revision. Material changes will be reflected on this page.'
      },
      { type: 'h2', text: 'Contact' },
      {
        type: 'p',
        text: 'For privacy questions or requests, email **polishettivamshi123@gmail.com**. You can also visit the [Contact page](/contact) for other ways to reach us.'
      }
    ]
  },
  {
    path: '/terms',
    title: 'Terms of Use',
    metaTitle: 'Terms of Use — MDR Free Split',
    description:
      'The terms that apply to MDR Free Split, an independent UPI split calculator and planning website. No payment processing, financial advice or refunds.',
    updatedAt: '2026-10-23',
    intro:
      'These terms govern your use of MDR Free Split. By using the site, you agree to these terms. If you do not agree, please do not use the site.',
    blocks: [
      { type: 'h2', text: 'The service' },
      {
        type: 'p',
        text: 'MDR Free Split is a free calculator and planning tool. It can read merchant UPI QR information, divide a bill into installment amounts, save a plan in your browser, and open a UPI payment instruction in a UPI app. The site is informational and computational only.'
      },
      { type: 'h2', text: 'We are not a payment service' },
      {
        type: 'ul',
        items: [
          'We are not a bank, payment aggregator, payment gateway, merchant of record or UPI service provider.',
          'We do not collect, hold, transfer, settle, verify or reverse payments.',
          'We do not issue receipts, invoices, refunds or payment confirmations.',
          'Your payment is made directly to the merchant through your own UPI app. Any dispute is between you, the merchant and your bank or UPI app.'
        ]
      },
      { type: 'h2', text: 'Estimates, not advice' },
      {
        type: 'p',
        text: 'MDR figures and installment comparisons are estimates based on the assumptions shown in the calculator and our published guides. They may not reflect a merchant’s classification, category-specific rate, provider fees, taxes or current rules. Nothing on this site is financial, tax, legal or accounting advice. Verify rates with your bank, payment service provider or professional adviser.'
      },
      { type: 'h2', text: 'Your responsibilities' },
      {
        type: 'ul',
        items: [
          'Use the calculator only for lawful, genuine payment planning.',
          'Confirm the merchant, amount and installment arrangement before paying.',
          'Do not use multiple payments to disguise a transaction, evade fees or mislead a merchant or provider.',
          'Keep your own records of invoices, receipts and payment confirmations.',
          'Do not rely on a saved plan as proof that a payment was made.'
        ]
      },
      { type: 'h2', text: 'Acceptable use' },
      {
        type: 'p',
        text: 'You may not use the site to violate any law, infringe another person’s rights, distribute malware, attempt unauthorized access, scrape the service at scale, or interfere with its operation. We may restrict access where we reasonably believe the site is being misused.'
      },
      { type: 'h2', text: 'Links to third parties' },
      {
        type: 'p',
        text: 'The site links to UPI apps, banks, government resources, SmartScaleTech, LinkedIn and other third-party websites. We do not control those services and are not responsible for their content, availability, security or privacy practices. A link is not an endorsement of every statement on the destination site.'
      },
      { type: 'h2', text: 'Intellectual property' },
      {
        type: 'p',
        text: 'The site’s original text, design, branding and code are protected by applicable intellectual-property laws. You may share links to the site and use the calculator for personal or internal business purposes. Do not copy, republish or sell substantial portions of the site without permission. Third-party names and marks belong to their respective owners.'
      },
      { type: 'h2', text: 'Availability and warranties' },
      {
        type: 'p',
        text: 'The site is provided on an “as is” and “as available” basis. We try to keep the calculator and content accurate and available, but we do not guarantee uninterrupted access, error-free calculations or that every merchant QR code will decode. To the fullest extent permitted by law, we disclaim implied warranties of merchantability, fitness for a particular purpose and non-infringement.'
      },
      { type: 'h2', text: 'Limitation of liability' },
      {
        type: 'p',
        text: 'To the fullest extent permitted by law, MDR Free Split, SmartScaleTech and their operators will not be liable for indirect, incidental, special, consequential or punitive losses, or for lost profits, data, goodwill or payments, arising from your use of or inability to use the site. Nothing in these terms limits liability that cannot lawfully be limited.'
      },
      { type: 'h2', text: 'Changes and termination' },
      {
        type: 'p',
        text: 'We may update, suspend or discontinue the site or these terms. Changes take effect when posted on this page. Continued use after a change means you accept the revised terms.'
      },
      { type: 'h2', text: 'Governing law' },
      {
        type: 'p',
        text: 'These terms are governed by the laws of India. Any dispute is subject to the jurisdiction of the competent courts in India, unless applicable law requires otherwise.'
      },
      { type: 'h2', text: 'Contact' },
      {
        type: 'p',
        text: 'Questions about these terms can be sent to **polishettivamshi123@gmail.com**. See the [Contact page](/contact) for more details.'
      }
    ]
  },
  {
    path: '/disclaimer',
    title: 'Disclaimer',
    metaTitle: 'Disclaimer — MDR Free Split',
    description:
      'Important information about MDR Free Split: it is an independent calculator, not a payment service or financial adviser, and its MDR estimates are not final statements of fees.',
    updatedAt: '2026-10-23',
    intro:
      'MDR Free Split is an independent calculator and planning tool. This page explains the limits of the information and functionality provided here.',
    blocks: [
      { type: 'h2', text: 'No affiliation' },
      {
        type: 'p',
        text: 'MDR Free Split is not affiliated with, endorsed by or operated by NPCI, the Reserve Bank of India, any bank, or any UPI app. Names such as PhonePe, Google Pay, Paytm, BHIM and other app names are trademarks of their respective owners and are used only to describe compatible payment options.'
      },
      { type: 'h2', text: 'Calculator only' },
      {
        type: 'p',
        text: 'The site calculates installments and opens UPI payment links. It does not process payments, hold funds, verify merchant accounts, confirm settlement, issue refunds or provide a payment guarantee. All payments happen in your UPI app and are made directly to the payee shown there.'
      },
      { type: 'h2', text: 'MDR information is an estimate' },
      {
        type: 'p',
        text: 'UPI MDR rules, merchant classifications and category rates can change. The calculator uses a simplified standard-rate model and does not know a merchant’s actual P2PM/P2M status, merchant category code, provider fees or GST treatment. The merchant’s settlement statement or provider agreement is the authoritative record of fees.'
      },
      { type: 'h2', text: 'Not financial, tax or legal advice' },
      {
        type: 'p',
        text: 'The guides on this site are general educational content. They are not a recommendation to make or avoid a payment, split a bill, change a business classification or report a transaction in a particular way. Consult a qualified professional or your bank or payment provider for advice about your circumstances.'
      },
      { type: 'h2', text: 'Verify before paying' },
      {
        type: 'p',
        text: 'Always verify the merchant name, UPI ID and amount in your UPI app before entering your PIN. A QR code can be tampered with or replaced. A saved plan is not a payment receipt, and an unpaid installment remains your responsibility.'
      },
      { type: 'h2', text: 'External links' },
      {
        type: 'p',
        text: 'Links to third-party websites are provided for convenience and context. We do not control their content or availability and are not responsible for their services, security or policies.'
      },
      { type: 'h2', text: 'Contact' },
      {
        type: 'p',
        text: 'To report an error or ask a question about the calculator, email **polishettivamshi123@gmail.com** or visit the [Contact page](/contact).'
      }
    ]
  }
];

export const getLegalDoc = (path: LegalDoc['path']): LegalDoc =>
  LEGAL_DOCS.find((doc) => doc.path === path) as LegalDoc;
