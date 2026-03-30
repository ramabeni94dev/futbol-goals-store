import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description:
    "Condiciones de cambios, devoluciones y reintegros para compras de arcos de futbol y accesorios.",
  alternates: {
    canonical: `${siteConfig.url}/returns`,
  },
};

export default function ReturnsPage() {
  return (
    <InformationPage
      eyebrow="Postventa"
      title="Cambios y devoluciones"
      intro="Queremos que tu compra llegue en condiciones y responda a las necesidades del club, escuela o cliente final."
      sections={[
        {
          title: "Productos con inconvenientes",
          paragraphs: [
            "Si tu pedido llega dañado o incompleto, debes informarlo dentro de las primeras 48 horas desde la recepcion para iniciar el caso.",
            "Te pediremos fotos del embalaje, de la mercaderia y del remito para validar el reclamo.",
          ],
        },
        {
          title: "Cambios por error de seleccion",
          paragraphs: [
            "Aceptamos cambios sujetos a disponibilidad si el producto no fue usado, permanece completo y se encuentra en el mismo estado de entrega.",
            "Los costos logisticos derivados de un cambio voluntario corren por cuenta del comprador, salvo error operativo nuestro.",
          ],
        },
        {
          title: "Reintegros",
          paragraphs: [
            "Si corresponde un reintegro, se procesa por el mismo medio de pago siempre que la pasarela o entidad emisora lo permita.",
          ],
        },
      ]}
    />
  );
}
