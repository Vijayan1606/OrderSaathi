// TypeScript Definitions for OrderSaathi FMCG Platform

export type UserRole = "retailer" | "order_desk";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Retailer {
  id: string;
  profile_id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number?: string;
  credit_limit: number;
  outstanding_balance: number;
  available_credit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  brand: string;
  packaging: string; // e.g. "Case of 96", "Case of 20"
  pieces_per_case: number;
  unit: "case" | "piece";
  dealer_price: number; // in INR
  mrp: number; // Maximum Retail Price
  stock_cases: number;
  is_active: boolean;
  gst_rate: number; // e.g. 5, 12, 18
  image_url?: string;
  active_scheme?: Scheme;
  custom_dealer_price?: number;
}

export type SchemeType = "buy_x_get_y" | "slab_discount";

export interface Scheme {
  id: string;
  name: string;
  description: string;
  scheme_type: SchemeType;
  eligible_product_ids: string[];
  min_quantity: number;
  free_quantity: number; // For buy_x_get_y
  discount_percentage: number; // For slab_discount
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface SchemeCalculationItem {
  product: Product;
  quantity: number; // ordered quantity
  unit_price: number; // dealer price applied
  base_amount: number; // quantity * unit_price
  free_quantity: number; // free cases awarded
  discount_percentage: number; // slab discount percentage
  discount_amount: number; // in INR
  taxable_amount: number; // base_amount - discount_amount
  gst_rate: number; // %
  gst_amount: number; // taxable_amount * (gst_rate / 100)
  line_total: number; // taxable_amount + gst_amount
  free_item_value: number; // free_quantity * unit_price (not added to total!)
  applied_scheme?: Scheme;
  scheme_notes?: string;
}

export interface SchemeCalculationResult {
  items: SchemeCalculationItem[];
  subtotal: number; // sum of base_amounts
  total_discount: number; // sum of scheme discounts
  total_taxable: number;
  total_gst: number;
  grand_total: number; // total_taxable + total_gst
  total_free_value: number;
  total_free_items_count: number;
  schemes_applied: {
    scheme_id: string;
    scheme_name: string;
    description: string;
    benefit_description: string;
  }[];
}

export type OrderStatus =
  | "pending_review"
  | "confirmed"
  | "on_hold"
  | "rejected"
  | "processing";

export type OrderSource = "web_portal" | "ai_capture";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  free_quantity: number;
  unit_price: number;
  discount_percentage: number;
  discount_amount: number;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  line_total: number;
  scheme_id?: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  retailer_id: string;
  status: OrderStatus;
  subtotal: number;
  scheme_discount_total: number;
  free_items_total_value: number;
  taxable_amount: number;
  gst_total: number;
  grand_total: number;
  credit_limit_at_order: number;
  outstanding_balance_at_order: number;
  credit_hold_reason?: string;
  notes?: string;
  source: OrderSource;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  retailer?: Retailer;
  items?: OrderItem[];
  corrections?: OrderCorrection[];
}

export interface OrderCorrection {
  id: string;
  order_id: string;
  corrected_by: string;
  action_type: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  reason?: string;
  created_at: string;
  reviewer_name?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface RetailerProductAlias {
  id: string;
  retailer_id: string;
  alias: string;
  product_id: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface AIExtractedLineItem {
  id: string;
  raw_segment: string;
  matched_product_id?: string;
  matched_product_name?: string;
  sku?: string;
  quantity: number;
  unit: "case" | "piece";
  confidence_level: "high" | "medium" | "low";
  confidence_score: number; // 0.0 to 1.0
  alternatives: {
    product_id: string;
    sku: string;
    name: string;
  }[];
  requires_unit_clarification: boolean;
  unit_clarification_message?: string;
  is_out_of_stock?: boolean;
  error_message?: string;
  notes?: string;
}

export interface AIExtractionResponse {
  raw_input: string;
  items: AIExtractedLineItem[];
  overall_confidence: number;
  has_ambiguous_units: boolean;
  has_unmatched_items: boolean;
  processing_stages: {
    stage: string;
    description: string;
    completed: boolean;
  }[];
}

export interface ExportHistoryRecord {
  id: string;
  file_name: string;
  exported_by_name: string;
  order_count: number;
  total_value: number;
  exported_at: string;
}
