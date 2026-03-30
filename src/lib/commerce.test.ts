import { describe, expect, it } from "vitest";

import { calculateCommercialPricing, isFreeShippingEligible } from "@/lib/commerce";

describe("commerce pricing", () => {
  it("applies standard shipping and percentage coupon", () => {
    const pricing = calculateCommercialPricing({
      subtotal: 600000,
      shippingMethod: "standard",
      couponCode: "CLUB10",
    });

    expect(pricing.shippingCost).toBe(35000);
    expect(pricing.discount).toBe(60000);
    expect(pricing.total).toBe(575000);
    expect(pricing.couponSnapshot?.code).toBe("CLUB10");
  });

  it("enables free shipping above threshold", () => {
    expect(isFreeShippingEligible(950000)).toBe(true);

    const pricing = calculateCommercialPricing({
      subtotal: 950000,
      shippingMethod: "free_shipping",
    });

    expect(pricing.shippingCost).toBe(0);
    expect(pricing.total).toBe(950000);
  });

  it("ignores unknown coupons", () => {
    const pricing = calculateCommercialPricing({
      subtotal: 300000,
      shippingMethod: "pickup",
      couponCode: "NOPE",
    });

    expect(pricing.discount).toBe(0);
    expect(pricing.couponSnapshot).toBeNull();
  });
});
