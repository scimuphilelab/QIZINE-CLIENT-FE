-- ============================================================================
-- QR-ORDER SAAS: PRODUCTION-GRADE POSTGRESQL SCHEMA (DYNAMIC VENDOR ENGINE)
-- ============================================================================
-- Architecture Overview:
-- 1. Stripe-Style Prefixed IDs: Human-readable, unguessable, high-performance IDs
--    (e.g. vnd_..., usr_..., ord_..., bth_..., sub_..., req_..., plan_...).
-- 2. Multi-tenant isolation: Scoped strictly by vendor_id on all operational tables.
-- 3. Dynamic Serving Models: Supports DINE_IN, TAKEAWAY, and DELIVERY.
-- 4. Order Lifecycle Control: accept_order_type (PREPAID/POSTPAID) & order_confirmation_model.
-- 5. Universal Booth Infrastructure: qr_booths supports tables, counters, and delivery spots.
-- 6. Verification Tokens: ref_token on orders for customer confirmation, pickup, and delivery handoff.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Configure Database & Session Timezone to Asia/Kolkata (IST)
DO $$
BEGIN
  EXECUTE 'ALTER DATABASE ' || quote_ident(current_database()) || ' SET timezone TO ''Asia/Kolkata''';
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;
ALTER ROLE CURRENT_USER SET timezone TO 'Asia/Kolkata';
SET timezone = 'Asia/Kolkata';

BEGIN;

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Automated updated_at timestamp maintenance
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stripe-Style Prefixed ID Generator (e.g. vnd_7kJ2n9Xm4Pq1L8wZ, bth_9mK3xP...)
-- Uses cryptographically secure random bytes from pgcrypto mapped to 62 alphanumeric chars.
CREATE OR REPLACE FUNCTION generate_id(prefix text, size int DEFAULT 16)
RETURNS text AS $$
DECLARE
  characters text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  bytes bytea := gen_random_bytes(size);
  result text := '';
  i int;
BEGIN
  FOR i IN 0..(size - 1) LOOP
    result := result || substr(characters, (get_byte(bytes, i) % 62) + 1, 1);
  END LOOP;
  RETURN prefix || '_' || result;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- ============================================================================
