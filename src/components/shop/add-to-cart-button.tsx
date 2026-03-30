"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { getAvailableStock } from "@/lib/inventory";
import { Product } from "@/types";

export function AddToCartButton({
  product,
  fullWidth = false,
}: {
  product: Product;
  fullWidth?: boolean;
}) {
  const { addItem } = useCart();
  const availableStock = getAvailableStock(product);

  return (
    <Button
      fullWidth={fullWidth}
      onClick={() => {
        if (availableStock <= 0) {
          toast.error("No hay stock disponible para este producto.");
          return;
        }

        addItem(product, 1);
        toast.success(`${product.name} agregado al carrito.`);
      }}
      disabled={availableStock <= 0}
      type="button"
    >
      <ShoppingCart className="size-4" />
      {availableStock > 0 ? "Agregar al carrito" : "Sin stock"}
    </Button>
  );
}
