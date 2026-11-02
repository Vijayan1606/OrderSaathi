-- OrderSaathi Database Schema Migration
-- Complete Schema with RLS and Constraints

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('retailer', 'order_desk')),
    mobile_number TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RETAILERS
CREATE TABLE IF NOT EXISTS public.retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Jabalpur',
    state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
    pincode TEXT NOT NULL DEFAULT '482001',
    gst_number TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.product_categories(id),
    brand TEXT NOT NULL,
    packaging TEXT NOT NULL, -- e.g. "Case of 96", "Case of 20"
    pieces_per_case INT NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'case', -- 'case' | 'piece'
    dealer_price NUMERIC(10, 2) NOT NULL, -- per unit/case
    mrp NUMERIC(10, 2) NOT NULL,
    stock_cases INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00, -- 5%, 12%, 18% etc.
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCHEMES
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    scheme_type TEXT NOT NULL CHECK (scheme_type IN ('buy_x_get_y', 'slab_discount')),
    eligible_product_ids UUID[] DEFAULT '{}', -- array of product UUIDs
    min_quantity INT NOT NULL DEFAULT 1,
    free_quantity INT DEFAULT 0, -- for buy_x_get_y
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00, -- for slab_discount
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 year',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RETAILER PRODUCT PRICES (Special Dealer Pricing overrides)
CREATE TABLE IF NOT EXISTS public.retailer_product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    custom_dealer_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(retailer_id, product_id)
);

-- 7. RETAILER PRODUCT ALIASES (Self-learning Hinglish mappings)
CREATE TABLE IF NOT EXISTS public.retailer_product_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(retailer_id, alias)
);

-- 8. CARTS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

-- 10. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'confirmed', 'on_hold', 'rejected', 'processing')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    scheme_discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    free_items_total_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gst_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    credit_limit_at_order NUMERIC(12, 2) NOT NULL,
    outstanding_balance_at_order NUMERIC(12, 2) NOT NULL,
    credit_hold_reason TEXT,
    notes TEXT,
    source TEXT NOT NULL DEFAULT 'web_portal' CHECK (source IN ('web_portal', 'ai_capture')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    free_quantity INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(10, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL,
    gst_amount NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    scheme_id UUID REFERENCES public.schemes(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI EXTRACTIONS
CREATE TABLE IF NOT EXISTS public.ai_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
    raw_input TEXT NOT NULL,
    extracted_data JSONB NOT NULL,
    confidence_score NUMERIC(3, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'accepted', 'corrected', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORDER CORRECTIONS (Audit of edits made by Order Desk)
CREATE TABLE IF NOT EXISTS public.order_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    corrected_by UUID NOT NULL REFERENCES public.profiles(id),
    action_type TEXT NOT NULL, -- e.g. "quantity_change", "status_change", "credit_hold_override"
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EXPORT HISTORY
CREATE TABLE IF NOT EXISTS public.export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exported_by UUID NOT NULL REFERENCES public.profiles(id),
    file_name TEXT NOT NULL,
    order_count INT NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL,
    exported_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_retailers_profile_id ON public.retailers(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON public.orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_aliases_retailer_alias ON public.retailer_product_aliases(retailer_id, alias);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_product_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

-- Helper functions for role checks
CREATE OR REPLACE FUNCTION public.is_order_desk()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'order_desk'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_retailer_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.retailers
    WHERE profile_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES:

-- Categories, Products & Schemes: readable by authenticated users
CREATE POLICY "Categories readable by all authenticated"
    ON public.product_categories FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Products readable by all authenticated"
    ON public.products FOR SELECT
    TO authenticated
    USING (is_active = TRUE OR public.is_order_desk());

CREATE POLICY "Schemes readable by all authenticated"
    ON public.schemes FOR SELECT
    TO authenticated
    USING (is_active = TRUE OR public.is_order_desk());

-- Retailers: Retailers read their own record; Order desk reads all
CREATE POLICY "Retailers can read own record"
    ON public.retailers FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_order_desk());

-- Orders: Retailers read their own orders; Order Desk reads all
CREATE POLICY "Retailers read own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (retailer_id = public.get_retailer_id() OR public.is_order_desk());

CREATE POLICY "Retailers create own orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (retailer_id = public.get_retailer_id());

CREATE POLICY "Order desk updates orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.is_order_desk());

-- Order Items:
CREATE POLICY "Order items readable by owner or order desk"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
        AND (o.retailer_id = public.get_retailer_id() OR public.is_order_desk())
      )
    );