-- 2. PLANS & FEATURE CAPABILITIES
-- ============================================================================
CREATE TABLE plans (
  id               text PRIMARY KEY DEFAULT generate_id('plan'),
  code             text NOT NULL UNIQUE CHECK (code IN ('BASIC', 'STANDARD', 'PREMIUM')),
  name             text NOT NULL,
  price_inr        integer NOT NULL CHECK (price_inr >= 0),
  price_paise      integer NOT NULL CHECK (price_paise >= 0),
  billing_interval text NOT NULL DEFAULT 'MONTH' CHECK (billing_interval IN ('MONTH', 'YEAR')),
  max_booths       integer NOT NULL DEFAULT 10 CHECK (max_booths > 0),
  features         jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 3. VENDORS (UNIVERSAL TENANTS: RESTAURANTS, CAFES, FOOD VANS, STALLS, KIOSKS)
-- ============================================================================
-- Each onboarded business is an isolated vendor with a Stripe-style ID: vnd_...
CREATE TABLE vendors (
  id                       text PRIMARY KEY DEFAULT generate_id('vnd'), -- Linked in MongoDB as vendor_id
  name                     text NOT NULL,
  slug                     text NOT NULL UNIQUE,                         -- e.g. 'chai-break-patia' for public URLs
  business_type            text NOT NULL DEFAULT 'CAFE'
                           CHECK (business_type IN ('RESTAURANT', 'CAFE', 'FOOD_TRUCK', 'FOOD_STALL', 'BAKERY', 'BAR', 'CLOUD_KITCHEN', 'OTHER')),
  serving_model            text NOT NULL DEFAULT 'DINE_IN'
                           CHECK (serving_model IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
  accept_order_type        text NOT NULL DEFAULT 'PREPAID'
                           CHECK (accept_order_type IN ('PREPAID', 'POSTPAID')),
  order_confirmation_model text NOT NULL DEFAULT 'MANUAL'
                           CHECK (order_confirmation_model IN ('MANUAL', 'PA_CALLBACK', 'MA_CALLBACK', 'HYBRID')),
  status                   text NOT NULL DEFAULT 'ONBOARDED'
                           CHECK (status IN ('ONBOARDED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  status_reason            text,                                         -- e.g. 'unpaid_invoice', 'manager_requested'
  phone                    text,
  email                    citext,
  website_url              text,
  google_map_link          text,
  address                  text,
  city                     text,
  state                    text DEFAULT 'ODISHA',
  pincode                  text,
  country                  text NOT NULL DEFAULT 'INDIA',
  opening_time             time NOT NULL DEFAULT '09:00:00',
  closing_time             time NOT NULL DEFAULT '22:00:00',
  currency                 char(3) NOT NULL DEFAULT 'INR',
  current_plan_id          text NOT NULL REFERENCES plans(id),
  subscription_status      text NOT NULL DEFAULT 'TRIALING'
                           CHECK (subscription_status IN ('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
  subscription_ends_at     timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_serving_model ON vendors(serving_model);

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 4. SUBSCRIPTIONS (BILLING & AUDIT HISTORY)
-- ============================================================================
CREATE TABLE subscriptions (
  id                   text PRIMARY KEY DEFAULT generate_id('sub'),
  vendor_id            text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  plan_id              text NOT NULL REFERENCES plans(id),
  status               text NOT NULL DEFAULT 'TRIALING'
                       CHECK (status IN ('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
  current_period_start timestamptz NOT NULL,
  current_period_end   timestamptz NOT NULL,
  grace_days           integer NOT NULL DEFAULT 5 CHECK (grace_days >= 0),
  payment_provider     text DEFAULT 'RAZORPAY',                     -- 'RAZORPAY', 'MANUAL', etc.
  payment_reference    text,                                        -- Gateway sub ID or invoice ID
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- At most one live subscription per vendor
CREATE UNIQUE INDEX uq_subscriptions_live_vendor
  ON subscriptions (vendor_id)
  WHERE status IN ('TRIALING', 'ACTIVE', 'PAST_DUE');

CREATE INDEX idx_subscriptions_vendor ON subscriptions(vendor_id, created_at DESC);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 5. USERS & STAFF (TENANT SCOPING & ROLES)
-- ============================================================================
-- ID format: usr_...
-- Roles:
--   SUPER_ADMIN, ADMIN: Platform-level operators (vendor_id IS NULL).
--   MANAGER, CHEF, WAITER, USER: Bound strictly to a single vendor (vendor_id IS NOT NULL).
CREATE TABLE users (
  id            text PRIMARY KEY DEFAULT generate_id('usr'),
  vendor_id     text REFERENCES vendors(id) ON DELETE CASCADE,       -- Tenant Scope Key
  email         citext NOT NULL UNIQUE,
  password_hash text,                                               -- NULL when authenticated via Google OAuth2 only
  google_id     text UNIQUE,                                        -- Google OAuth2 'sub' account ID
  avatar_url    text,                                               -- Google profile picture / avatar URL
  auth_provider text NOT NULL DEFAULT 'LOCAL'
                CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'BOTH')),
  full_name     text NOT NULL,
  phone         text,
  status        text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  role          text NOT NULL DEFAULT 'USER'
                CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'USER')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Authentication constraint: Must have at least a password or a Google ID
  CONSTRAINT chk_user_auth_credential CHECK (
    password_hash IS NOT NULL OR google_id IS NOT NULL
  ),

  -- Tenant Isolation constraint: Staff MUST have vendor_id; Platform Admins MUST NOT.
  CONSTRAINT chk_user_tenant_scope CHECK (
    (role IN ('SUPER_ADMIN', 'ADMIN', 'USER') AND vendor_id IS NULL)
    OR
    (role IN ('MANAGER', 'CHEF', 'WAITER') AND vendor_id IS NOT NULL)
  )
);

CREATE INDEX idx_users_vendor_role ON users(vendor_id, role) WHERE status = 'ACTIVE';
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 6. QR BOOTHS (TABLES, PICKUP COUNTERS, DELIVERY SPOTS)
-- ============================================================================
-- ID format: bth_...
-- Dynamically represents:
--   1. Dine-in Tables (label: 'Table 14', zone: 'Terrace', seats: 4)
--   2. Self-serving Pickup Points (label: 'Counter A', zone: 'Pickup Bay')
--   3. Delivery Locations (label: 'Inside max_fitness_gym', zone: 'https://maps.google.com/?q=20.35,85.81')
CREATE TABLE qr_booths (
  id           text PRIMARY KEY DEFAULT generate_id('bth'),
  vendor_id    text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  label        text NOT NULL,                                       -- 'T1', 'Window 2', 'Inside max_fitness_gym'
  zone         text,                                                -- 'Terrace', 'Indoor AC', or Google Map Link for DELIVERY
  seats        smallint CHECK (seats IS NULL OR seats > 0),         -- Nullable for delivery spots
  qr_code_key  text UNIQUE,                                         -- Unique token embedded in physical QR URL
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  -- Multi-tenant compound unique constraints
  UNIQUE (vendor_id, id),
  UNIQUE (vendor_id, label)
);

CREATE INDEX idx_qr_booths_active ON qr_booths(vendor_id, is_active);
CREATE INDEX idx_qr_booths_qr_key ON qr_booths(qr_code_key);

CREATE TRIGGER trg_qr_booths_updated_at
  BEFORE UPDATE ON qr_booths
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 7. ORDERS (DYNAMIC KITCHEN & FULFILLMENT WORKFLOW)
-- ============================================================================
-- ID format: ord_...
CREATE TABLE orders (
  id              text PRIMARY KEY DEFAULT generate_id('ord'),
  vendor_id       text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_no        integer NOT NULL,                                 -- Daily order counter (1, 2, 3...)
  order_date      date NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date, -- Daily reset key (IST)
  ref_token       text NOT NULL,                                    -- Customer verification token (e.g. '7A29', '4B18')
  qr_booth_id     text,                                             -- References qr_booths(id)
  booth_label     text,                                             -- Historical snapshot (e.g. 'T-01', 'Inside max_fitness_gym')
  source          text NOT NULL DEFAULT 'QR' CHECK (source IN ('QR', 'STAFF', 'TAKEAWAY', 'REMOTE_QR')),
  status          text NOT NULL DEFAULT 'INITIATED'
                  CHECK (status IN ('INITIATED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED', 'REJECTED')),
  payment_status  text NOT NULL DEFAULT 'PENDING'
                  CHECK (payment_status IN ('NOT_REQUIRED', 'PENDING', 'PAID', 'REFUNDED')),
  payment_method  text CHECK (payment_method IN ('CASH', 'UPI', 'CARD', 'ONLINE')),
  customer_name   text,
  customer_phone  text,
  customer_note   text,
  currency        char(3) NOT NULL DEFAULT 'INR',
  item_details    jsonb NOT NULL,                                   -- Snapshot array: [{item_id, name, price, qty, variant}]
  subtotal_paise  integer NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise  integer NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  tax_paise       integer NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  extra_tips_paise integer DEFAULT 0 CHECK (extra_tips_paise >= 0),
  total_paise     integer NOT NULL CHECK (total_paise >= 0),
  web_notif_config jsonb,                                           -- WebPush subscription payload for customer ready alerts
  idempotency_key text,                                             -- Prevents accidental double orders
  reject_reason   text,
  cancel_reason   text,
  created_by      text REFERENCES users(id) ON DELETE SET NULL,     -- Populated if punched by staff
  placed_at       timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Composite keys & constraints
  UNIQUE (vendor_id, id),
  UNIQUE (vendor_id, order_date, order_no),
  UNIQUE (vendor_id, order_date, ref_token),
  UNIQUE (vendor_id, idempotency_key),

  -- Multi-tenant integrity: booth MUST belong to the same vendor
  FOREIGN KEY (vendor_id, qr_booth_id) REFERENCES qr_booths (vendor_id, id) ON DELETE SET NULL
);

-- High-performance indexes for Live Kitchen Display System (KDS), Waiter & Delivery views
CREATE INDEX idx_orders_active_kds ON orders (vendor_id, status, placed_at)
  WHERE status IN ('INITIATED', 'ACCEPTED', 'PREPARING', 'READY');

CREATE INDEX idx_orders_vendor_booth ON orders (vendor_id, qr_booth_id, placed_at DESC);
CREATE INDEX idx_orders_history ON orders (vendor_id, placed_at DESC);
CREATE INDEX idx_orders_date ON orders (vendor_id, order_date DESC);
CREATE INDEX idx_orders_ref_token ON orders (vendor_id, ref_token);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================================
-- 8. SERVICE REQUESTS (ASSISTANCE / CALLS)
-- ============================================================================
-- ID format: req_...
CREATE TABLE service_requests (
  id           text PRIMARY KEY DEFAULT generate_id('req'),
  vendor_id    text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  qr_booth_id  text,
  booth_label  text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('WATER', 'TISSUE', 'CLEANING', 'BILL', 'WAITER_CALL', 'OTHER')),
  status       text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED')),
  resolved_by  text REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz,

  FOREIGN KEY (vendor_id, qr_booth_id) REFERENCES qr_booths (vendor_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_service_requests_active ON service_requests (vendor_id, status, created_at)
  WHERE status IN ('PENDING', 'ACKNOWLEDGED');


-- ============================================================================
-- 9. DEFAULT SEED DATA: SUBSCRIPTION PLANS
-- ============================================================================
INSERT INTO plans (id, code, name, price_inr, price_paise, billing_interval, max_booths, features)
VALUES 
(
  'plan_basic',
  'BASIC',
  'Basic Starter',
  299,
  29900,
  'MONTH',
  10,
  '{
    "digital_qr_menu": true,
    "qr_ordering": true,
    "waiter_call": true,
    "basic_analytics": true,
    "daily_summary": false,
    "custom_branding": false,
    "sound_alerts": false,
    "review_prompts": false,
    "online_payment_gateway": false,
    "TAKEAWAY_webpush": false,
    "delivery_booths": false
  }'::jsonb
),
(
  'plan_standard',
  'STANDARD',
  'Standard Vendor',
  499,
  49900,
  'MONTH',
  25,
  '{
    "digital_qr_menu": true,
    "qr_ordering": true,
    "waiter_call": true,
    "basic_analytics": true,
    "daily_summary": true,
    "custom_branding": true,
    "sound_alerts": true,
    "review_prompts": true,
    "online_payment_gateway": false,
    "TAKEAWAY_webpush": true,
    "delivery_booths": true
  }'::jsonb
),
(
  'plan_premium',
  'PREMIUM',
  'Premium Pro',
  599,
  59900,
  'MONTH',
  100,
  '{
    "digital_qr_menu": true,
    "qr_ordering": true,
    "waiter_call": true,
    "basic_analytics": true,
    "daily_summary": true,
    "custom_branding": true,
    "sound_alerts": true,
    "review_prompts": true,
    "online_payment_gateway": true,
    "TAKEAWAY_webpush": true,
    "delivery_booths": true,
    "multi_counter_kds": true,
    "priority_support": true
  }'::jsonb
)
ON CONFLICT (code) DO NOTHING;

COMMIT;
