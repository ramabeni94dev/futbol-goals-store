import "server-only";

import { PricingBreakdown, Product, ShippingMethod } from "@/types";

interface PricingInputItem {
  product: Product;
  quantity: number;
}

export function calculateOrderPricing(input: {
  items: PricingInputItem[];
  shippingMethod: ShippingMethod;
}): PricingBreakdown {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const shippingCost = 0;
  const tax = 0;
  const discount = 0;
  const total = subtotal + shippingCost + tax - discount;

  return {
    currency: "ARS",
    subtotal,
    shippingCost,
    tax,
    discount,
    total,
  };
}
