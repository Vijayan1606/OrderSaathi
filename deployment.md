# Deployment & Operations Guide: OrderSaathi

This guide provides end-to-end instructions for deploying and running OrderSaathi in both local development and cloud production environments.

---

## 1. Prerequisites

- **Node.js**: v18.18.0 or higher (Node v20/v22 LTS recommended)
- **Package Manager**: npm v9+ or pnpm
- **Git**: Installed and configured
- **Database (Optional for production)**: Supabase PostgreSQL instance

---

## 2. Environment Configuration

1. Copy the example environment template:
```bash
cp .env.example .env.local
```

2. Environment Variables Reference:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider Configuration (Optional: built-in Hinglish NLP runs out-of-the-box)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Zero-Config Demo Mode: Enables built-in persistent store with Jabalpur seed data
ENABLE_DEV_FALLBACK=true
```

> **Note on Zero-Config Execution:** If Supabase keys are not supplied, OrderSaathi seamlessly activates its built-in in-memory / persistent database seeded with the exact catalogue records and test retailers from the brief.

---

## 3. Database Migration & Seeding (For Live Supabase)

If deploying to a live Supabase project:

1. **Execute Schema Migration:**
   Open the Supabase SQL Editor and execute the contents of:
   `supabase/migrations/20261102_initial_schema.sql`

2. **Execute Seed Data:**
   In the SQL Editor, execute the contents of:
   `supabase/seed.sql`

This creates all 15 relational tables, indexes, Row Level Security policies, and seeds the brief-mandated products:
- `SKU-BS-075` (Glucose biscuit 75 g — ₹8.10 — Buy 10 Get 1 Free)
- `SKU-DT-1KG` (Detergent powder 1 kg — ₹101.50 — 3% Off 5+ Cases)
- `SKU-TE-250` (Tea leaf 250 g — ₹118.00 — 0 Stock / Out of Stock)

---

## 4. Local Build & Startup

```bash
# 1. Install dependencies
npm install

# 2. Run test suites to verify arithmetic & scheme logic
npm test

# 3. Create production build
npm run build

# 4. Start local production server
npm start
```

The application is now running at `http://localhost:3000`.

---

## 5. Demo Personas & Fast Role Switching

OrderSaathi includes a convenient **Role Switcher** in the top navigation header bar to effortlessly switch between portals:

### A. Retailer Persona
- **Name:** Rajesh Sharma
- **Store:** Mahakaushal Kirana Store (Lordganj, Jabalpur)
- **Credit Limit:** ₹75,000.00
- **Outstanding:** ₹14,250.00
- **Available Credit:** ₹60,750.00

### B. Order Desk Persona
- **Name:** Vikram Patel
- **Title:** Distribution Operations Manager
- **Desk:** Jabalpur FMCG Dispatch Control Desk

---

## 6. Vercel Production Deployment

To deploy OrderSaathi to Vercel:

1. Push your repository to GitHub.
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `OrderSaathi` repository.
4. Set the Build Command to `npm run build` and Output Directory to `.next`.
5. In **Environment Variables**, add the keys defined in `.env.example`.
6. Click **Deploy**.
