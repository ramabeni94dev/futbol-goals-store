# Ecommerce architecture

## Current backend boundaries

- `src/server/orders`: authoritative order creation, payment initialization, webhook reconciliation, admin OMS updates and reservation release
- `src/server/payments`: Mercado Pago adapter and provider-specific DTO mapping
- `src/server/commerce`: pricing engine for subtotal, discounts, shipping, tax and total
- `src/server/emails`: notification orchestration plus provider adapter
- `src/repositories`: Firestore access for products, orders and users
- `src/validators`: Zod contracts that protect route handlers and admin mutations

## Order lifecycle

1. Storefront sends a typed checkout payload with item ids and quantities.
2. Route handler authenticates the user with Firebase Admin and validates the payload with Zod.
3. Server rehydrates products from Firestore and rejects inactive, missing or insufficient-stock items.
4. Pricing is recalculated server-side from current catalog data and commerce rules.
5. Firestore transaction creates the order and increments `reservedStock`.
6. Payment provider initialization updates the order with external references.
7. Mercado Pago webhook reconciles payment status idempotently.
8. Approved payments consume the reservation and decrement `stock`.
9. Failed or cancelled payments release the reservation.

## Inventory strategy

- `stock` is the physical stock
- `reservedStock` tracks units blocked by open orders
- `availableStock = stock - reservedStock`
- cart UI blocks quantities above available stock
- checkout validates stock again on the server
- payment reconciliation consumes or releases the reservation

This keeps the UX simple while preventing the main overselling path.

## OMS scope

The admin order panel supports:

- order list and detail
- payment/order/fulfillment status updates
- manual paid / cancel / shipped flows
- tracking number and carrier
- internal notes
- cancellation and refund reasons
- audit timeline through `statusHistory`

All admin mutations run through guarded server APIs and write actor metadata.

## Commercial engine

Current pricing rules are intentionally simple and centralized:

- currency fixed to `ARS`
- pickup or standard shipping
- free shipping above a configurable threshold
- fixed and percentage coupons
- taxes prepared in the pricing model, defaulting to `0`

Rules live in `src/config/commerce.ts` and are executed by `src/lib/commerce.ts` plus `src/server/commerce/pricing.ts`.

## SEO and storefront scale

- product pages generate dynamic metadata, canonical URLs and JSON-LD
- `sitemap.xml` and `robots.txt` are generated from app routes
- storefront catalog pagination and filters run server-side
- URL params are the canonical state for search, category, sort and page

## Email architecture

- route handlers and order services trigger notifications via `src/server/emails/notifications.ts`
- provider integration is isolated in `src/server/emails/service.ts`
- templates live in `src/emails`
- email sending failures are logged but do not break payment reconciliation or order writes

## Testing strategy

- unit tests cover pure pricing and cart utilities
- integration tests cover checkout route, webhook processing, email verification route and admin order updates
- Playwright E2E covers checkout, admin OMS and email verification UX

The E2E suite runs against a production build with a dedicated auth bypass flag so the browser flow stays deterministic without weakening runtime security.

## Known production follow-ups

- add a scheduled job to release expired reservations automatically
- add stronger antifraud and reconciliation reports
- add coupon persistence in Firestore for business-managed promotions
- add analytics, conversion tracking and observability dashboards
- add invoice/tax integrations if the operation requires fiscal compliance
