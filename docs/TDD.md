# Technical Design Document (TDD): OrderSaathi

**Product Name:** OrderSaathi  
**Tagline:** Smarter Orders. Faster Distribution.  
**Domain:** B2B FMCG Distribution & Retailer Ordering Platform  
**Target Market:** Regional FMCG Distributors, Wholesalers, Sales Representatives, and Kirana Shopkeepers in India (Jabalpur, MP)  

---

## 1. Executive Summary & Problem Context

Our client is a high-volume FMCG distributor operating out of Jabalpur, Madhya Pradesh, distributing 4 packaged food and home-care brand lines to approximately 1,800 kirana shops. The business processes ~600 orders daily across 18 beat sales representatives with an annual turnover of ₹85–100 crore.

### Core Operational Bottlenecks
1. **Unstructured Communication Channels:** Kirana store owners send orders through WhatsApp messages, handwritten notes, photo snaps, and Hinglish voice notes.
2. **Order Discrepancies:** Ambiguity around packaging units (packets vs cases) and colloquial item names causes high return rates and redelivery costs.
3. **Double Entry Overhead:** Back-office clerks manually transcribe handwritten order registers into Tally ERP, introducing billing delays.
4. **Opaque Trade Schemes:** Retailers cannot reliably see active manufacturer schemes (e.g. "Buy 10 get 1 free" or percentage slab discounts) or their current credit balance.

### Solution Architecture
OrderSaathi provides a dual-portal web application:
- A high-speed, mobile-responsive **Retailer Portal** featuring conversational AI order capture and live distributor pricing.
- An operational **Order Desk Portal** for distributor staff to review orders, resolve credit holds, and export structured batches to Tally.

---

## 2. System Architecture

OrderSaathi uses Next.js 14 App Router with server-first business logic, structured API route handlers, and a PostgreSQL/Supabase data model with complete Row Level Security (RLS).

```
                      ┌───────────────────────────────────────┐
                      │          OrderSaathi Client           │
                      │  (Next.js App Router / React / TS)    │
                      └───────┬───────────────────────┬───────┘
                              │                       │
               Retailer Portal│                       │Order Desk Portal
                              ▼                       ▼
                      ┌───────────────────────────────────────┐
                      │          Next.js Route Handlers       │
                      │               (/api/*)                │
                      └───┬──────────────┬─────────────┬──────┘
                          │              │             │
        Promotional Scheme│    AI NLP    │             │Accounting
        Calculation Engine│  Extractor   │             │CSV Engine
                          ▼              ▼             ▼
                      ┌───────────────────────────────────────┐
                      │         Server Business Core          │
                      │ - calculateOrderSchemes()             │
                      │ - extractOrderFromText()              │
                      │ - Credit Hold Evaluation              │
                      │ - generateTallyCSV()                  │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │        Data & Storage Tier            │
                      │ - Supabase / PostgreSQL               │
                      │ - Row Level Security (RLS)            │
                      │ - Unified InMemoryDB Fallback Store   │
                      └───────────────────────────────────────┘
```

---

## 3. Technology Choices & Rationale

| Layer | Technology | Decision Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 App Router** | Unified React Server Components, server actions, dynamic routing, and fast cold-start performance on slow 4G networks. |
| **Language** | **TypeScript (Strict)** | Eliminates runtime type errors across complex order lines, decimal financial calculations, and promotional schemes. |
| **Styling** | **Tailwind CSS** | Atomic styling ensuring small production bundle sizes (<90 KB shared JS) and custom visual tokens for Indian FMCG commerce. |
| **Data Validation** | **Zod** | Runtime contract verification for all external LLM responses and client submission payloads. |
| **Database** | **PostgreSQL (Supabase)** | Relational integrity, foreign key cascading, transactional consistency, and native Row Level Security (RLS). |
| **Testing** | **Vitest & JSDOM** | Sub-second test execution speeds for complex arithmetic and scheme validation suites. |

---

## 4. Database Design & Entity Architecture

The schema comprises 15 relational tables defined in `supabase/migrations/20261102_initial_schema.sql`:

