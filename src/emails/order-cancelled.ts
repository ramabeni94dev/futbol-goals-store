import { renderEmailLayout, renderParagraphs } from "@/emails/render";
import { Order } from "@/types";

export function buildOrderCancelledEmail(order: Order) {
  return {
    subject: `Actualizacion de tu orden ${order.id.slice(0, 8)}`,
    html: renderEmailLayout({
      preheader: "Tu orden fue cancelada o no pudo seguir procesandose.",
      title: "Orden actualizada",
      intro: "Hubo un cambio operativo en tu pedido.",
      body: renderParagraphs([
        order.cancellationReason || order.refundReason || "La orden fue cancelada o anulada.",
        "Si necesitas reactivar la compra, puedes iniciar un nuevo checkout o contactarnos.",
      ]),
      ctaLabel: "Ir a la tienda",
      ctaUrl: "/shop",
    }),
  };
}
