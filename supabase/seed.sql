-- Seed Data for OrderSaathi
-- Contains the exact brief-required catalogue items, realistic Jabalpur kirana shops, and demo profiles

-- 1. Profiles for Demo
-- Retailer Demo Account
INSERT INTO public.profiles (id, email, full_name, role, phone)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'retailer@ordersaathi.in', 'Rajesh Sharma', 'retailer', '+91 98261 12345'),
  ('22222222-2222-2222-2222-222222222222', 'orderdesk@ordersaathi.in', 'Vikram Patel', 'order_desk', '+91 98261 67890'),
  ('33333333-3333-3333-3333-333333333333', 'sharda@ordersaathi.in', 'Sunil Kumar Agrawal', 'retailer', '+91 94251 44556')
ON CONFLICT (id) DO NOTHING;

-- 2. Retailer Records (Jabalpur kirana stores)
INSERT INTO public.retailers (id, profile_id, store_name, owner_name, phone, address, city, state, pincode, gst_number, credit_limit, outstanding_balance, is_active)
VALUES
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Mahakaushal Kirana Store', 'Rajesh Sharma', '+91 98261 12345', 'Shop No. 14, Lordganj Main Market', 'Jabalpur', 'Madhya Pradesh', '482002', '23AAAFM1234F1Z5', 75000.00, 14250.00, TRUE),
  ('bb222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'Sharda Provision Stores', 'Sunil Kumar Agrawal', '+91 94251 44556', 'Plot 8, Wright Town Stadium Road', 'Jabalpur', 'Madhya Pradesh', '482002', '23AABCS5678G2Z1', 120000.00, 48900.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Product Categories
INSERT INTO public.product_categories (id, name, slug, description, display_order)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Packaged Food & Biscuits', 'packaged-food', 'Biscuits, snacks, breakfast foods and confectionery', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Home Care & Cleaning', 'home-care', 'Detergent powders, soaps, disinfectants and surface cleaners', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Beverages & Tea', 'beverages', 'Premium CTC tea, leaf tea, coffee and instant mixes', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Staples & Edible Oils', 'staples', 'Packaged mustard oil, refined oils, and daily essentials', 4)
ON CONFLICT (id) DO NOTHING;

