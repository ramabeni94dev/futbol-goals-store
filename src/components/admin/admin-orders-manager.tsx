"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatOrderDate } from "@/lib/format";
import {
  getFulfillmentStatusLabel,
  getOrderStatusClassName,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from "@/lib/orders";
import { useAuth } from "@/hooks/use-auth";
import { listAdminOrders, updateAdminOrder } from "@/services/admin-orders";
import {
  fulfillmentStatuses,
  orderStatuses,
  paymentStatuses,
  Order,
  OrderStatusUpdateInput,
} from "@/types";

interface OrderEditorState {
  status: Order["status"];
  fulfillmentStatus: Order["fulfillmentStatus"];
  paymentStatus: Order["paymentStatus"];
  trackingNumber: string;
  carrier: string;
  adminNote: string;
  cancellationReason: string;
  refundReason: string;
}

function formatTimelineDate(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildEditorState(order: Order): OrderEditorState {
  return {
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber ?? "",
    carrier: order.carrier ?? "",
    adminNote: "",
    cancellationReason: order.cancellationReason ?? "",
    refundReason: order.refundReason ?? "",
  };
}

export function AdminOrdersManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editor, setEditor] = useState<OrderEditorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  useEffect(() => {
    if (selectedOrder) {
      setEditor(buildEditorState(selectedOrder));
      return;
    }

    setEditor(null);
  }, [selectedOrder]);

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      if (!user) {
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await listAdminOrders(token);

        if (ignore) {
          return;
        }

        setOrders(response);
        setSelectedOrderId((current) => current ?? response[0]?.id ?? null);
        setError(null);
      } catch (cause) {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "No se pudieron cargar las ordenes.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function handleSave() {
    if (!user || !selectedOrder || !editor) {
      return;
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();
      const payload: OrderStatusUpdateInput = {
        status: editor.status,
        fulfillmentStatus: editor.fulfillmentStatus,
        paymentStatus: editor.paymentStatus,
        trackingNumber: editor.trackingNumber.trim() || null,
        carrier: editor.carrier.trim() || null,
        adminNote: editor.adminNote.trim() || undefined,
        cancellationReason: editor.cancellationReason.trim() || null,
        refundReason: editor.refundReason.trim() || null,
      };

      const updatedOrder = await updateAdminOrder({
        token,
        orderId: selectedOrder.id,
        payload,
      });

      if (!updatedOrder) {
        throw new Error("La API admin no devolvio la orden actualizada.");
      }

      setOrders((current) =>
        current.map((entry) => (entry.id === updatedOrder.id ? updatedOrder : entry)),
      );
      setSelectedOrderId(updatedOrder.id);
      setEditor(buildEditorState(updatedOrder));
      toast.success(`Orden ${updatedOrder.id.slice(0, 8)} actualizada.`);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo actualizar la orden.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell section-shell space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">OMS</span>
            <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
              Gestion operativa de ordenes
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              Lista administrativa, detalle, cambios manuales de estado, tracking,
              notas internas y timeline de auditoria para cada pedido.
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
            {orders.length} ordenes
          </span>
        </div>
      </section>

      {loading ? (
        <div className="surface-card p-8 text-sm text-muted">Cargando ordenes...</div>
      ) : error ? (
        <div className="surface-card p-8 text-sm text-rose-600">{error}</div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground">Cola de pedidos</h2>
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-[26px] border p-5 text-left transition ${
                    selectedOrderId === order.id
                      ? "border-brand bg-brand/5"
                      : "border-line bg-white/70 hover:border-brand/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Orden #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getOrderStatusClassName(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(order.total)}</p>
                      <p>{order.items.length} items</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            {selectedOrder && editor ? (
              <div className="space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="eyebrow">Orden #{selectedOrder.id.slice(0, 8)}</span>
                    <h2 className="mt-4 text-3xl font-heading uppercase tracking-[0.16em] text-foreground">
                      {selectedOrder.customerName}
                    </h2>
                    <p className="mt-3 text-sm text-muted">
                      {selectedOrder.customerEmail} · {formatOrderDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2 text-right text-sm text-muted">
                    <p>
                      Pago:{" "}
                      <span className="font-semibold text-foreground">
                        {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                      </span>
                    </p>
                    <p>
                      Fulfillment:{" "}
                      <span className="font-semibold text-foreground">
                        {getFulfillmentStatusLabel(selectedOrder.fulfillmentStatus)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-line bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Costos
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(selectedOrder.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Envio</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(selectedOrder.shippingCost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Impuestos</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(selectedOrder.tax)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Descuento</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(selectedOrder.discount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-line pt-3 text-base">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="font-black text-foreground">
                          {formatCurrency(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-line bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Pago y envio
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted">
                      <p>
                        Metodo:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.paymentMethod}
                        </span>
                      </p>
                      <p>
                        Proveedor:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.paymentProvider}
                        </span>
                      </p>
                      <p>
                        Preference ID:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.preferenceId ?? "-"}
                        </span>
                      </p>
                      <p>
                        Tracking:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.trackingNumber ?? "-"}
                        </span>
                      </p>
                      <p>
                        Carrier:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.carrier ?? "-"}
                        </span>
                      </p>
                      <div className="border-t border-line pt-3">
                        <p className="font-semibold text-foreground">
                          {selectedOrder.shippingAddress.street}
                        </p>
                        <p>
                          {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.province}
                        </p>
                        <p>CP {selectedOrder.shippingAddress.postalCode}</p>
                        {selectedOrder.shippingAddress.notes ? (
                          <p className="mt-2">{selectedOrder.shippingAddress.notes}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-line bg-white/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Items
                  </p>
                  <div className="mt-4 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={`${selectedOrder.id}-${item.productId}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-background/60 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-muted">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-bold text-foreground">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">Estado</span>
                    <select
                      value={editor.status}
                      onChange={(event) =>
                        setEditor((current) =>
                          current
                            ? { ...current, status: event.target.value as Order["status"] }
                            : current,
                        )
                      }
                      className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-foreground outline-none transition focus:border-brand"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getOrderStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Fulfillment
                    </span>
                    <select
                      value={editor.fulfillmentStatus}
                      onChange={(event) =>
                        setEditor((current) =>
                          current
                            ? {
                                ...current,
                                fulfillmentStatus: event.target.value as Order["fulfillmentStatus"],
                              }
                            : current,
                        )
                      }
                      className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-foreground outline-none transition focus:border-brand"
                    >
                      {fulfillmentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getFulfillmentStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">Pago</span>
                    <select
                      value={editor.paymentStatus}
                      onChange={(event) =>
                        setEditor((current) =>
                          current
                            ? {
                                ...current,
                                paymentStatus: event.target.value as Order["paymentStatus"],
                              }
                            : current,
                        )
                      }
                      className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-foreground outline-none transition focus:border-brand"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getPaymentStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">Tracking</span>
                    <Input
                      value={editor.trackingNumber}
                      onChange={(event) =>
                        setEditor((current) =>
                          current
                            ? { ...current, trackingNumber: event.target.value }
                            : current,
                        )
                      }
                      placeholder="AR123456789"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">Carrier</span>
                    <Input
                      value={editor.carrier}
                      onChange={(event) =>
                        setEditor((current) =>
                          current ? { ...current, carrier: event.target.value } : current,
                        )
                      }
                      placeholder="Correo Argentino"
                    />
                  </label>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Motivo de cancelacion
                    </span>
                    <Textarea
                      value={editor.cancellationReason}
                      onChange={(event) =>
                        setEditor((current) =>
                          current
                            ? { ...current, cancellationReason: event.target.value }
                            : current,
                        )
                      }
                      className="min-h-24"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">
                      Motivo de reintegro
                    </span>
                    <Textarea
                      value={editor.refundReason}
                      onChange={(event) =>
                        setEditor((current) =>
                          current ? { ...current, refundReason: event.target.value } : current,
                        )
                      }
                      className="min-h-24"
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">Nota interna</span>
                  <Textarea
                    value={editor.adminNote}
                    onChange={(event) =>
                      setEditor((current) =>
                        current ? { ...current, adminNote: event.target.value } : current,
                      )
                    }
                    className="min-h-28"
                    placeholder="Registrar contexto operativo, acuerdo con cliente o accion tomada."
                  />
                </label>

                <Button loading={saving} onClick={handleSave} type="button">
                  Guardar cambios
                </Button>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-line bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Notas internas
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedOrder.adminNotes.length ? (
                        selectedOrder.adminNotes
                          .slice()
                          .reverse()
                          .map((note) => (
                            <div key={note.id} className="rounded-2xl border border-line p-4 text-sm">
                              <p className="font-semibold text-foreground">
                                {note.actorName ?? "Admin"}
                              </p>
                              <p className="mt-1 text-muted">{note.note}</p>
                              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                                {formatTimelineDate(note.createdAt)}
                              </p>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted">No hay notas internas cargadas.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-line bg-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Timeline
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedOrder.statusHistory
                        .slice()
                        .reverse()
                        .map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-line p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="font-semibold text-foreground">{entry.message}</p>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getOrderStatusClassName(entry.status)}`}
                              >
                                {getOrderStatusLabel(entry.status)}
                              </span>
                            </div>
                            <p className="mt-2 text-muted">
                              {entry.actorName ?? entry.actorRole} ·{" "}
                              {formatTimelineDate(entry.createdAt)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-line bg-background/70 p-8 text-sm text-muted">
                Selecciona una orden para abrir el detalle operativo.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
