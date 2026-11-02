// Unified Database Access Layer for OrderSaathi
// Seamlessly interfaces with Supabase and provides local persistence for immediate zero-config execution.

import { createClient } from "@supabase/supabase-js";
import {
  Product,
  Scheme,
  Retailer,
  Order,
  OrderItem,
  RetailerProductAlias,
  AuditLog,
  ExportHistoryRecord,
  OrderStatus,
  Profile,
} from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Initial Seed Dataset (matching Supabase seed.sql and prompt brief)
const INITIAL_PROFILES: Profile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "retailer@ordersaathi.in",
    full_name: "Rajesh Sharma",
    role: "retailer",
    phone: "+91 98261 12345",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "orderdesk@ordersaathi.in",
    full_name: "Vikram Patel",
    role: "order_desk",
    phone: "+91 98261 67890",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_RETAILERS: Retailer[] = [
  {
    id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    profile_id: "11111111-1111-1111-1111-111111111111",
    store_name: "Mahakaushal Kirana Store",
    owner_name: "Rajesh Sharma",
    phone: "+91 98261 12345",
    address: "Shop No. 14, Lordganj Main Market",
    city: "Jabalpur",
    state: "Madhya Pradesh",
    pincode: "482002",
    gst_number: "23AAAFM1234F1Z5",
    credit_limit: 75000.0,
    outstanding_balance: 14250.0,
    available_credit: 60750.0,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "bb222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    profile_id: "33333333-3333-3333-3333-333333333333",
    store_name: "Sharda Provision Stores",
    owner_name: "Sunil Kumar Agrawal",
    phone: "+91 94251 44556",
    address: "Plot 8, Wright Town Stadium Road",
    city: "Jabalpur",
    state: "Madhya Pradesh",
    pincode: "482002",
    gst_number: "23AABCS5678G2Z1",
    credit_limit: 120000.0,
    outstanding_balance: 48900.0,
    available_credit: 71100.0,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

const INITIAL_SCHEMES: Scheme[] = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    name: "Buy 10 Cases Get 1 Free",
    description: "Buy 10 cases of glucose biscuits and receive 1 free case",
    scheme_type: "buy_x_get_y",
    eligible_product_ids: ["p1111111-1111-1111-1111-111111111111"],
    min_quantity: 10,
    free_quantity: 1,
    discount_percentage: 0,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    is_active: true,
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    name: "Bulk Slab Discount: 3% Off 5+ Cases",
    description: "Purchase 5 or more cases of Detergent powder to receive an instant 3% discount",
    scheme_type: "slab_discount",
    eligible_product_ids: ["p2222222-2222-2222-2222-222222222222"],
    min_quantity: 5,
    free_quantity: 0,
    discount_percentage: 3.0,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    is_active: true,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    sku: "SKU-BS-075",
    name: "Glucose biscuit 75 g",
    description: "High energy glucose biscuits fortified with wheat and milk. Fast moving daily staple.",
    category_id: "cat-1",
    brand: "Parle-G / Shakti",
    packaging: "Case of 96",
    pieces_per_case: 96,
    unit: "case",
    dealer_price: 8.1,
    mrp: 10.0,
    stock_cases: 340,
    is_active: true,
    gst_rate: 18.0,
    image_url: "/images/products/glucose-biscuit.jpg",
    active_scheme: INITIAL_SCHEMES[0],
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    sku: "SKU-DT-1KG",
    name: "Detergent powder 1 kg",
    description: "Deep clean formula with active enzyme technology for tough stains and bright whites.",
    category_id: "cat-2",
    brand: "Safed Shine",
    packaging: "Case of 20",
    pieces_per_case: 20,
    unit: "case",
    dealer_price: 101.5,
    mrp: 125.0,
    stock_cases: 85,
    is_active: true,
    gst_rate: 18.0,
    image_url: "/images/products/detergent-powder.jpg",
    active_scheme: INITIAL_SCHEMES[1],
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    sku: "SKU-TE-250",
    name: "Tea leaf 250 g",
    description: "Rich Assam CTC tea blend delivering strong taste and deep aroma for morning kadak chai.",
    category_id: "cat-3",
    brand: "Taj Mahal / Bandhan",
    packaging: "Case of 40",
    pieces_per_case: 40,
    unit: "case",
    dealer_price: 118.0,
    mrp: 145.0,
    stock_cases: 0, // Out of stock per prompt requirement
    is_active: true,
    gst_rate: 5.0,
    image_url: "/images/products/tea-leaf.jpg",
  },
  {
    id: "p4444444-4444-4444-4444-444444444444",
    sku: "SKU-OL-1LT",
    name: "Kacchi Ghani Mustard Oil 1 L",
    description: "Cold pressed pungent mustard oil ideal for traditional cooking, rich in natural antioxidants.",
    category_id: "cat-4",
    brand: "Kisan Shuddh",
    packaging: "Case of 12",
    pieces_per_case: 12,
    unit: "case",
    dealer_price: 142.0,
    mrp: 165.0,
    stock_cases: 120,
    is_active: true,
    gst_rate: 5.0,
    image_url: "/images/products/mustard-oil.jpg",
  },
  {
    id: "p5555555-5555-5555-5555-555555555555",
    sku: "SKU-SP-100",
    name: "Bathing Soap Neem & Tulsi 100 g",
    description: "Grade 1 toilet soap with 76% TFM for deep skin protection and pleasant fragrance.",
    category_id: "cat-2",
    brand: "Ayur Touch",
    packaging: "Case of 72",
    pieces_per_case: 72,
    unit: "case",
    dealer_price: 28.5,
    mrp: 38.0,
    stock_cases: 215,
    is_active: true,
    gst_rate: 18.0,
    image_url: "/images/products/bathing-soap.jpg",
  },
];

