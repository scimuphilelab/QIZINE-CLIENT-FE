# TECHNICAL REQUIREMENTS DOCUMENT (TRD) & PRODUCT SPECIFICATION
# Universal Dynamic QR Ordering SaaS Platform (Vendors, Booths & Multi-Model Fulfillment)

## 0. EXECUTIVE ARCHITECTURE OVERVIEW

The platform provides a universal, multi-tenant digital menu, ordering, and fulfillment engine for any Food & Beverage (F&B) business:
- Independent Cafés & Tea Lounges
- Dine-in & Fine Dining Restaurants
- Food Trucks, Food Vans & Mobile Kiosks
- Quick Service Food Stalls & Food Court Counters
- Remote & Hub-and-Spoke Delivery Spots (Gyms, Co-working spaces, Offices)

The core architecture decouples business verticals into a single universal entity: **`Vendor`** operating with configurable **`Serving Models`**, **`Order Acceptance Modes`**, **`Order Confirmation Engines`**, and **`QR Booths`**.

---

## 1. CORE DOMAIN MODEL & TERMINOLOGY

### 1.1 Universal Entity Mapping

| Legacy Term | Universal Standard | Architectural Definition |
|---|---|---|
| `cafes` | `vendors` | Universal tenant entity representing any F&B operator. (Prefix: `vnd_...`) |
| `cafe_tables` | `qr_booths` | Physical or logical ordering origin: dine-in table, takeaway/pickup counter, or remote delivery spot. (Prefix: `bth_...`) |
| `cafe_id` | `vendor_id` | Primary tenant scoping foreign key across all PostgreSQL tables, MongoDB documents, and JWT claims. |
| `table_id` / `table_label` | `qr_booth_id` / `booth_label` | Identifies order location and routing details. |
| N/A | `ref_token` | Ephemeral customer-facing verification code (e.g., `#7A29`) for order tracking, self-service cancellation, pickup confirmation, and delivery handoff. |

---

## 2. VENDOR CONFIGURATION DIMENSIONS

Every vendor tenant is parameterized with the following operational attributes:

### 2.1 `business_type` (Categorization & Filter)
- **Enum Values**: `['RESTAURANT', 'CAFE', 'FOOD_TRUCK', 'FOOD_STALL', 'BAKERY', 'BAR', 'CLOUD_KITCHEN', 'OTHER']`
- **Default**: `'CAFE'`
- **Behavior**: Used for UI presentation, category filtering, and tenant metadata.

### 2.2 `serving_model` (Fulfillment State Machine)
- **Enum Values**: `['WAITER_SERVING', 'SELF_SERVING', 'DELIVERY']`
- **Default**: `'WAITER_SERVING'`
- **Behavior**: Governs how orders move from preparation to handoff:
  - `WAITER_SERVING`: Waiter is notified when ready $\rightarrow$ serves table $\rightarrow$ marks `SERVED`.
  - `SELF_SERVING`: No waiters $\rightarrow$ Chef marks `READY` $\rightarrow$ WebPush alert sent to customer's browser $\rightarrow$ Customer quotes `ref_token` at counter $\rightarrow$ Staff marks `SERVED`.
  - `DELIVERY`: Runner/staff receives delivery notification with booth Google Map location link $\rightarrow$ delivers to remote spot $\rightarrow$ verifies `ref_token` $\rightarrow$ marks `SERVED`.

### 2.3 `accept_order_type` (Payment Gating)
- **Enum Values**: `['PREPAID', 'POSTPAID']`
- **Default**: `'PREPAID'`
- **Behavior**:
  - `PREPAID`: Customer submits order $\rightarrow$ enters `INITIATED` status. Only after payment confirmation does status move to `ACCEPTED` and route to the Kitchen Display System (KDS).
  - `POSTPAID`: Customer submits order $\rightarrow$ enters `ACCEPTED` status directly with `payment_status: PENDING`. Routed immediately to KDS. Payment settled at completion.

