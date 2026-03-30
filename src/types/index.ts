export type UserRole = "admin" | "customer";
export type ProductCategory = "professional" | "training" | "kids" | "mini";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

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
  category: ProductCategory;
  size: string;
  stock: number;
  images: string[];
  featured: boolean;
  technicalSpecs: TechnicalSpec[];
  createdAt: string;
}

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  category: ProductCategory;
  size: string;
  stock: number;
  images: string[];
  featured: boolean;
  technicalSpecs: TechnicalSpec[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export interface OrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
