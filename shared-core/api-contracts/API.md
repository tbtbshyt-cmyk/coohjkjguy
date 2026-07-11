# REST API Specification — أبو بشار (Abu Bashar Stores)
**Base URL:** `https://api.abu-bishar.com/api/v1/abecp`  
**Versioning:** URL-path (`/v1`)  
**Auth:** Bearer JWT for admin, optional Bearer for customers  
**Content-Type:** `application/json; charset=utf-8`  
**Locale:** `Accept-Language: ar | en` (default `ar`)  
**Rate Limit:** 100 req/min/IP for public, 600 for admin

> All payloads are **camelCase** in JSON. Times are **ISO-8601** UTC. Money is in **fils** (1/100 of currency unit). Prices are in **YER base currency** unless noted.

---

## 📑 Endpoint Map

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| **AUTH** |
| 1 | POST | `/auth/admin/login` | ❌ | Admin login |
| 2 | POST | `/auth/admin/refresh` | ❌ | Refresh access token |
| 3 | POST | `/auth/admin/logout` | ✅ | Revoke session |
| 4 | GET | `/auth/admin/me` | ✅ | Current admin profile |
| **PRODUCTS** |
| 5 | GET | `/products` | ❌ | List products (filters, pagination) |
| 6 | GET | `/products/:slug` | ❌ | Product detail |
| 7 | GET | `/products/featured` | ❌ | Featured + bestsellers |
| 8 | GET | `/products/flash-sale` | ❌ | Flash sale products |
| 9 | GET | `/products/:id/recommendations` | ❌ | AI recommendations (#5) |
| 10 | POST | `/products/visual-search` | ❌ | Image similarity (#6) |
| 11 | POST | `/admin/products` | ✅ | Create product |
| 12 | PATCH | `/admin/products/:id` | ✅ | Update product |
| 13 | DELETE | `/admin/products/:id` | ✅ | Delete product |
| 14 | POST | `/admin/products/bulk-import` | ✅ | CSV bulk (#32) |
| **CATEGORIES** |
| 15 | GET | `/categories` | ❌ | List all |
| 16 | GET | `/categories/:slug` | ❌ | Detail with products |
| **CARTS & ORDERS** |
| 17 | GET | `/cart` | ❌ (guest token) | Get current cart |
| 18 | POST | `/cart/items` | ❌ | Add item |
| 19 | PATCH | `/cart/items/:id` | ❌ | Update qty |
| 20 | DELETE | `/cart/items/:id` | ❌ | Remove item |
| 21 | POST | `/cart/apply-voucher` | ❌ | Apply coupon (#27) |
| 22 | POST | `/cart/apply-gift-card` | ❌ | Apply gift card (#18) |
| 23 | POST | `/orders/checkout` | ❌ | Guest checkout (#16) |
| 24 | GET | `/orders/:orderNumber` | ❌ (phone+code) | Track order |
| 25 | POST | `/admin/orders` | ✅ | Create on behalf of customer |
| 26 | GET | `/admin/orders` | ✅ | List with filters |
| 27 | PATCH | `/admin/orders/:id/status` | ✅ | Update status |
| 28 | POST | `/admin/orders/:id/archive` | ✅ | Archive (#15) |
| 29 | GET | `/admin/orders/:id/invoice.pdf` | ✅ | PDF invoice (#4) |
| **WISHLIST** |
| 30 | GET | `/wishlist` | ✅ | List |
| 31 | POST | `/wishlist` | ✅ | Add |
| 32 | DELETE | `/wishlist/:productId` | ✅ | Remove |
| **VOUCHERS** |
| 33 | GET | `/vouchers/:code` | ❌ | Public voucher info |
| 34 | POST | `/admin/vouchers` | ✅ | Create |
| 35 | GET | `/admin/vouchers` | ✅ | List |
| 36 | DELETE | `/admin/vouchers/:id` | ✅ | Delete |
| **GIFT CARDS** |
| 37 | POST | `/gift-cards` | ❌ | Create |
| 38 | GET | `/gift-cards/:code/balance` | ❌ | Check balance |
| **LOYALTY** |
| 39 | GET | `/loyalty/me` | ✅ | My account |
| 40 | GET | `/loyalty/me/transactions` | ✅ | History |
| 41 | POST | `/loyalty/redeem` | ✅ | Spend points |
| **AFFILIATES** |
| 42 | POST | `/affiliates/track` | ❌ | Track click (#22) |
| 43 | GET | `/affiliates/me` | ✅ | Dashboard |
| 44 | GET | `/admin/affiliates` | ✅ | List |
| 45 | POST | `/admin/affiliates` | ✅ | Create |
| **GROUP BUYING** |
| 46 | POST | `/group-buying/rooms` | ❌ | Create room (#23) |
| 47 | GET | `/group-buying/rooms/:code` | ❌ | View room |
| 48 | POST | `/group-buying/rooms/:code/members` | ❌ | Join |
| **AI** |
| 49 | POST | `/ai/assistant` | ❌ | Sales assistant (#1) |
| 50 | POST | `/ai/size-calculator` | ❌ | Size guide (#2) |
| 51 | POST | `/ai/ad-copy` | ✅ | Generate ad copy (#9) |
| 52 | POST | `/ai/visual-search` | ❌ | Visual search (#6) |
| 53 | GET | `/ai/analytics/inventory` | ✅ | Predictive analytics (#7) |
| 54 | GET | `/ai/analytics/searches` | ✅ | Search summarizer (#8) |
| **PROMOTIONS** |
| 55 | GET | `/promotions/active` | ❌ | Active promos (#3, #26) |
| 56 | POST | `/admin/promotions` | ✅ | Create |
| **SETTINGS / BANNERS / CURRENCY** |
| 57 | GET | `/settings/public` | ❌ | Public store config |
| 58 | PATCH | `/admin/settings` | ✅ | Update (#34) |
| 59 | GET | `/banners` | ❌ | Active banners |
| 60 | GET | `/currency/rates` | ❌ | Current rates (#31) |
| 61 | POST | `/admin/currency/sync` | ✅ | Manual rate sync |
| **ANALYTICS / DASHBOARD** |
| 62 | GET | `/admin/dashboard/summary` | ✅ | KPIs |
| 63 | GET | `/admin/dashboard/revenue` | ✅ | Revenue chart |
| 64 | GET | `/admin/dashboard/top-products` | ✅ | Top sellers |
| **AUDIT LOG (#35)** |
| 65 | GET | `/admin/audit-logs` | ✅ | List logs |
| 66 | GET | `/admin/audit-logs/:id` | ✅ | Single log |
| **NOTIFICATIONS** |
| 67 | GET | `/notifications` | ✅ | My notifications |
| 68 | PATCH | `/notifications/:id/read` | ✅ | Mark read |

---

## 🔐 Auth Endpoints — Payload Examples

### 1. POST `/auth/admin/login`
**Request:**
```json
{
  "email": "tbashyalo566@gmail.com",
  "password": "bshy 776430",
  "device": "iPhone 15 Pro"
}
```
**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_a8f3c2e1b9d4...",
  "expiresIn": 900,
  "admin": {
    "id": "clx1234567890",
    "email": "tbashyalo566@gmail.com",
    "fullName": "Tariq Bashyal",
    "role": "SUPER_ADMIN",
    "avatar": null,
    "lastLoginAt": "2026-06-30T07:30:00.000Z"
  }
}
```
**Response 401:**
```json
{
  "statusCode": 401,
  "message": "بيانات الدخول غير صحيحة",
  "error": "INVALID_CREDENTIALS",
  "timestamp": "2026-06-30T07:30:00.000Z"
}
```

---

## 📦 Products Endpoints

### 5. GET `/products`
**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Default 1 |
| `limit` | int | Max 50, default 20 |
| `category` | enum | men / women / kids / shoes |
| `brand` | string | Brand slug |
| `minPrice` | int | In YER |
| `maxPrice` | int | In YER |
| `q` | string | Search query |
| `featured` | bool | Featured only |
| `flash` | bool | Flash sale only |
| `sort` | enum | new / priceAsc / priceDesc / best |
| `locale` | string | ar / en |

**Response 200:**
```json
{
  "data": [
    {
      "id": "clxabc",
      "sku": "AB-MEN-001",
      "slug": "black-formal-suit",
      "name": "بدلة رسمية سوداء",
      "nameEn": "Black Formal Suit",
      "description": "بدلة سوداء رسمية...",
      "basePrice": 1800000,        // 18,000 YER = 1,800,000 fils
      "oldPrice": 2400000,
      "discountPercent": 25,
      "currency": "YER",
      "category": { "id": "...", "slug": "men", "nameAr": "رجالي" },
      "brand": { "id": "...", "name": "أبو بشار" },
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "colors": ["أسود", "كحلي"],
      "stock": 14,
      "soldCount": 32,
      "rating": 4.8,
      "reviewCount": 47,
      "isFeatured": true,
      "isFlashSale": true,
      "images": [
        {
          "id": "img1",
          "url": "https://cdn.abu-bishar.com/products/abc-1.jpg",
          "webpUrl": "https://cdn.abu-bishar.com/products/abc-1.webp",
          "blurhash": "LKO2?U%2Tw=w]~RBVZRi};RPxuwH",
          "width": 1200,
          "height": 1200,
          "isPrimary": true
        }
      ],
      "tags": ["رسمي", "مناسبات"],
      "createdAt": "2026-05-30T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 247,
    "totalPages": 13,
    "hasNext": true
  }
}
```

### 6. GET `/products/:slug`
**Response 200:** Single product object (same shape as in list, with `description`, `attributes`, `variants`, `reviews[]`, `recommendations[]`).

### 10. POST `/products/visual-search` (multipart)
**Form-Data:** `image=@photo.jpg`
**Response 200:**
```json
{
  "matches": [
    { "product": { /* product object */ }, "score": 0.92, "reason": "high_visual_similarity" },
    { "product": { /* ... */ }, "score": 0.78, "reason": "color_match" }
  ],
  "searchId": "vs_abc123",
  "duration": 142
}
```

---

## 🛒 Cart & Checkout

### 18. POST `/cart/items`
**Headers:** `X-Guest-Token: gt_xyz` (if no auth)
**Request:**
```json
{
  "productId": "clxabc",
  "variantId": "clxvar1",     // optional
  "quantity": 1,
  "size": "L",
  "color": "أسود"
}
```
**Response 200:**
```json
{
  "cart": {
    "id": "cart_123",
    "items": [
      {
        "id": "ci_1",
        "productId": "clxabc",
        "productName": "بدلة رسمية سوداء",
        "productImage": "https://cdn.../abc-1.webp",
        "size": "L",
        "color": "أسود",
        "quantity": 1,
        "unitPrice": 1800000,
        "lineTotal": 1800000
      }
    ],
    "totals": {
      "subtotal": 1800000,
      "discount": 270000,
      "discountReason": "AUTO_NIGHTLY_15",
      "shipping": 0,
      "tax": 0,
      "total": 1530000,
      "currency": "YER",
      "loyaltyEarnPreview": 18
    }
  }
}
```

### 23. POST `/orders/checkout` (Guest-friendly #16)
**Request:**
```json
{
  "guestToken": "gt_xyz",
  "customer": {
    "name": "أحمد علي",
    "phone": "777111222",
    "email": "ahmad@example.com",
    "city": "عتق",
    "address": "حي المطار - شارع الزهراء"
  },
  "paymentMethod": "COD",
  "voucherCode": "WELCOME10",
  "giftCardCode": null,
  "pointsToUse": 0,
  "affiliateCode": "AFF-XYZ",
  "notes": "اتصل قبل الوصول"
}
```
**Response 201:**
```json
{
  "order": {
    "id": "clxorder1",
    "orderNumber": "AB-2026-00042",
    "status": "PENDING",
    "paymentMethod": "COD",
    "total": 1530000,
    "currency": "YER",
    "invoiceUrl": "https://api.abu-bishar.com/api/v1/abecp/admin/orders/clxorder1/invoice.pdf",
    "qrPayload": "{\"store\":\"أبو بشار\",\"order\":\"AB-2026-00042\",\"total\":1530000}",
    "estimatedDelivery": "2026-07-02T12:00:00.000Z",
    "trackingUrl": "/orders/track?phone=777111222&code=AB-2026-00042"
  },
  "loyaltyEarned": 18
}
```

---

## 🎟️ Vouchers & Promotions

### 21. POST `/cart/apply-voucher`
**Request:** `{ "voucherCode": "WELCOME10" }`
**Response 200:**
```json
{
  "applied": true,
  "voucher": {
    "code": "WELCOME10",
    "type": "PERCENTAGE",
    "value": 10,
    "discount": 180000,
    "description": "خصم ترحيبي 10%"
  }
}
```
**Response 422:**
```json
{
  "applied": false,
  "reason": "MIN_ORDER_NOT_MET",
  "message": "الحد الأدنى للطلب 5,000 ر.ي",
  "minRequired": 500000
}
```

---

## 🤖 AI Endpoints

### 49. POST `/ai/assistant` (#1 Sales Assistant)
**Request:**
```json
{
  "sessionId": "cs_xyz",         // optional, for continuity
  "message": "ما هي أحسن بدلة رسمية لديكم؟",
  "context": { "currentPage": "/products/men" }
}
```
**Response 200:**
```json
{
  "sessionId": "cs_xyz",
  "reply": "لدينا بدلة رسمية سوداء بسعر 18,000 ر.ي وتقييم 4.8 ⭐. هل تبي أرسلها لك مع طقم كامل؟",
  "suggestions": [
    { "productId": "clxabc", "reason": "best_seller" }
  ],
  "actions": [
    { "type": "QUICK_ADD", "label": "أضف للسلة", "payload": { "productId": "clxabc" } }
  ]
}
```

### 50. POST `/ai/size-calculator` (#2)
**Request:**
```json
{
  "heightCm": 175,
  "weightKg": 78,
  "footCm": 27,
  "category": "men"
}
```
**Response 200:**
```json
{
  "topSize": "L",
  "bottomSize": "L",
  "shoeSize": "42",
  "confidence": 0.85,
  "notes": [
    "مقاسك في النطاق المثالي",
    "طول قدمك 27 سم = مقاس 42 أوروبي"
  ]
}
```

### 53. GET `/ai/analytics/inventory` (#7)
**Response 200:**
```json
{
  "summary": {
    "lowStockCount": 3,
    "overstockCount": 5,
    "weeklyDemandTotal": 142
  },
  "alerts": [
    {
      "productId": "clxabc",
      "productName": "حذاء جلد بني رجالي",
      "currentStock": 4,
      "weeklyDemand": 12,
      "daysOfStock": 2.3,
      "alert": "LOW",
      "recommendation": "🔁 أعد الطلب من المورّد فوراً"
    }
  ]
}
```

---

## 🪙 Currency Pegging (#31)

### 60. GET `/currency/rates`
**Response 200:**
```json
{
  "base": "YER",
  "rates": [
    { "target": "SAR", "rate": "0.01540000", "fetchedAt": "2026-06-30T07:00:00Z" },
    { "target": "USD", "rate": "0.00400000", "fetchedAt": "2026-06-30T07:00:00Z" }
  ]
}
```
> Rates are stored as **strings** to preserve Decimal precision.

---

## 📊 Audit Log (#35)

### 65. GET `/admin/audit-logs`
**Query:** `?userId=clx1&action=UPDATE&resource=product&from=2026-06-01&to=2026-06-30&page=1`
**Response 200:**
```json
{
  "data": [
    {
      "id": "log_abc",
      "userId": "clxadmin1",
      "userEmail": "tbashyalo566@gmail.com",
      "action": "UPDATE",
      "resource": "product",
      "resourceId": "clxabc",
      "beforeData": { "basePrice": 1800000, "stock": 14 },
      "afterData":  { "basePrice": 1700000, "stock": 14 },
      "ipAddress": "188.140.1.5",
      "userAgent": "Mozilla/5.0 ...",
      "metadata": { "reason": "price_drop_for_campaign" },
      "createdAt": "2026-06-30T07:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1284 }
}
```

---

## ⚠️ Standard Error Envelope

All 4xx/5xx responses follow this shape:
```json
{
  "statusCode": 422,
  "error": "VALIDATION_ERROR",
  "message": "بيانات غير صالحة",
  "details": [
    { "field": "phone", "message": "رقم الجوال مطلوب" },
    { "field": "voucherCode", "message": "الكود منتهي الصلاحية" }
  ],
  "timestamp": "2026-06-30T07:30:00Z",
  "path": "/api/v1/abecp/orders/checkout",
  "requestId": "req_abc123"
}
```

| HTTP | Error Code | Meaning |
|------|------------|---------|
| 400 | `BAD_REQUEST` | Malformed JSON |
| 401 | `UNAUTHORIZED` | Missing/invalid token |
| 403 | `FORBIDDEN` | Insufficient role |
| 404 | `NOT_FOUND` | Resource missing |
| 409 | `CONFLICT` | Duplicate / state conflict |
| 422 | `VALIDATION_ERROR` | DTO failed |
| 429 | `RATE_LIMITED` | Throttled |
| 500 | `INTERNAL_ERROR` | Server bug |
| 503 | `SERVICE_UNAVAILABLE` | DB down / maintenance |

---

## 🔄 Webhook Events (Backend → Client)

Use Server-Sent Events (`GET /sse/notifications`) or webhook URLs to push:
- `order.status_changed` — fires when admin updates order status
- `inventory.low_stock` — fires when stock < threshold
- `loyalty.reward_unlocked` — fires when tier changes
- `price.drop` — fires for wishlist subscribers (#17)
- `promotion.starting` — fires when countdown begins (#26)

**Webhook Payload Example:**
```json
{
  "event": "order.status_changed",
  "data": {
    "orderNumber": "AB-2026-00042",
    "from": "PENDING",
    "to": "SHIPPED",
    "trackingNumber": "YMP-12345"
  },
  "timestamp": "2026-06-30T08:00:00Z"
}
```