1. `profiles`: User identity linked to Supabase Auth (`id`, `email`, `full_name`, `role: 'retailer' | 'order_desk'`, `phone`).
2. `retailers`: Store metadata (`id`, `profile_id`, `store_name`, `credit_limit`, `outstanding_balance`, `gst_number`, `city`, `pincode`).
3. `product_categories`: Categorization (`id`, `name`, `slug`, `display_order`).
4. `products`: Catalogue records (`id`, `sku`, `name`, `packaging`, `pieces_per_case`, `dealer_price`, `stock_cases`, `gst_rate`).
5. `schemes`: Active promotional rules (`id`, `scheme_type: 'buy_x_get_y' | 'slab_discount'`, `min_quantity`, `free_quantity`, `discount_percentage`, validity dates).
6. `retailer_product_prices`: Personalized dealer price overrides.
7. `retailer_product_aliases`: Self-learned Hinglish trade keywords mapped per retailer.
8. `carts` & `cart_items`: Active retailer shopping basket.
9. `orders`: High-level order record (`order_number`, `retailer_id`, `status`, `subtotal`, `scheme_discount_total`, `free_items_total_value`, `taxable_amount`, `gst_total`, `grand_total`, `credit_hold_reason`, `source`).
10. `order_items`: Line items with explicit `free_quantity`, `unit_price`, `discount_amount`, `taxable_amount`, and `gst_amount`.
11. `ai_extractions`: Raw message capture log with confidence scores and status.
12. `order_corrections`: Audit log of edits made during Order Desk review.
13. `audit_logs`: Immutable action trail for security compliance.
14. `export_history`: Log of Tally CSV export runs.

---

## 5. Promotional Scheme Engine Architecture

The scheme engine (`src/lib/schemes/engine.ts`) is a pure server-side deterministic module.

### Core Principles
1. **Free Item Accounting:** Free items earned under Buy X Get Y Free schemes (e.g. 10 cases of Glucose Biscuit = 1 free case) are tracked with their nominal wholesale value for stock tracking, but are **never added to the customer's taxable subtotal or payable amount**.
2. **Slab Percentage Discounts:** Applied strictly when item quantity satisfies the threshold (e.g. 5+ cases of Detergent Powder receives a 3% discount).
3. **GST Calculation:** Calculated on the net taxable amount (`base_amount - discount_amount`).
4. **Double Rounding Protection:** Uses `Math.round((amount + Number.EPSILON) * 100) / 100` to prevent floating-point cent drift.
5. **Mandatory Server Recalculation:** Client-submitted prices are discarded; the server always recalculates using live database rates.

---

## 6. AI Order Capture & Natural Language Processing

### Pipeline Flow
1. **Input Normalization:** Splits input text across conversational conjunctions (`aur`, `and`, `,`, `+`, `\n`).
2. **Quantity & Variant Extraction:** Distinguishes size/pack descriptors (e.g. `250 wala`, `1 kilo`, `100g`) from order quantities (e.g. `1 peti`, `5 peti`).
3. **Unit Ambiguity Detection:** Recognizes regional wholesale terms (`peti`, `dabba`, `case`) as definitive wholesale cases. Flags consumer units (`packet`, `pouch`, `piece`) as ambiguous, prompting the retailer to clarify before ordering.
4. **Alias Resolution:** Queries `retailer_product_aliases` before falling back to catalogue token matching.
5. **Confidence Scoring:** High (>85%), Medium (60–85%), Low (<60%). Low or ambiguous items require manual confirmation.
6. **Self-Learning Feedback Loop:** Any manual corrections made by the retailer can be saved via `POST /api/retailer/aliases`, enriching future accuracy.

---

## 7. Security & Role-Based Access Control (RBAC)

1. **Role Enforcement:** Strict separation between `retailer` and `order_desk`.
2. **Price Protection:** Retailers cannot inspect another store's prices or order history.
3. **Credit Guardrail:** Credit hold logic is enforced server-side; retailers cannot override hold statuses.
4. **Environment Isolation:** Service-role keys and LLM API credentials reside exclusively on the server and are never bundled into client JS.

---

## 8. Assumptions & Limitations

- **Assumptions:** The current deployment focuses on wholesale cases as the primary stock keeping unit (SKU), with piece-level conversions handled via packaging case multipliers.
- **Limitations:** Real-time Tally synchronization currently utilizes standard CSV export rather than direct Tally XML HTTP server integration.
- **Future Improvements:** Voice-to-text audio streaming via WebSockets, multi-distributor federation, and WhatsApp Cloud API webhook listeners.
