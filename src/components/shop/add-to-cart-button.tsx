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
        const result = addItem(product, 1);

        if (!result.ok) {
          const message =
            result.reason === "quantity_limit"
              ? `Solo hay ${result.availableStock} unidades disponibles.`
              : "No hay stock disponible para este producto.";
          toast.error(message);
          return;
        }

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
