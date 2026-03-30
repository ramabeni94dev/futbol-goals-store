import { renderEmailLayout, renderParagraphs } from "@/emails/render";
import { Order } from "@/types";

export function buildOrderShippedEmail(order: Order) {
  return {
    subject: `Tu orden ${order.id.slice(0, 8)} fue despachada`,
    html: renderEmailLayout({
      preheader: "Tu compra ya esta en camino.",
      title: "Pedido despachado",
      intro: "Tu orden ya salio del circuito operativo.",
      body: renderParagraphs([
        `Carrier: ${order.carrier ?? "A confirmar"}.`,
        `Tracking: ${order.trackingNumber ?? "A confirmar"}.`,
        "Puedes revisar el estado actualizado desde tu cuenta.",
      ]),
      ctaLabel: "Ver tracking",
      ctaUrl: "/account",
    }),
  };
}
