import { Product } from "@/types/catalog";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartLineInput {
  productId: string;
  slug?: string;
  quantity: number;
}
