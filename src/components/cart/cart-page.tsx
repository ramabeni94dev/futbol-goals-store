"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export function CartPageView() {
  const { items, subtotal, total, itemCount, clearCart, removeItem, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <div className="page-shell section-shell">
        <div className="surface-card space-y-4 p-8 text-center">
          <span className="eyebrow">Carrito vacio</span>
          <h1 className="text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
            Tu carrito todavia esta vacio
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-muted">
            Explora el catalogo y agrega productos para construir tu pedido. La
            seleccion queda persistida localmente aunque refresques la pagina.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="text-sm font-semibold text-brand">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell section-shell grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Carrito</span>
            <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
              Pedido en armado
            </h1>
          </div>
          <button
            type="button"
            onClick={() => clearCart()}
            className="text-sm font-semibold text-rose-600"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item.product.id}
              className="grid gap-4 rounded-[26px] border border-line bg-white/75 p-4 sm:grid-cols-[160px_1fr_auto]"
            >
              <div className="relative h-40 overflow-hidden rounded-[22px]">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">{item.product.name}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{item.product.shortDescription}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {formatCurrency(item.product.price)}
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 sm:items-end">
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-background px-2 py-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-white"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-white"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <p className="text-lg font-black text-foreground">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
                >
                  <Trash2 className="size-4" />
                  Quitar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="surface-card h-fit p-6 sm:p-8">
        <span className="eyebrow">Resumen</span>
        <div className="mt-6 space-y-4 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span className="font-semibold text-foreground">{itemCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envio</span>
            <span className="font-semibold text-foreground">A coordinar</span>
          </div>
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-2xl font-black text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,53,40,0.24)] transition hover:bg-brand-strong"
          >
            Continuar al checkout
          </Link>
          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Seguir comprando
          </Link>
        </div>
      </aside>
    </div>
  );
}
