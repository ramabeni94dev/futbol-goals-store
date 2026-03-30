import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terminos y condiciones",
  description:
    "Terminos generales de uso, compra, facturacion y limitaciones operativas del ecommerce de arcos de futbol.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <InformationPage
      eyebrow="Legales"
      title="Terminos y condiciones"
      intro="Estas condiciones describen el uso general de la tienda, la formacion de la orden y las reglas operativas del ecommerce."
      sections={[
        {
          title: "Formacion de la orden",
          paragraphs: [
            "La generacion de una orden no implica aceptacion automatica definitiva hasta que el sistema confirme stock, precio y estado del pago.",
            "Podemos rechazar o cancelar pedidos con informacion inconsistente, falta de stock o problemas de conciliacion.",
          ],
        },
        {
          title: "Precios y disponibilidad",
          paragraphs: [
            "Los precios se expresan en pesos argentinos. La disponibilidad visible puede variar hasta la validacion final del checkout.",
          ],
        },
        {
          title: "Uso del sitio",
          paragraphs: [
            "No esta permitido manipular el checkout, interferir con la plataforma o utilizar el panel administrativo sin autorizacion expresa.",
          ],
        },
      ]}
    />
  );
}
