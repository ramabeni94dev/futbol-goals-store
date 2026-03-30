import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getCategoryLabel } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { getAvailableStock } from "@/lib/inventory";
import { Product } from "@/types";

export function ProductDetailView({ product }: { product: Product }) {
  const availableStock = getAvailableStock(product);

  return (
    <div className="page-shell section-shell space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="transition hover:text-foreground">
          Inicio
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/shop" className="transition hover:text-foreground">
          Tienda
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} alt={product.name} />

        <section className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">
              {getCategoryLabel(product.category)}
            </span>
            <span className="rounded-full bg-background px-3 py-1">{product.size}</span>
          </div>

          <h1 className="mt-5 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
            {product.name}
          </h1>
          <p className="mt-4 text-sm leading-8 text-muted">{product.description}</p>

          <div className="mt-6 rounded-[24px] border border-line bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Precio
            </p>
            <p className="mt-2 text-4xl font-black text-foreground">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-4 text-sm text-muted">
              Stock disponible: {availableStock} unidades
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Link
              href="/checkout"
              className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Ir al checkout
            </Link>
          </div>

          <div className="mt-8 grid gap-4 rounded-[24px] border border-line bg-background/60 p-5 text-sm text-muted">
            <div className="flex items-center gap-3">
              <Truck className="size-4 text-brand" />
              Envio coordinado para todo el pais.
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-accent" />
              Asistencia comercial para clubes y compras mayoristas.
            </div>
          </div>
        </section>
      </div>

      <section className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-foreground">Especificaciones tecnicas</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {product.technicalSpecs.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-line bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {item.label}
              </p>
              <p className="mt-3 text-sm font-medium leading-7 text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
