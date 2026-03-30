import { renderEmailLayout, renderOrderItems, renderParagraphs } from "@/emails/render";
import { Order } from "@/types";

export function buildOrderCreatedEmail(order: Order, checkoutUrl?: string | null) {
  return {
    subject: `Recibimos tu pedido ${order.id.slice(0, 8)}`,
    html: renderEmailLayout({
      preheader: "Tu pedido fue registrado y ya reservamos stock para procesarlo.",
      title: "Pedido registrado",
      intro: "Reservamos stock para tu compra y dejamos la orden asociada a tu cuenta.",
      body:
        renderParagraphs([
          `Orden ${order.id.slice(0, 8)} generada correctamente.`,
          "Si el pago todavia no fue completado, puedes continuar desde el boton principal o desde tu cuenta.",
        ]) + renderOrderItems(order.items),
      ctaLabel: checkoutUrl ? "Continuar pago" : "Ver mi cuenta",
      ctaUrl: checkoutUrl ?? "/account",
      secondaryNote: `Total del pedido: ARS ${order.total.toLocaleString("es-AR")}.`,
    }),
  };
}
