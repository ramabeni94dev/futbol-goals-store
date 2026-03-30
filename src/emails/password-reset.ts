import { renderEmailLayout, renderParagraphs } from "@/emails/render";

export function buildPasswordResetEmail(input: {
  customerName?: string | null;
  actionUrl: string;
}) {
  return {
    subject: "Restablece tu contrasena",
    html: renderEmailLayout({
      preheader: "Solicitaste restablecer la contrasena de tu cuenta.",
      title: "Restablece tu acceso",
      intro: `Hola ${input.customerName ?? "cliente"}, recibimos una solicitud para cambiar tu contrasena.`,
      body: renderParagraphs([
        "Usa el boton principal para definir una nueva contrasena de forma segura.",
        "Si no solicitaste este cambio, puedes ignorar el mensaje.",
      ]),
      ctaLabel: "Cambiar contrasena",
      ctaUrl: input.actionUrl,
    }),
  };
}
