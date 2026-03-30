export type CouponDefinition = {
  code: string;
  label: string;
  discountType: "percentage" | "fixed";
  value: number;
  minSubtotal?: number;
  active: boolean;
};

export const commerceConfig = {
  currency: "ARS" as const,
  shipping: {
    standardCost: 35000,
    freeShippingThreshold: 900000,
  },
  coupons: [
    {
      code: "CLUB10",
      label: "Descuento clubes 10%",
      discountType: "percentage",
      value: 10,
      minSubtotal: 500000,
      active: true,
    },
    {
      code: "ARCO50000",
      label: "Promo lanzamiento ARS 50.000",
      discountType: "fixed",
      value: 50000,
      minSubtotal: 300000,
      active: true,
    },
  ] satisfies CouponDefinition[],
};
