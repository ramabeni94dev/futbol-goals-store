import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, PackageCheck } from "lucide-react";

import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { formatCurrency } from "@/lib/format";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="surface-card overflow-hidden">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-brand">{product.category}</span>
          <span>{product.size}</span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
          <p className="mt-2 text-sm leading-7 text-muted">{product.shortDescription}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <PackageCheck className="size-4 text-brand" />
            Stock {product.stock}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2">
            <ShieldCheck className="size-4 text-accent" />
            Garantia comercial
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Precio
            </p>
            <p className="mt-2 text-2xl font-black text-foreground">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
            >
              Ver detalle
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
