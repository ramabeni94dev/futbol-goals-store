import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas rapidas sobre stock, envios, pagos, armado y compras institucionales de arcos de futbol.",
  alternates: {
    canonical: `${siteConfig.url}/faq`,
  },
};

export default function FaqPage() {
  return (
    <InformationPage
      eyebrow="FAQ"
      title="Preguntas frecuentes"
      intro="Estas son algunas respuestas utiles para reducir dudas antes de confirmar la compra."
      sections={[
        {
          title: "Como se confirma el stock?",
          paragraphs: [
            "El checkout recalcula la orden en servidor y reserva stock real antes de enviar al pago, por lo que no confiamos en cantidades manipuladas desde el navegador.",
          ],
        },
        {
          title: "Puedo comprar para un club o institucion?",
          paragraphs: [
            "Si. La tienda permite operaciones minoristas y tambien puede adaptarse a pedidos institucionales con notas internas, tracking y panel operativo.",
          ],
        },
        {
          title: "Venden con red incluida?",
          paragraphs: [
            "Depende del producto. La ficha tecnica detalla medidas, materiales, accesorios y alcance de cada modelo.",
          ],
        },
      ]}
    />
  );
}