### 2.4 `order_confirmation_model` (Approval & Payment Callback)
- **Enum Values**: `['MANUAL', 'PA_CALLBACK', 'MA_CALLBACK', 'HYBRID']`
- **Default**: `'MANUAL'`
- **Behavior**:
  - `MANUAL`: Cashier / Manager manually clicks "Accept Order" / "Mark Paid" on dashboard.
  - `PA_CALLBACK`: Payment Aggregator Webhook (Razorpay / Cashfree / Stripe) confirms payment and auto-advances order.
  - `MA_CALLBACK`: Merchant / Soundbox / POS Machine webhook (e.g. UPI Soundbox payment confirmation).
  - `HYBRID`: Accepts either automated webhook or manual manager override.

### 2.5 Operating Hours Validation Guard
- **Attributes**: `opening_time` (Time) and `closing_time` (Time), default `09:00:00` to `22:00:00` (IST).
- **Validation**:
  On every order placement attempt:
  $$\text{Current Time (IST)} \in [\text{opening\_time}, \text{closing\_time}]$$
  If outside bounds, order creation is rejected with HTTP 400 (`"Vendor is currently closed"`).

---

## 3. QR BOOTH INFRASTRUCTURE (`qr_booths`)

A `qr_booth` represents any physical point where a customer scans a QR code:

1. **Dine-in Table Mode (`WAITER_SERVING`)**:
   - `label`: `"T-01"`, `"Window Table 4"`
   - `zone`: `"Patio"`, `"Indoor AC"`, `"Terrace"`
   - `seats`: `4` (positive integer)
2. **Self-Service / Takeaway Counter Mode (`SELF_SERVING`)**:
   - `label`: `"Counter A"`, `"Pickup Point 1"`
   - `zone`: `"Food Van Window"`, `"Main Counter"`
   - `seats`: `NULL`
3. **Delivery Spot Mode (`DELIVERY`)**:
   - `label`: `"Inside max_fitness_gym"`, `"Block B Lounge"`
   - `zone`: `"https://maps.google.com/?q=20.3538,85.8192"` (Google Maps Navigation Link / Geo-coordinates)
   - `seats`: `NULL`

---

## 4. DETAILED ORDER STATE MACHINES & WORKFLOWS

### 4.1 Global Status Matrix

| Order Status | Description | Permitted Next Status |
|---|---|---|
| `INITIATED` | Order placed by customer (Prepaid). Waiting for payment confirmation. | `ACCEPTED`, `CANCELLED`, `REJECTED` |
| `ACCEPTED` | Order confirmed & authorized. Visible to Chef on KDS. | `PREPARING`, `REJECTED` |
| `PREPARING` | Chef is cooking / fulfilling the items. | `READY` |
| `READY` | Items prepared. Notification triggered (Waiter / WebPush / Runner). | `SERVED` |
| `SERVED` | Order handed over to customer. Completed. | Terminal |
| `CANCELLED` | Cancelled by customer (using `ref_token` while in `INITIATED`). | Terminal |
| `REJECTED` | Rejected by Manager with mandatory reason. | Terminal |

---

### 4.2 State Machine Flow: `WAITER_SERVING`

```
[Customer Scans Table QR]
         │
         ├─── PREPAID:
         │      │
         │      ▼
         │   [Status: INITIATED] ──(Customer cancels via ref_token)──> [CANCELLED]
         │      │
         │      ├── Manager Rejects ──> [REJECTED]
         │      │
         │      └── Payment Confirmed (MANUAL / PA_CALLBACK / MA_CALLBACK / HYBRID)
         │              │
         │              ▼
         │      [Status: ACCEPTED, payment: PAID]
         │              │
         └─── POSTPAID: └──> [Status: ACCEPTED, payment: PENDING]
                                │
                                ▼
                       (Chef sees on KDS)
                                │
                                ▼
                        [Status: PREPARING]
                                │
                                ▼
                        [Status: READY]
                                │
                     (Waiter Alert Dispatched)
                                │
                                ▼
                     (Waiter serves table)
                                │
                                ▼
                        [Status: SERVED]
```

---

### 4.3 State Machine Flow: `SELF_SERVING`

```
[Customer Scans Kiosk / Counter QR]
         │
         ├── Order Validated & Placed (PREPAID / POSTPAID)
         │
         ▼
[Status: ACCEPTED] ──> Chef KDS: [PREPARING] ──> Chef Marks [READY]
                                                      │
                                                      ▼
                                       [Trigger WebPush Notification]
                                       (Direct alert to customer browser)
                                                      │
                                                      ▼
                                   [Customer approaches counter with ref_token]
                                                      │
                                                      ▼
                                 [Staff verifies ref_token & marks SERVED]
```

