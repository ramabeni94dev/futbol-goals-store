import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Envios",
  description:
    "Politica de envios para arcos de futbol, plazos estimados, modalidades logisticas y cobertura nacional.",
  alternates: {
    canonical: `${siteConfig.url}/shipping`,
  },
};

export default function ShippingPage() {
  return (
    <InformationPage
      eyebrow="Logistica"
      title="Envios y retiros"
      intro="Despachamos arcos de futbol a todo el pais y contemplamos modalidades distintas segun volumen, destino y tipo de producto."
      sections={[
        {
          title: "Modalidades disponibles",
          paragraphs: [
            "Puedes elegir retiro en deposito, envio estandar o envio gratis cuando el subtotal supera el umbral promocional vigente.",
            "Las entregas pesadas o mayoristas pueden requerir coordinacion manual para confirmar acceso, descarga y horario.",
          ],
        },
        {
          title: "Plazos estimados",
          paragraphs: [
            "Una vez confirmado el pago, la preparacion operativa suele demorar entre 24 y 72 horas habiles segun stock y volumen del pedido.",
            "El tiempo de viaje depende del transporte seleccionado y del destino final.",
          ],
        },
        {
          title: "Seguimiento",
          paragraphs: [
            "Cuando la orden se despacha, veras carrier y tracking en tu cuenta y tambien podremos enviarte una notificacion por email.",
          ],
        },
      ]}
    />
  );
}
