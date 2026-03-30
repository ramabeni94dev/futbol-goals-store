# Ecommerce architecture roadmap

## Phase 1 foundations

- `src/types` now contains normalized domain models for products, inventory, orders, payments and users.
- `src/validators` centralizes Zod contracts for catalog, checkout and order mutations.
- `src/server` introduces the secure server runtime layer: environment access, Firebase Admin bootstrap, auth guards, error contracts and logging.
- `src/repositories` is the new server-side persistence boundary for products, orders and users.
- Firestore documents are mapped through shared serializers in `src/lib/serializers` so client and server read the same shape.

## Target architecture

1. Browser components only manage interaction and optimistic UX.
2. Critical ecommerce logic lives in `src/server` services and `src/repositories`.
3. Route handlers and webhooks validate input with Zod and authenticate with Firebase Admin.
4. Orders, payments and stock transitions are executed through server-side flows with audit history.
5. External providers like Mercado Pago and Resend stay isolated behind dedicated server adapters.

## Migration strategy

- Keep the current storefront running while replacing legacy client-side order creation incrementally.
- Preserve backward compatibility for legacy Firestore documents through normalization helpers.
- Tighten Firestore rules only after client-side writes are removed from sensitive flows.