-- 4. Products (Including the Mandatory Brief Products)
-- Product 1: Glucose biscuit 75 g (SKU-BS-075)
-- Product 2: Detergent powder 1 kg (SKU-DT-1KG)
-- Product 3: Tea leaf 250 g (SKU-TE-250)
INSERT INTO public.products (id, sku, name, description, category_id, brand, packaging, pieces_per_case, unit, dealer_price, mrp, stock_cases, is_active, gst_rate, image_url)
VALUES
  (
    'p1111111-1111-1111-1111-111111111111',
    'SKU-BS-075',
    'Glucose biscuit 75 g',
    'High energy glucose biscuits fortified with wheat and milk. Fast moving daily staple.',
    'c1111111-1111-1111-1111-111111111111',
    'Parle-G / Shakti',
    'Case of 96',
    96,
    'case',
    8.10,
    10.00,
    340,
    TRUE,
    18.00,
    '/images/products/glucose-biscuit.jpg'
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'SKU-DT-1KG',
    'Detergent powder 1 kg',
    'Deep clean formula with active enzyme technology for tough stains and bright whites.',
    'c2222222-2222-2222-2222-222222222222',
    'Safed Shine',
    'Case of 20',
    20,
    'case',
    101.50,
    125.00,
    85,
    TRUE,
    18.00,
    '/images/products/detergent-powder.jpg'
  ),
  (
    'p3333333-3333-3333-3333-333333333333',
    'SKU-TE-250',
    'Tea leaf 250 g',
    'Rich Assam CTC tea blend delivering strong taste and deep aroma for morning kadak chai.',
    'c3333333-3333-3333-3333-333333333333',
    'Taj Mahal / Bandhan',
    'Case of 40',
    40,
    'case',
    118.00,
    145.00,
    0, -- Out of stock per prompt requirement
    TRUE,
    5.00,
    '/images/products/tea-leaf.jpg'
  ),
  (
    'p4444444-4444-4444-4444-444444444444',
    'SKU-OL-1LT',
    'Kacchi Ghani Mustard Oil 1 L',
    'Cold pressed pungent mustard oil ideal for traditional cooking, rich in natural antioxidants.',
    'c4444444-4444-4444-4444-444444444444',
    'Kisan Shuddh',
    'Case of 12',
    12,
    'case',
    142.00,
    165.00,
    120,
    TRUE,
    5.00,
    '/images/products/mustard-oil.jpg'
  ),
  (
    'p5555555-5555-5555-5555-555555555555',
    'SKU-SP-100',
    'Bathing Soap Neem & Tulsi 100 g',
    'Grade 1 toilet soap with 76% TFM for deep skin protection and pleasant fragrance.',
    'c2222222-2222-2222-2222-222222222222',
    'Ayur Touch',
    'Case of 72',
    72,
    'case',
    28.50,
    38.00,
    215,
    TRUE,
    18.00,
    '/images/products/bathing-soap.jpg'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Schemes (Exact from Prompt)
-- Scheme 1: Buy 10 cases of Glucose Biscuit, get 1 free case
-- Scheme 2: 3% off 5 or more cases of Detergent Powder
INSERT INTO public.schemes (id, name, description, scheme_type, eligible_product_ids, min_quantity, free_quantity, discount_percentage, start_date, end_date, is_active)
VALUES
  (
    's1111111-1111-1111-1111-111111111111',
    'Buy 10 Cases Get 1 Free',
    'Order 10 or more cases of Glucose biscuit 75 g and get 1 free case for every 10 cases ordered.',
    'buy_x_get_y',
    ARRAY['p1111111-1111-1111-1111-111111111111']::UUID[],
    10,
    1,
    0.00,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '180 days',
    TRUE
  ),
  (
    's2222222-2222-2222-2222-222222222222',
    'Bulk Slab Discount: 3% Off 5+ Cases',
    'Purchase 5 or more cases of Detergent powder 1 kg to receive an instant 3% trade discount on the total item value.',
    'slab_discount',
    ARRAY['p2222222-2222-2222-2222-222222222222']::UUID[],
    5,
    0,
    3.00,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '180 days',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Retailer Product Aliases (Common Hinglish terms spoken in Jabalpur/MP kirana trade)
INSERT INTO public.retailer_product_aliases (retailer_id, alias, product_id, confidence)
VALUES
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'biscuit chhota', 'p1111111-1111-1111-1111-111111111111', 1.00),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'glucose biscuit', 'p1111111-1111-1111-1111-111111111111', 1.00),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'washing powder 1 kilo', 'p2222222-2222-2222-2222-222222222222', 1.00),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'detergent 1kg', 'p2222222-2222-2222-2222-222222222222', 1.00),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'chai patti 250 wala', 'p3333333-3333-3333-3333-333333333333', 1.00),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'chai patti', 'p3333333-3333-3333-3333-333333333333', 0.95),
  ('aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sarso tel 1 litre', 'p4444444-4444-4444-4444-444444444444', 1.00)
ON CONFLICT DO NOTHING;

-- 7. Sample Initial Orders
INSERT INTO public.orders (
  id, order_number, retailer_id, status, subtotal, scheme_discount_total,
  free_items_total_value, taxable_amount, gst_total, grand_total,
  credit_limit_at_order, outstanding_balance_at_order, source, created_at
)
VALUES
  (
    'o1111111-1111-1111-1111-111111111111',
    'ORD-202611-001',
    'aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'confirmed',
    81.00,
    0.00,
    8.10,
    81.00,
    14.58,
    95.58,
    75000.00,
    14250.00,
    'ai_capture',
    NOW() - INTERVAL '2 days'
  ),
  (
    'o2222222-2222-2222-2222-222222222222',
    'ORD-202611-002',
    'aa111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'pending_review',
    507.50,
    15.23,
    0.00,
    492.27,
    88.61,
    580.88,
    75000.00,
    14250.00,
    'web_portal',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;
