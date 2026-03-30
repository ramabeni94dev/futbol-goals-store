"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/services/products";
import { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setLoading(true);
        const response = await getProducts();

        if (!ignore) {
          setProducts(response);
          setError(null);
        }
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "No se pudo cargar el catalogo.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  return { products, loading, error };
}
