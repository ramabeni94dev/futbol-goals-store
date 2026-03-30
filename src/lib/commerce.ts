import { commerceConfig, CouponDefinition } from "@/config/commerce";
import { CouponSnapshot, PricingBreakdown, ShippingMethod } from "@/types";

export interface CalculatedCheckoutPricing extends PricingBreakdown {
  couponCode: string | null;
  couponSnapshot: CouponSnapshot | null;
  shippingLabel: string;
}

export function findCouponDefinition(code?: string | null) {
  if (!code) {
    return null;
  }

  const normalizedCode = code.trim().toUpperCase();
  return (
    commerceConfig.coupons.find(
      (coupon) => coupon.active && coupon.code.toUpperCase() === normalizedCode,
    ) ?? null
  );
}

export function isCouponEligible(input: {
  coupon: CouponDefinition;
  subtotal: number;
}) {
  if (!input.coupon.active) {
    return false;
  }

  if (!input.coupon.minSubtotal) {
    return true;
  }

  return input.subtotal >= input.coupon.minSubtotal;
}

export function isFreeShippingEligible(subtotal: number) {
  return subtotal >= commerceConfig.shipping.freeShippingThreshold;
}

export function getShippingMethodLabel(input: {
  method: ShippingMethod;
  subtotal: number;
}) {
  switch (input.method) {
    case "standard":
      return "Envio estandar";
    case "free_shipping":
      return isFreeShippingEligible(input.subtotal)
        ? "Envio gratis"
        : "Envio gratis no disponible";
    default:
      return "Retiro en deposito";
  }
}

export function resolveShippingCost(input: {
  method: ShippingMethod;
  subtotal: number;
}) {
  switch (input.method) {
    case "free_shipping":
      return isFreeShippingEligible(input.subtotal) ? 0 : null;
    case "standard":
      return commerceConfig.shipping.standardCost;
    default:
      return 0;
  }
}

function buildCouponSnapshot(coupon: CouponDefinition): CouponSnapshot {
  return {
    code: coupon.code,
    label: coupon.label,
    discountType: coupon.discountType,
    value: coupon.value,
  };
}

export function calculateCommercialPricing(input: {
  subtotal: number;
  shippingMethod: ShippingMethod;
  couponCode?: string | null;
}): CalculatedCheckoutPricing {
  const shippingCost = resolveShippingCost({
    method: input.shippingMethod,
    subtotal: input.subtotal,
  });

  if (shippingCost === null) {
    throw new Error("El envio gratis no aplica al subtotal actual.");
  }

  const coupon = findCouponDefinition(input.couponCode ?? null);
  const eligibleCoupon =
    coupon && isCouponEligible({ coupon, subtotal: input.subtotal }) ? coupon : null;
  const rawDiscount = eligibleCoupon
    ? eligibleCoupon.discountType === "percentage"
      ? Math.round((input.subtotal * eligibleCoupon.value) / 100)
      : eligibleCoupon.value
    : 0;
  const discount = Math.min(rawDiscount, input.subtotal);
  const tax = 0;
  const total = input.subtotal + shippingCost + tax - discount;

  return {
    currency: commerceConfig.currency,
    subtotal: input.subtotal,
    shippingCost,
    tax,
    discount,
    total,
    couponCode: eligibleCoupon?.code ?? null,
    couponSnapshot: eligibleCoupon ? buildCouponSnapshot(eligibleCoupon) : null,
    shippingLabel: getShippingMethodLabel({
      method: input.shippingMethod,
      subtotal: input.subtotal,
    }),
  };
}
