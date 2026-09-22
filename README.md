# SplitUPI

> **Tagline:** Split. Pay. Done.

SplitUPI is a production-ready full-stack fintech web application engineered to enable users to enter a total payment amount, scan or upload a merchant UPI QR code, generate an installment-based split payment plan, and authorize each payment sequentially inside certified UPI applications (**PhonePe, Google Pay, Paytm, BHIM, or any installed bank UPI app**).

---

## Table of Contents

1. [Product Overview & Architecture](#1-product-overview--architecture)
2. [Zero-Credential & Zero-PIN Security Architecture](#2-zero-credential--zero-pin-security-architecture)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Local Setup Guide](#4-local-setup-guide)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema & Migrations](#6-database-schema--migrations)
7. [Testing Suite](#7-testing-suite)
8. [Production Deployment Guide](#8-production-deployment-guide)
9. [Payment Provider Integration Guide](#9-payment-provider-integration-guide)
10. [Reconciliation & Recovery Engine](#10-reconciliation--recovery-engine)
11. [Regulatory, Legal & Compliance Notices](#11-regulatory-legal--compliance-notices)

---

## 1. Product Overview & Architecture

SplitUPI coordinates partial-payment and expense-splitting workflows across standard Indian Unified Payments Interface (UPI) infrastructure.

### Key Capabilities
- **Merchant QR Decoding & Validation**: Reads live camera streams or uploaded images using `jsQR`, decodes standard `upi://pay` URIs, extracts Payee VPA, Payee Name, Amount, and Currency, and sanitizes untrusted input before confirmation.
- **Strict Split Math Engine**: Guarantees that the sum of all installments equals the total payment amount down to 0 paise. Rounding errors are strictly prevented.
- **Sequential Payment State Machine**: Enforces strict sequential authorization. Subsequent installments remain locked (`LOCKED`) until the preceding installment is verified as `SUCCESS` by the server banking switch.
- **Multi-App UPI Intent Dispatch**: Dispatches standard NPCI deep links with URL-encoded parameters to PhonePe, Google Pay, Paytm, BHIM, or desktop QR fallback.
- **Admin Telemetry & Audit Trail**: Real-time transaction tracing, search by payment reference/VPA, webhook ingestion logs, and background reconciliation triggers.

---

## 2. Zero-Credential & Zero-PIN Security Architecture

```
+--------------------------------------------------------------------------------+
|                        ZERO-CREDENTIAL BOUNDARY                                |
|                                                                                |
|  SplitUPI NEVER collects, handles, logs, or stores:                            |
|    - User UPI PIN                                                              |
|    - Net-banking login credentials or passwords                                |
|    - Debit / Credit card numbers, CVVs, or expiry dates                        |
|    - One-Time Passwords (OTPs)                                                 |
|                                                                                |
|  All PIN authorization occurs exclusively inside certified third-party         |
|  UPI applications operating under RBI/NPCI banking security frameworks.        |
+--------------------------------------------------------------------------------+
```

1. **Client Deep-Link Hand-Off**: SplitUPI generates standard `upi://pay` intent URIs that hand execution directly to the user's local UPI application.
2. **Untrusted QR Sanitization**: Untrusted payloads are parsed to reject malicious external URLs, scripts, and spoofed VPAs.
3. **Idempotency Protection**: Every payment initiation sends an `Idempotency-Key` header to prevent duplicate charges from network retry loops.
4. **Server-Side Status Verification**: The client-side "I've completed the payment" button is never trusted blindly. The backend validates payment status through direct banking switch queries or cryptographic webhook signatures.

---

## 3. Architecture Diagram

```
                                  +-----------------------------+
                                  |    User / Mobile Browser    |
                                  +--------------+--------------+
                                                 |
                         1. Scans QR / Creates Split Plan
                                                 v
+------------------------+        +--------------+--------------+
|   Certified UPI App    | <..... |   SplitUPI Web Client       |
| (PhonePe/GPay/Paytm)   |  Deep  |  (Next.js / Vite + React)   |
+-----------+------------+  Link  +--------------+--------------+
            |                                    |
            | 2. User Enters PIN                 | 3. Controlled Polling
            |    (Inside UPI App)                |    / Status Query
            v                                    v
+-----------+------------+        +--------------+--------------+
|      Bank / NPCI       | -----> |      SplitUPI Backend       |
|    Payment Switch      |  Sign. |  (FastAPI / Express API)    |
+------------------------+  Hook  +--------------+--------------+
                                                 |
                                  +--------------+--------------+
                                  |  PostgreSQL / Redis / DB    |
                                  +-----------------------------+
```

---

## 4. Local Setup Guide

### Option A: Docker Compose (Recommended)

Run all services (Frontend, Backend, PostgreSQL, Redis) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-org/splitupi.git
cd splitupi

# Copy environment variables
cp .env.example .env

# Build and start all containers
docker-compose up --build
```

Access the application:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000` / `http://localhost:3000/api/v1`
- **API Documentation**: `http://localhost:8000/docs`

### Option B: Local Development Setup

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (Node.js)
```bash
# From workspace root
npm install
npm run dev
```

---

## 5. Environment Variables

Reference `.env.example` for all required configuration keys:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://splitupi:...@localhost:5432/splitupi` |
| `REDIS_URL` | Redis instance for rate limiting and cache | `redis://localhost:6379/0` |
| `PAYMENT_PROVIDER` | Active provider adapter (`mock`, `razorpay`, `cashfree`, `setu`) | `mock` |
| `WEBHOOK_SECRET` | HMAC SHA256 secret for verifying webhooks | `your_provider_webhook_secret` |
| `JWT_SECRET` | Secret key for signing user session tokens | `your_super_secret_jwt_key` |
| `PORT` | Web server listening port | `3000` |

---

## 6. Database Schema & Migrations

The database uses PostgreSQL with Alembic migrations:

### Tables
- `users`: Registered customer and admin accounts.
- `split_plans`: Main split contract storing merchant VPA, total amount, number of installments, and overall plan status (`DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
- `split_items`: Scheduled installments with sequence numbers, amounts, and individual status (`LOCKED`, `NOT_STARTED`, `INITIATED`, `PENDING`, `SUCCESS`, `FAILED`).
- `payments`: Payment attempt records tracking idempotency keys, transaction references, provider IDs, UPI app used, and error diagnostics.
- `webhook_events`: Audit log of incoming bank/gateway webhooks, including signature verification results and processing timestamps.
- `audit_logs`: Append-only security audit trail of sensitive system actions.

### Running Migrations
```bash
# Generate a migration
alembic revision --autogenerate -m "Add split plans and payments"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

---

## 7. Testing Suite

### Running Backend Unit & Integration Tests
```bash
cd backend
pytest -v tests/test_payments.py
```

Test coverage includes:
- **UPI VPA Validation**: Validates RFC-compliant handle formats and rejects malicious strings.
- **Split Sum Guarantee**: Verifies that installment totals strictly match the total amount to 0.00 precision.
- **Mock Provider Deep Links**: Verifies NPCI URI formatting and URL encoding.
- **Webhook HMAC Signatures**: Validates authentic vs. tampered webhook payloads.

---

## 8. Production Deployment Guide

### Deployment Checklist
1. **Frontend (Vercel / Cloud Run)**: Set `NEXT_PUBLIC_API_URL` to the production backend gateway.
2. **Backend (Render / Railway / AWS ECS)**: Bind to `0.0.0.0`, configure production database pooling, and set `PAYMENT_PROVIDER` to your licensed gateway adapter.
3. **SSL / HTTPS**: Enforce TLS 1.3 across all routes.
4. **Security Headers**: Enable Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, and X-Frame-Options.

---

## 9. Payment Provider Integration Guide

To connect a production payment provider (e.g. Setu, Cashfree, or Razorpay UPI):

1. Implement the `UPIPaymentProvider` interface from `backend/app/providers.py`:
   - `create_payment_request(...)` -> Generates deep link / dynamic QR from provider API.
   - `check_payment_status(...)` -> Inquires real-time bank switch settlement.
   - `verify_webhook_signature(...)` -> Authenticates inbound bank webhook payloads.
2. Set `PAYMENT_PROVIDER=your_provider` in environment variables.
3. Register your public webhook endpoint at `/api/v1/webhooks/{provider}` in your provider's dashboard.

---

## 10. Reconciliation & Recovery Engine

Network timeouts and app switching can occasionally interrupt client notifications:

- **Periodic Status Reconciliation**: A background worker periodically queries all payments in `PENDING` state for > 60 seconds against the provider's status endpoint.
- **Webhook Ingestion**: Authoritative asynchronous notifications from the banking switch automatically update payment and split item status, instantly unlocking the next installment.
- **Manual Reconciliation Trigger**: Administrators can trigger batch status reconciliation on demand from the Admin Console (`/admin`).

---

## 11. Regulatory, Legal & Compliance Notices

### Non-Banking Entity Disclaimer
SplitUPI is an independent software application designed for partial payment planning and coordination. SplitUPI is **NOT a bank, non-banking financial company (NBFC), or licensed payment system operator**. All financial transactions are authorized by users directly inside certified UPI applications.

### Anti-Evasion Mandate (Section 36 Compliance)
SplitUPI does not advertise, support, or facilitate any functionality intended to manipulate, bypass, evade, or circumvent payment-network merchant discount rate (MDR) fees, interchange fees, or banking controls. The split feature is strictly provided as a consumer budgeting and partial-payment scheduling aid.

### Trademark Notice
PhonePe, Google Pay, Paytm, BHIM, and other bank names are registered trademarks of their respective owners. Mention of these services does not imply any partnership, affiliation, endorsement, or sponsorship.
