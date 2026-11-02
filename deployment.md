# OrderSaathi — Deployment & Operational Runbook

**Product Name:** OrderSaathi  
**Tagline:** Smarter Orders. Faster Distribution.  
**Category:** B2B FMCG Distribution Platform (Jabalpur, Madhya Pradesh)  

---

## 1. Quick Overview

OrderSaathi is a dual-portal B2B FMCG distribution platform purpose-built for FMCG distributors and kirana retail store owners in India. It replaces unstructured WhatsApp, paper notebook, and phone-call ordering with:
* Real-time Kirana ordering with individualized dealer pricing and promotional schemes.
* Hinglish conversational AI order extraction (detecting quantity units, pack sizes, and ambiguity).
* Automated credit line checks (auto-hold for exceeded limits).
* Order Desk review queue for order approval, line-item correction, and credit overrides.
* One-click Tally-compatible sales voucher CSV export with audit logging.
* Role-Based Access Control (RBAC) separating **Retailers** from **Order Desk** employees.

---

## 2. Prerequisites & Local Environment

* **Node.js:** v18.18.0 or higher (v20+ recommended)
* **Package Manager:** `npm` (v9 or v10)
* **Git:** Installed
* **Database:** Supabase PostgreSQL project (or local in-memory fallback)

---

## 3. Step-by-Step Local Setup

### Step 1: Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd OrderSaathi
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` in your text editor and configure the variable names (see Section 5 below).

### Step 4: Run the Automated Test Suite
Verify that all unit tests, schemes, exports, AI parsers, and RBAC security rules pass:
```bash
npm test
```
*Expected result:* 25 passing unit tests across 5 test suites.

### Step 5: Start the Development Server
```bash
npm run dev
```
The application will launch on [http://localhost:3000](http://localhost:3000).

### Step 6: (Alternative) Production Build & Run
To run the optimized production build:
```bash
npm run build
npm start
```

---

## 4. Demo Login Credentials for Reviewers

OrderSaathi includes pre-seeded, realistic business accounts for immediate reviewer evaluation:

### Portal 1: FMCG Order Desk (Distributor Staff)
* **Access URL:** [http://localhost:3000/desk/login](http://localhost:3000/desk/login)
* **Email:** `desk@ordersaathi.demo`
* **Password:** `OrderSaathi@Desk2026`
* **Assigned Role:** `order_desk`
* **User Profile:** Vikram Patel (Senior Order Desk Operator)
* **Workflows to test:**
  * Review live incoming Kirana orders in the review queue.
  * Filter orders by status (*Pending Review*, *On Hold*, *Confirmed*).
  * Approve / Confirm orders and review line items.
  * Resolve credit-related holds with documented reasons.
  * Download Tally-compatible sales voucher CSV export.
  * Inspect the immutable PostgreSQL audit trail.

### Portal 2: Kirana Retailer Portal
* **Access URL:** [http://localhost:3000/retailer/login](http://localhost:3000/retailer/login)
* **Registered Mobile Number:** `+91 98261 12345`
* **Verification OTP:** `123456` *(Pre-populated / displayed on-screen in demo review mode)*
* **Assigned Role:** `retailer`
* **Store Profile:** Mahakaushal Kirana Store (Proprietor: Rajesh Sharma, Lordganj Main Market, Jabalpur)
* **Workflows to test:**
  * Browse FMCG catalogue with live stock cases and individual dealer pricing.
  * Add products to cart and see promotional scheme discounts applied automatically.
  * Test AI Conversational Order Capture with natural voice or Hinglish Kirana text.
  * Submit orders and verify automatic credit-limit validation.
  * View past order history and repeat orders with 1-click.

---

## 5. Required Environment Variables

Below are the required environment variable names. **Never commit actual secret values to the repository.**

```env
# Supabase Database & Auth Configuration
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# AI Provider Configuration
# Supported providers: gemini, openai, anthropic
AI_PROVIDER
GEMINI_API_KEY
OPENAI_API_KEY

# Application Base URL
NEXT_PUBLIC_APP_URL

# Development / Offline Fallback Mode
ENABLE_DEV_FALLBACK
```

---

## 6. Cloud Deployment Architecture (Vercel & Supabase)

OrderSaathi is architected for cloud-native deployment:

1. **Frontend & Serverless Route Handlers:** Hosted on **Vercel** with Next.js App Router edge middleware and Node.js serverless functions.
2. **Database & Storage:** Hosted on **Supabase** (PostgreSQL 15 with Row Level Security, indexing, foreign keys, and triggers).
3. **Continuous Deployment (CI/CD):**
   * Pushes to the `main` branch automatically trigger Vitest unit tests.
   * On passing tests, Vercel initiates an optimized production build (`next build`).
   * Environment variables are injected through Vercel Project Settings.

---

## 7. Database Initialization & Seeding

If deploying to a fresh Supabase project:
1. Open your Supabase SQL Editor.
2. Execute `supabase/migrations/20261102_initial_schema.sql` to establish tables, constraints, indexes, and RLS policies.
3. Execute `supabase/seed.sql` to populate initial FMCG categories, products, schemes, retailers, aliases, and sample orders.

---

## 8. Verification & Sanity Checklist

| Workflow | Path | Success Criteria |
| :--- | :--- | :--- |
| **Desk Sign-In** | `/desk/login` | Authenticates email & password, redirects to `/desk/dashboard`. |
| **Retailer Sign-In** | `/retailer/login` | Validates mobile, verifies 6-digit OTP, redirects to `/retailer/dashboard`. |
| **RBAC Isolation** | `/desk/dashboard` | Unauthenticated visits redirect to `/desk/login`; Retailers blocked from `/desk`. |
| **AI Order Parsing** | `/retailer/ai-order` | HinglishKirana voice/text translates into structured SKU matches with quantity disambiguation. |
| **Scheme Recalculation** | `/retailer/cart` | Free cases (Buy 10 Get 1) and slab discounts (3% off 5+ cases) calculate accurately. |
| **Credit Hold Engine** | `/retailer/cart` | Orders exceeding ₹60,750 available balance trigger automatic `on_hold` status. |
| **Order Confirmation** | `/desk/orders` | Desk approval writes to Supabase, updates retailer balance, and records in `audit_logs`. |
| **Tally CSV Export** | `/desk/exports` | Downloads standard Tally voucher CSV with correct ledger and GST columns. |
