import { CartLineInput } from "@/types/cart";
import { CurrencyCode } from "@/types/catalog";

export const orderStatuses = [
  "pending",
  "awaiting_payment",
  "paid",
  "payment_failed",
  "cancelled",
  "refunded",
  "fulfilled",
] as const;

export const paymentStatuses = [
  "pending",
  "authorized",
  "paid",
  "failed",
  "cancelled",
  "refunded",
] as const;

export const fulfillmentStatuses = [
  "unfulfilled",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const paymentProviders = ["mercado_pago", "stripe", "manual"] as const;
export const paymentMethods = ["checkout_pro", "manual", "bank_transfer"] as const;
export const shippingMethods = ["pickup", "standard", "free_shipping"] as const;
export const inventoryReservationStatuses = ["reserved", "released", "consumed"] as const;
export const auditActorRoles = ["system", "customer", "admin", "webhook"] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];
export type PaymentProvider = (typeof paymentProviders)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type ShippingMethod = (typeof shippingMethods)[number];
export type InventoryReservationStatus = (typeof inventoryReservationStatuses)[number];
export type AuditActorRole = (typeof auditActorRoles)[number];

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  notes?: string;
}

export interface PricingBreakdown {
  currency: CurrencyCode;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  sku?: string | null;
}

export interface InventoryReservationItem {
  productId: string;
  quantity: number;
}

export interface InventoryReservation {
  status: InventoryReservationStatus;
  reservedAt: string;
  releasedAt?: string | null;
  consumedAt?: string | null;
  expiresAt?: string | null;
  items: InventoryReservationItem[];
}

export interface OrderAuditEntry {
  id: string;
  createdAt: string;
  actorRole: AuditActorRole;
  actorId?: string | null;
  actorName?: string | null;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface OrderStatusHistoryEntry extends OrderAuditEntry {
  status: OrderStatus;
  paymentStatus?: PaymentStatus | null;
  fulfillmentStatus?: FulfillmentStatus | null;
}

export interface OrderAdminNote {
  id: string;
  createdAt: string;
  actorId: string;
  actorName?: string | null;
  note: string;
}

export interface PaymentLogEntry {
  id: string;
  createdAt: string;
  provider: PaymentProvider;
  eventType: string;
  externalEventId?: string | null;
  status?: string | null;
  payload?: Record<string, unknown>;
}

export interface CouponSnapshot {
  code: string;
  label: string;
  discountType: "percentage" | "fixed";
  value: number;
}

export interface Order extends PricingBreakdown {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
  couponCode?: string | null;
  couponSnapshot?: CouponSnapshot | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  paymentIntentId?: string | null;
  preferenceId?: string | null;
  transactionId?: string | null;
  paymentLogs: PaymentLogEntry[];
  webhookEvents: PaymentLogEntry[];
  inventoryReservation?: InventoryReservation | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  adminNotes: OrderAdminNote[];
  statusHistory: OrderStatusHistoryEntry[];
  cancellationReason?: string | null;
  refundReason?: string | null;
  externalReference?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest extends Pick<ShippingAddress, "street" | "city" | "province" | "postalCode" | "notes"> {
  customerName: string;
  customerEmail: string;
  items: CartLineInput[];
  shippingMethod?: ShippingMethod;
  couponCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  currency: CurrencyCode;
  paymentProvider: PaymentProvider;
  paymentMethod: PaymentMethod;
  checkoutUrl?: string | null;
  preferenceId?: string | null;
}

export interface CheckoutValidationIssue {
  code: string;
  message: string;
  field?: string;
  productId?: string;
}

export interface OrderStatusUpdateInput {
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  adminNote?: string;
  cancellationReason?: string | null;
  refundReason?: string | null;
}
