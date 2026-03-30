"use client";

import { useEffect, useState } from "react";

import { formatCurrency, formatOrderDate } from "@/lib/format";
import { getOrderStatusClassName, getOrderStatusLabel } from "@/lib/orders";
import { useAuth } from "@/hooks/use-auth";
import { getOrdersByUser } from "@/services/orders";
import { Order } from "@/types";

export function AccountOverview() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }

      const response = await getOrdersByUser(user.uid);
      setOrders(response);
      setLoadingOrders(false);
    }

    void loadOrders();
  }, [user]);

  return (
    <div className="page-shell section-shell space-y-8">
      <div className="surface-card grid gap-6 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
        <div>
          <span className="eyebrow">Mi cuenta</span>
          <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
            Perfil del cliente
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Gestiona tu sesion, revisa tu historial de compras y mantente al dia
            con el estado de tus pedidos.
          </p>
        </div>

        <div className="grid gap-4 rounded-[28px] border border-line/80 bg-white/70 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Nombre
            </p>
            <p className="mt-2 text-lg font-bold text-foreground">
              {profile?.name ?? user?.displayName ?? "Cliente"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Email
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{profile?.email ?? user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Rol
            </p>
            <p className="mt-2 text-sm font-medium capitalize text-foreground">
              {profile?.role ?? "customer"}
            </p>
          </div>
        </div>
      </div>

      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ultimos pedidos</h2>
            <p className="mt-2 text-sm text-muted">
              Tus ordenes apareceran aqui apenas completes el checkout.
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
          </span>
        </div>

        {loadingOrders ? (
          <p className="mt-6 text-sm text-muted">Cargando pedidos...</p>
        ) : orders.length ? (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[24px] border border-line bg-white/70 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Orden #{order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-muted">{formatOrderDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getOrderStatusClassName(order.status)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
                  <span>{order.items.length} items</span>
                  <span className="font-bold text-foreground">{formatCurrency(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-line bg-background/70 p-6 text-sm text-muted">
            Todavia no registras compras. Cuando completes tu primer checkout, la
            orden quedara asociada a tu usuario.
          </div>
        )}
      </section>
    </div>
  );
}