const INITIAL_ALIASES: RetailerProductAlias[] = [
  {
    id: "al-1",
    retailer_id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    alias: "biscuit chhota",
    product_id: "p1111111-1111-1111-1111-111111111111",
    confidence: 1.0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "al-2",
    retailer_id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    alias: "washing powder 1 kilo",
    product_id: "p2222222-2222-2222-2222-222222222222",
    confidence: 1.0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "al-3",
    retailer_id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    alias: "chai patti 250 wala",
    product_id: "p3333333-3333-3333-3333-333333333333",
    confidence: 1.0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "o1111111-1111-1111-1111-111111111111",
    order_number: "ORD-202611-001",
    retailer_id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    status: "confirmed",
    subtotal: 81.0,
    scheme_discount_total: 0.0,
    free_items_total_value: 8.1,
    taxable_amount: 81.0,
    gst_total: 14.58,
    grand_total: 95.58,
    credit_limit_at_order: 75000.0,
    outstanding_balance_at_order: 14250.0,
    source: "ai_capture",
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    retailer: INITIAL_RETAILERS[0],
    items: [
      {
        id: "oi-1",
        order_id: "o1111111-1111-1111-1111-111111111111",
        product_id: "p1111111-1111-1111-1111-111111111111",
        quantity: 10,
        free_quantity: 1,
        unit_price: 8.1,
        discount_percentage: 0,
        discount_amount: 0,
        taxable_amount: 81.0,
        gst_rate: 18.0,
        gst_amount: 14.58,
        line_total: 95.58,
        scheme_id: "s1111111-1111-1111-1111-111111111111",
        product: INITIAL_PRODUCTS[0],
      },
    ],
  },
  {
    id: "o2222222-2222-2222-2222-222222222222",
    order_number: "ORD-202611-002",
    retailer_id: "aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    status: "pending_review",
    subtotal: 507.5,
    scheme_discount_total: 15.23,
    free_items_total_value: 0.0,
    taxable_amount: 492.27,
    gst_total: 88.61,
    grand_total: 580.88,
    credit_limit_at_order: 75000.0,
    outstanding_balance_at_order: 14250.0,
    source: "web_portal",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    retailer: INITIAL_RETAILERS[0],
    items: [
      {
        id: "oi-2",
        order_id: "o2222222-2222-2222-2222-222222222222",
        product_id: "p2222222-2222-2222-2222-222222222222",
        quantity: 5,
        free_quantity: 0,
        unit_price: 101.5,
        discount_percentage: 3.0,
        discount_amount: 15.23,
        taxable_amount: 492.27,
        gst_rate: 18.0,
        gst_amount: 88.61,
        line_total: 580.88,
        scheme_id: "s2222222-2222-2222-2222-222222222222",
        product: INITIAL_PRODUCTS[1],
      },
    ],
  },
];

