import { renderEmailLayout, renderOrderItems, renderParagraphs } from "@/emails/render";
import { Order } from "@/types";

export function buildPaymentConfirmedEmail(order: Order) {
  return {
    subject: `Pago confirmado para tu orden ${order.id.slice(0, 8)}`,
    html: renderEmailLayout({
      preheader: "Tu pago fue confirmado y empezamos la preparacion del pedido.",
      title: "Pago confirmado",
      intro: "Mercado Pago o el panel operativo ya marcaron la orden como pagada.",
      body:
        renderParagraphs([
          "Tu pago fue conciliado correctamente.",
          "A partir de ahora el pedido pasa a preparacion y te avisaremos cuando salga a despacho.",
        ]) + renderOrderItems(order.items),
      ctaLabel: "Ver mi pedido",
      ctaUrl: "/account",
      secondaryNote: `Total cobrado: ARS ${order.total.toLocaleString("es-AR")}.`,
    }),
  };
}
