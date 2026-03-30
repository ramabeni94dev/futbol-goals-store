"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@/types";

export function AddToCartButton({
  product,
  fullWidth = false,
}: {
  product: Product;
  fullWidth?: boolean;
}) {
  const { addItem } = useCart();

  return (
    <Button
      fullWidth={fullWidth}
      onClick={() => {
        addItem(product, 1);
        toast.success(`${product.name} agregado al carrito.`);
      }}
      type="button"
    >
      <ShoppingCart className="size-4" />
      Agregar al carrito
    </Button>
  );
}
