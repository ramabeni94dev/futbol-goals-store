import { z } from "zod";

import {
  fulfillmentStatuses,
  orderStatuses,
  paymentMethods,
  paymentProviders,
  paymentStatuses,
  shippingMethods,
} from "@/types";
import { shippingAddressSchema } from "@/validators/checkout";

export const pricingBreakdownSchema = z.object({
  currency: z.literal("ARS"),
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const orderItemSchema = z.object({
  productId: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  image: z.string().trim().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
  sku: z.string().trim().min(1).nullable().optional(),
});

export const orderStatusUpdateSchema = z
  .object({
    status: z.enum(orderStatuses).optional(),
    fulfillmentStatus: z.enum(fulfillmentStatuses).optional(),
    paymentStatus: z.enum(paymentStatuses).optional(),
    trackingNumber: z.string().trim().min(3).nullable().optional(),
    carrier: z.string().trim().min(2).nullable().optional(),
    adminNote: z.string().trim().min(3).max(500).optional(),
    cancellationReason: z.string().trim().min(3).max(500).nullable().optional(),
    refundReason: z.string().trim().min(3).max(500).nullable().optional(),
  })
  .refine(
    (input) =>
      Boolean(
        input.status ??
          input.fulfillmentStatus ??
          input.paymentStatus ??
          input.trackingNumber ??
          input.carrier ??
          input.adminNote ??
          input.cancellationReason ??
          input.refundReason,
      ),
    {
      message: "Debes enviar al menos un cambio de estado o nota.",
      path: ["status"],
    },
  );

export const orderSchema = pricingBreakdownSchema.extend({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  customerName: z.string().trim().min(2),
  customerEmail: z.string().trim().email(),
  items: z.array(orderItemSchema).min(1),
  shippingMethod: z.enum(shippingMethods),
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().trim().min(3).nullable().optional(),
  status: z.enum(orderStatuses),
  paymentStatus: z.enum(paymentStatuses),
  fulfillmentStatus: z.enum(fulfillmentStatuses),
  paymentMethod: z.enum(paymentMethods),
  paymentProvider: z.enum(paymentProviders),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
