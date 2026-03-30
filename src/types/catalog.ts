export const productCategories = ["professional", "training", "kids", "mini"] as const;
export const catalogSortOptions = [
  "featured",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type ProductCategory = (typeof productCategories)[number];
export type CatalogSortOption = (typeof catalogSortOptions)[number];
export type CurrencyCode = "ARS";

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number | null;
  category: ProductCategory;
  size: string;
  stock: number;
  reservedStock: number;
  images: string[];
  featured: boolean;
  technicalSpecs: TechnicalSpec[];
  trackInventory: boolean;
  isActive: boolean;
  sku?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number | null;
  category: ProductCategory;
  size: string;
  stock: number;
  reservedStock?: number;
  images: string[];
  featured: boolean;
  technicalSpecs: TechnicalSpec[];
  trackInventory?: boolean;
  isActive?: boolean;
  sku?: string | null;
}
