# OrderSaathi — Smarter Orders. Faster Distribution.

**OrderSaathi** is a production-grade, AI-powered B2B FMCG distribution and retailer ordering platform engineered specifically for regional Indian FMCG distributors, wholesale operations, sales representatives, and kirana shopkeepers.

Designed around real-world distribution operations in **Jabalpur, Madhya Pradesh**, OrderSaathi eliminates error-prone WhatsApp ordering, chaotic handwritten slips, and manual Tally re-entry with a unified digital ordering portal, server-side promotional scheme engine, and conversational AI order capture.

---

## 🌟 Key Product Capabilities

### 1. Dual-Portal Role Architecture
- **Retailer Experience**: Mobile-first, fast commerce workspace with personalized dealer trade pricing, live Jabalpur warehouse stock, active schemes, credit line monitoring, and 1-click reorders.
- **Order Desk Experience**: Desktop-first operations control room for distributor office staff to review incoming orders, inspect AI transcription fidelity, authorize or override credit holds, and export batches directly to Tally.

### 2. Signature Feature: AI Natural Language Order Capture
- Handles informal Kirana phone messages, voice transcripts, and Hinglish trade slang:
  > *"Bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti."*
- **Structured Extraction Pipeline**:
  - Segment tokenization and Hinglish numeral translation (`paanch`, `do`, `10`).
  - Distinguishes product variant descriptors (`250 wala`, `1 kilo`) from actual order quantities (`1 peti`, `5 peti`).
  - Unit ambiguity detection: flags whether Kirana said packets vs wholesale cases.
  - Multi-tiered confidence scoring (High / Medium / Low).
  - Out-of-stock inventory warning badges (e.g. Tea Leaf 250 g).
  - **Self-Learning Retailer Aliases**: Stores corrected aliases against the retailer (`retailer_product_aliases`) for continuous accuracy improvements.
  - **Human-in-the-Loop Confirmation**: The AI *never* directly creates an order without shopkeeper verification.

### 3. Server-Side Promotional Scheme Calculation Engine
- Reusable, deterministic promotional engine executing purely on the backend:
  - **Buy X Get Y Free**: e.g., Buy 10 cases of Glucose Biscuit 75 g and receive 1 free case (`Math.floor(qty / 10) * 1`). Free cases are explicitly logged, never charged to the retailer, and excluded from tax bases.
  - **Percentage Slab Discounts**: e.g., 3% trade discount on 5 or more cases of Detergent Powder 1 kg.
  - **Strict Server Recalculation**: The backend recalculates item base prices, discounts, taxable amounts, and GST before persisting orders. Frontend totals are never blindly trusted.

### 4. Credit Hold & Operational Authorization
- Every kirana store has a sanctioned **Credit Limit** and an active **Outstanding Balance**.
- If an order's recalculated grand total exceeds the retailer's available credit line (`credit_limit - outstanding_balance`), the system automatically flags the order as **On Hold** with an explicit reason.
- Order Desk agents can inspect the store's credit history and provide authorized overrides with audit log notes.

### 5. Tally-Compatible CSV Export
- Generates standardized CSV vouchers adhering to Tally accounting requirements.
- Strictly excludes unapproved or on-hold orders from being exported.
- Comprehensive column schema: Order ID, Date, Retailer ID, Retailer Name, GSTIN, SKU Code, Product Name, Cases, Free Quantity, Dealer Price, Scheme Discount, Taxable Amount, GST Rate, GST Amount, Total Amount.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v20/v22)
- npm v9+

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run automated tests (17 tests across 4 test suites)
npm test

# 3. Build production bundle
npm run build

# 4. Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Personas & Credentials

The platform features a zero-friction **Live Mode Switcher** in the top navigation bar to toggle between roles instantly:

| Role | Name & Details | Capabilities |
| :--- | :--- | :--- |
| **Retailer** | **Rajesh Sharma**<br>*Mahakaushal Kirana Store, Jabalpur*<br>Credit Limit: ₹75,000 \| Avail: ₹60,750 | Browse wholesale catalogue, AI order entry, test scheme calculations, view credit health, place orders. |
| **Order Desk** | **Vikram Patel**<br>*Jabalpur FMCG Operations Control Desk* | Review incoming queue, authorize credit hold overrides, inspect audit logs, export confirmed orders to Tally CSV. |

---

## 🛠 Technology Stack

- **Framework**: Next.js 14 App Router (React 18, TypeScript)
- **Styling & UI**: Tailwind CSS, Lucide React icons, purposeful motion
- **Validation**: Zod schema validation for API inputs and AI outputs
- **Forms & State**: React Context (`CartContext`, `AuthContext`) with localStorage persistence
- **Database**: PostgreSQL / Supabase with comprehensive migrations (`supabase/migrations/`) and seed data (`supabase/seed.sql`)
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 🧪 Automated Testing

OrderSaathi includes 17 automated tests covering the critical business logic:

```bash
npm test
```

Test Suites:
1. `tests/unit/schemes.test.ts`: Buy 10 get 1 free, Buy 20 get 2 free, Buy 9 get 0 free, 5 detergent 3% slab discount, 4 detergent 0% discount, expired schemes, invalid quantities, multi-scheme order.
2. `tests/unit/ai-extractor.test.ts`: Conversational parsing, Hinglish phrase extraction, packet vs case ambiguity, out-of-stock detection, Hindi numerals.
3. `tests/unit/orders.test.ts`: Automatic credit hold triggers, Order Desk authorization overrides, retailer alias learning.
4. `tests/unit/tally-export.test.ts`: Confirmed order export formatting, strict exclusion of unapproved/hold orders.

---

## 📁 Repository Structure

```
OrderSaathi/
├── docs/
│   └── TDD.md                     # Technical Design Document
├── deployment.md                  # Deployment & setup guide
├── supabase/
│   ├── migrations/                # Database DDL with RLS policies
│   └── seed.sql                   # FMCG catalogue & Jabalpur Kirana seed data
├── src/
│   ├── app/
│   │   ├── (retailer)/
│   │   │   ├── page.tsx           # Retailer Dashboard
│   │   │   ├── catalogue/         # Live Product Catalogue
│   │   │   ├── ai-order/          # AI Natural Language Order Capture
│   │   │   ├── cart/              # Shopping Basket & Scheme Calculations
│   │   │   └── orders/            # Order History & 1-Click Reorder
│   │   ├── order-desk/
│   │   │   ├── page.tsx           # Operational Dashboard
│   │   │   ├── orders/            # Order Review & Authorization Workspace
│   │   │   └── export/            # Tally CSV Export Center
│   │   └── api/
│   │       ├── ai/extract/        # AI Natural Language Order Endpoint
│   │       ├── orders/            # Order Creation & List API
│   │       ├── orders/[id]/status # Order Status & Approval Endpoint
│   │       ├── orders/export/     # Tally CSV Download API
│   │       ├── products/          # Product Catalogue API
│   │       └── retailer/aliases/  # Self-learning Alias Storage API
│   ├── components/
│   │   └── layout/                # Navbar, Footer, UI components
│   ├── lib/
│   │   ├── ai/                    # Natural language extraction engine
│   │   ├── auth/                  # Role & session management
│   │   ├── cart/                  # Client-side basket & calculation hook
│   │   ├── db/                    # Unified database persistence layer
│   │   ├── export/                # Tally CSV formatter
│   │   └── schemes/               # Server promotional scheme engine
│   └── types/                     # TypeScript domain models
└── tests/
    └── unit/                      # Automated Vitest test suites
```
