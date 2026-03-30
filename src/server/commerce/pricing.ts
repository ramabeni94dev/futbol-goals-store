import "server-only";

import { calculateCommercialPricing } from "@/lib/commerce";
import { Product, ShippingMethod } from "@/types";
import { ValidationError } from "@/server/errors";

interface PricingInputItem {
  product: Product;
  quantity: number;
}

export function calculateOrderPricing(input: {
  items: PricingInputItem[];
  shippingMethod: ShippingMethod;
  couponCode?: string | null;
}) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  try {
    return calculateCommercialPricing({
      subtotal,
      shippingMethod: input.shippingMethod,
      couponCode: input.couponCode,
    });
  } catch (error) {
    throw new ValidationError(
      error instanceof Error ? error.message : "No se pudo calcular el precio del checkout.",
    );
  }
}
