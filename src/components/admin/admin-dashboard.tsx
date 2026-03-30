"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useProducts } from "@/hooks/use-products";
import { getAllOrders } from "@/services/orders";
import { Order } from "@/types";

export function AdminDashboard() {
  const { products, loading: loadingProducts } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        const response = await getAllOrders();

        if (!ignore) {
          setOrders(response);
          setOrdersError(null);
          setLoadingOrders(false);
        }
      } catch (cause) {
        if (!ignore) {
          setOrdersError(
            cause instanceof Error ? cause.message : "No se pudieron cargar las ordenes.",
          );
          setLoadingOrders(false);
        }
      }
    }

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="page-shell section-shell space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">Admin</span>
        <h1 className="mt-4 text-5xl font-heading uppercase tracking-[0.16em] text-foreground">
          Panel operativo
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Accede a la gestion de productos, consulta ordenes y usa Firebase Storage
          para cargar imagenes. El acceso esta restringido por rol y por reglas de
          Firestore.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Productos
          </p>
          <p className="mt-4 text-4xl font-black text-foreground">
            {loadingProducts ? "..." : products.length}
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Ordenes
          </p>
          <p className="mt-4 text-4xl font-black text-foreground">
            {loadingOrders ? "..." : orders.length}
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Pendientes
          </p>
          <p className="mt-4 text-4xl font-black text-foreground">
            {loadingOrders
              ? "..."
              : orders.filter(
                  (order) =>
                    order.status === "pending" || order.status === "awaiting_payment",
                ).length}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/products" className="surface-card p-6 transition hover:-translate-y-0.5">
          <h2 className="text-2xl font-bold text-foreground">Gestionar productos</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Alta, edicion, baja y seed inicial de arcos demo.
          </p>
        </Link>
        <Link href="/admin/orders" className="surface-card p-6 transition hover:-translate-y-0.5">
          <h2 className="text-2xl font-bold text-foreground">Ver ordenes</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Seguimiento de pedidos asociados a usuarios autenticados.
          </p>
        </Link>
      </section>

      {ordersError ? (
        <div className="surface-card p-6 text-sm text-rose-600">{ordersError}</div>
      ) : null}
    </div>
  );
}
