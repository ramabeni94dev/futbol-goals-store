"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/product-form";
import { useProducts } from "@/hooks/use-products";
import { removeProduct, seedProducts } from "@/services/products";
import { Product } from "@/types";
import { getCategoryLabel } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";

export function AdminProductsManager() {
  const { products, loading, error, reload } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [processingSeed, setProcessingSeed] = useState(false);

  async function handleDelete(productId: string) {
    if (!window.confirm("¿Eliminar este producto?")) {
      return;
    }

    try {
      await removeProduct(productId);
      toast.success("Producto eliminado.");

      if (editingProduct?.id === productId) {
        setEditingProduct(null);
      }

      reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el producto.";
      toast.error(message);
    }
  }

  async function handleSeed() {
    try {
      setProcessingSeed(true);
      const response = await seedProducts();
      toast.success(
        response.created
          ? `${response.created} productos demo creados.`
          : `Seed omitido: ya existen ${response.skipped} productos.`,
      );
      reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo ejecutar el seed.";
      toast.error(message);
    } finally {
      setProcessingSeed(false);
    }
  }

  return (
    <div className="page-shell section-shell grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <ProductForm
          product={editingProduct}
          onSaved={async () => {
            setEditingProduct(null);
            reload();
          }}
          onCancel={editingProduct ? () => setEditingProduct(null) : undefined}
        />

        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Utilidades</h2>
              <p className="mt-2 text-sm text-muted">
                Carga productos demo en Firestore si la coleccion esta vacia.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              {processingSeed ? "Sembrando..." : "Seed demo"}
            </button>
          </div>
        </div>
      </div>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Inventario</span>
            <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
              Gestion de productos
            </h1>
          </div>
          <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            {products.length} productos
          </span>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted">Cargando productos...</p>
        ) : error ? (
          <p className="mt-8 text-sm text-rose-600">{error}</p>
        ) : products.length ? (
          <div className="mt-8 space-y-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-4 rounded-[24px] border border-line bg-white/70 p-4 md:grid-cols-[110px_1fr_auto]"
              >
                <div className="relative h-28 overflow-hidden rounded-[20px]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="110px"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-foreground">{product.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{product.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    <span className="rounded-full bg-background px-3 py-1">
                      {getCategoryLabel(product.category)}
                    </span>
                    <span className="rounded-full bg-background px-3 py-1">{product.size}</span>
                    <span className="rounded-full bg-background px-3 py-1">Stock {product.stock}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <p className="text-lg font-black text-foreground">{formatCurrency(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                    className="text-sm font-semibold text-brand"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[24px] border border-dashed border-line bg-background/70 p-6 text-sm text-muted">
            La coleccion esta vacia. Puedes crear un producto manualmente o usar el
            seed demo.
          </div>
        )}
      </section>
    </div>
  );
}