---

### 4.4 State Machine Flow: `DELIVERY`

```
[Customer Scans Delivery Spot QR (e.g. Inside Gym / Co-working)]
         │
         ├── Time Check: [opening_time <= NOW <= closing_time]
         │
         ▼
[Status: ACCEPTED] ──> Chef KDS: [PREPARING] ──> Chef Marks [READY]
                                                      │
                                                      ▼
                                         [Delivery Runner Alerted]
                                         - Reads booth label: "Inside max_fitness_gym"
                                         - Opens map link: zone URL
                                                      │
                                                      ▼
                                         [Runner reaches location]
                                                      │
                                                      ▼
                                         [Verifies customer ref_token]
                                                      │
                                                      ▼
                                         [Order marked SERVED / DELIVERED]
```

---

## 5. API CONTRACTS & WORKFLOW SPECIFICATIONS

### 5.1 Public Order Placement (`POST /api/v1/orders`)

**Request Payload:**
```json
{
  "qr_key": "qr_abc123xyz",
  "idempotency_key": "idemp_550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "Rohan Das",
  "customer_phone": "+919876543210",
  "customer_note": "Less spicy please",
  "web_notif_config": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcRdre...",
      "auth": "tB3vyG..."
    }
  },
  "items": [
    {
      "item_id": "itm_chk_dum_biryani",
      "variant_id": "var_chk_full",
      "quantity": 2,
      "customizations": []
    }
  ]
}
```

**Response Payload (PREPAID):**
```json
{
  "success": true,
  "message": "Order initiated successfully. Please complete payment.",
  "data": {
    "order_id": "ord_8kL2m9Xp1Q",
    "order_no": 42,
    "ref_token": "7A29",
    "status": "INITIATED",
    "payment_status": "PENDING",
    "total_paise": 59800,
    "currency": "INR",
    "booth_label": "Table 04",
    "serving_model": "WAITER_SERVING"
  }
}
```

---

### 5.2 Customer Order Cancellation (`POST /api/v1/orders/:id/cancel`)

**Request Payload:**
```json
{
  "ref_token": "7A29",
  "reason": "Changed my mind"
}
```

**Rules:** Allowed strictly when `status == 'INITIATED'` and `ref_token` matches the record.

---

### 5.3 Order Handoff & Token Verification (`POST /api/v1/orders/:id/serve`)

**Request Payload:**
```json
{
  "ref_token": "7A29"
}
```

**Rules:** Required for `SELF_SERVING` and `DELIVERY` flows to verify physical handoff. Advances state from `READY` $\rightarrow$ `SERVED`.

---

## 6. NOTIFICATION ARCHITECTURE

1. **Staff Realtime WebSocket / SSE**:
   - Channel: `vendor:{vendor_id}:orders`
   - Events: `ORDER_INITIATED`, `ORDER_ACCEPTED`, `ORDER_PREPARING`, `ORDER_READY`, `ORDER_SERVED`, `ORDER_CANCELLED`.
2. **Customer WebPush Engine**:
   - Stored in `orders.web_notif_config` JSONB.
   - On `READY` transition under `SELF_SERVING`, backend dispatches WebPush payload:
     ```json
     {
       "title": "Order #42 is Ready!",
       "body": "Please collect your order at the counter with token 7A29.",
       "icon": "/assets/icon.png",
       "badge": "/assets/badge.png",
       "data": {
         "order_id": "ord_8kL2m9Xp1Q",
         "ref_token": "7A29"
       }
     }
     ```

---

## 7. SECURITY & TENANT ISOLATION MODEL

1. **Strict Scoping**: Every database query on `orders`, `qr_booths`, `users`, `service_requests` is scoped by `vendor_id`.
2. **Composite Keys**: Composite unique constraints `(vendor_id, id)` and composite foreign keys ensure no cross-tenant references can ever occur at the database engine level.
3. **Zero-Trust Pricing**: Client-submitted prices or totals are completely discarded; the backend recalculates subtotal, taxes, discounts, and totals directly against trusted MongoDB menu pricing.