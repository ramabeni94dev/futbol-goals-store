import { z } from "zod";

import { productCategories } from "@/types";

export const technicalSpecSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const productInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().trim().min(20),
  shortDescription: z.string().trim().min(10),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  category: z.enum(productCategories),
  size: z.string().trim().min(2),
  stock: z.number().int().nonnegative(),
  reservedStock: z.number().int().nonnegative().optional(),
  images: z.array(z.string().trim().min(3)).min(1),
  featured: z.boolean(),
  technicalSpecs: z.array(technicalSpecSchema).min(1),
  trackInventory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sku: z.string().trim().min(1).nullable().optional(),
});
