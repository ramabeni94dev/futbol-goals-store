import { renderEmailLayout, renderParagraphs } from "@/emails/render";

export function buildEmailVerificationEmail(input: {
  customerName?: string | null;
  actionUrl: string;
}) {
  return {
    subject: "Verifica tu email en Futbol Goals Store",
    html: renderEmailLayout({
      preheader: "Confirma tu email para habilitar el checkout y el seguimiento de pedidos.",
      title: "Verifica tu email",
      intro: `Hola ${input.customerName ?? "cliente"}, necesitamos confirmar tu direccion para habilitar el flujo completo de compra.`,
      body: renderParagraphs([
        "La verificacion de email ayuda a proteger tu cuenta y evita fraudes o pedidos sin contacto valido.",
      ]),
      ctaLabel: "Verificar email",
      ctaUrl: input.actionUrl,
      secondaryNote: "Si no creaste esta cuenta, puedes ignorar este mensaje.",
    }),
  };
}