// Persistent In-Memory Data Store (with browser localStorage synchronization where available)
class InMemoryDB {
  products: Product[] = [...INITIAL_PRODUCTS];
  schemes: Scheme[] = [...INITIAL_SCHEMES];
  retailers: Retailer[] = [...INITIAL_RETAILERS];
  profiles: Profile[] = [...INITIAL_PROFILES];
  orders: Order[] = [...INITIAL_ORDERS];
  aliases: RetailerProductAlias[] = [...INITIAL_ALIASES];
  auditLogs: AuditLog[] = [];
  exportHistory: ExportHistoryRecord[] = [
    {
      id: "exp-1",
      file_name: "Tally_Orders_20261101.csv",
      exported_by_name: "Vikram Patel",
      order_count: 14,
      total_value: 148500.0,
      exported_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  currentUserId: string = INITIAL_PROFILES[0].id; // Default to Retailer Rajesh Sharma
  currentRole: "retailer" | "order_desk" = "retailer";

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const savedOrders = localStorage.getItem("ordersaathi_orders");
        if (savedOrders) this.orders = JSON.parse(savedOrders);

        const savedAliases = localStorage.getItem("ordersaathi_aliases");
        if (savedAliases) this.aliases = JSON.parse(savedAliases);

        const savedRole = localStorage.getItem("ordersaathi_role");
        if (savedRole === "order_desk" || savedRole === "retailer") {
          this.currentRole = savedRole;
          this.currentUserId =
            savedRole === "order_desk" ? INITIAL_PROFILES[1].id : INITIAL_PROFILES[0].id;
        }
      } catch (e) {
        console.warn("Storage sync error:", e);
      }
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ordersaathi_orders", JSON.stringify(this.orders));
        localStorage.setItem("ordersaathi_aliases", JSON.stringify(this.aliases));
        localStorage.setItem("ordersaathi_role", this.currentRole);
      } catch (e) {
        console.warn("Storage save error:", e);
      }
    }
  }

  getCurrentUser() {
    const profile =
      this.profiles.find((p) => p.id === this.currentUserId) || this.profiles[0];
    const retailer =
      this.retailers.find((r) => r.profile_id === profile.id) || this.retailers[0];
    return { profile, retailer };
  }

  switchRole(role: "retailer" | "order_desk") {
    this.currentRole = role;
    this.currentUserId =
      role === "order_desk" ? INITIAL_PROFILES[1].id : INITIAL_PROFILES[0].id;
    this.persist();
  }

  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getSchemes(): Promise<Scheme[]> {
    return this.schemes;
  }

  async getRetailer(id: string): Promise<Retailer | undefined> {
    return this.retailers.find((r) => r.id === id);
  }

  async getRetailerByProfileId(profileId: string): Promise<Retailer | undefined> {
    return this.retailers.find((r) => r.profile_id === profileId);
  }

  async getRetailerAliases(retailerId: string): Promise<RetailerProductAlias[]> {
    return this.aliases.filter((a) => a.retailer_id === retailerId);
  }

  async addRetailerAlias(
    retailerId: string,
    alias: string,
    productId: string
  ): Promise<RetailerProductAlias> {
    const existing = this.aliases.find(
      (a) => a.retailer_id === retailerId && a.alias.toLowerCase() === alias.toLowerCase().trim()
    );
    if (existing) {
      existing.product_id = productId;
      existing.updated_at = new Date().toISOString();
      this.persist();
      return existing;
    }

    const newAlias: RetailerProductAlias = {
      id: `al-${Date.now()}`,
      retailer_id: retailerId,
      alias: alias.trim(),
      product_id: productId,
      confidence: 1.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.aliases.push(newAlias);
    this.persist();
    return newAlias;
  }

  async getOrders(filters?: { retailerId?: string; status?: OrderStatus }): Promise<Order[]> {
    let result = [...this.orders];
    if (filters?.retailerId) {
      result = result.filter((o) => o.retailer_id === filters.retailerId);
    }
    if (filters?.status) {
      result = result.filter((o) => o.status === filters.status);
    }
    // Return newest first
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.find((o) => o.id === id);
  }

  async createOrder(
    orderData: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">,
    items: Omit<OrderItem, "id" | "order_id">[]
  ): Promise<Order> {
    const orderId = `o-${Date.now()}`;
    const orderNumber = `ORD-202611-${String(this.orders.length + 1).padStart(3, "0")}`;

    const retailer = await this.getRetailer(orderData.retailer_id);

    // Business Rule: Check Credit Limit
    // If order total exceeds available credit -> status is placed On Hold
    const availableCredit = retailer
      ? retailer.credit_limit - retailer.outstanding_balance
      : 50000;
    
    let initialStatus: OrderStatus = orderData.status ?? "pending_review";
    let creditHoldReason: string | undefined = undefined;

    if (orderData.grand_total > availableCredit) {
      initialStatus = "on_hold";
      creditHoldReason = `Credit limit exceeded. Order amount ₹${orderData.grand_total.toFixed(
        2
      )} exceeds available credit ₹${availableCredit.toFixed(2)}. Requires Order Desk approval.`;
    }

    const newOrderItems: OrderItem[] = items.map((it, idx) => ({
      ...it,
      id: `oi-${Date.now()}-${idx}`,
      order_id: orderId,
      product: this.products.find((p) => p.id === it.product_id),
    }));

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      order_number: orderNumber,
      status: initialStatus,
      credit_hold_reason: creditHoldReason,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retailer: retailer,
      items: newOrderItems,
      corrections: [],
    };

    this.orders.unshift(newOrder);

    // Update retailer balance if confirmed
    if (retailer && initialStatus === "confirmed") {
      retailer.outstanding_balance += newOrder.grand_total;
    }

    this.recordAuditLog({
      action: "order_created",
      entity_type: "order",
      entity_id: orderId,
      details: {
        order_number: orderNumber,
        grand_total: newOrder.grand_total,
        status: initialStatus,
        source: newOrder.source,
      },
    });

    this.persist();
    return newOrder;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    reviewerId: string,
    reason?: string
  ): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = newStatus;
    order.reviewed_by = reviewerId;
    order.reviewed_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    const correction = {
      id: `corr-${Date.now()}`,
      order_id: orderId,
      corrected_by: reviewerId,
      action_type: `status_changed_to_${newStatus}`,
      old_data: { status: oldStatus },
      new_data: { status: newStatus },
      reason: reason || `Status updated to ${newStatus} by Order Desk.`,
      created_at: new Date().toISOString(),
      reviewer_name: "Vikram Patel",
    };

    if (!order.corrections) order.corrections = [];
    order.corrections.push(correction);

    this.recordAuditLog({
      action: "order_status_update",
      entity_type: "order",
      entity_id: orderId,
      details: { old_status: oldStatus, new_status: newStatus, reason },
    });

    this.persist();
    return order;
  }

  async recordAuditLog(
    log: Omit<AuditLog, "id" | "created_at">
  ): Promise<AuditLog> {
    const audit: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(audit);
    return audit;
  }

  async getAuditLogs(orderId?: string): Promise<AuditLog[]> {
    if (orderId) {
      return this.auditLogs.filter((l) => l.entity_id === orderId);
    }
    return this.auditLogs;
  }

  async getExportHistory(): Promise<ExportHistoryRecord[]> {
    return this.exportHistory;
  }

  async recordExport(
    record: Omit<ExportHistoryRecord, "id" | "exported_at">
  ): Promise<ExportHistoryRecord> {
    const newRecord: ExportHistoryRecord = {
      ...record,
      id: `exp-${Date.now()}`,
      exported_at: new Date().toISOString(),
    };
    this.exportHistory.unshift(newRecord);
    return newRecord;
  }
}

export const db = new InMemoryDB();
