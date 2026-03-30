"use client";

import { useEffect, useState } from "react";

import { formatCurrency, formatOrderDate } from "@/lib/format";
import { getOrderStatusClassName, getOrderStatusLabel } from "@/lib/orders";
import { getAllOrders } from "@/services/orders";
import { Order } from "@/types";

export function AdminOrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        const response = await getAllOrders();

        if (!ignore) {
          setOrders(response);
          setError(null);
          setLoading(false);
        }
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "No se pudieron cargar las ordenes.",
          );
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="page-shell section-shell">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Ordenes</span>
            <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
              Seguimiento de pedidos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Vista administrativa de ordenes registradas en Firestore con datos del
              cliente, direccion y total.
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            {orders.length} ordenes
          </span>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted">Cargando ordenes...</p>
        ) : error ? (
          <p className="mt-8 text-sm text-rose-600">{error}</p>
        ) : orders.length ? (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[26px] border border-line bg-white/70 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Orden #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-muted">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getOrderStatusClassName(order.status)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Cliente
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">{order.customerName}</p>
                    <p className="mt-1 text-sm text-muted">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Entrega
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {order.shippingAddress.street}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {order.shippingAddress.city}, {order.shippingAddress.province}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      CP {order.shippingAddress.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-black text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="mt-1 text-sm text-muted">{order.items.length} items</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[24px] border border-dashed border-line bg-background/70 p-6 text-sm text-muted">
            No hay ordenes registradas todavia.
          </div>
        )}
      </section>
    </div>
  );
}
