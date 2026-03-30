import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Medios de pago",
  description:
    "Informacion sobre Mercado Pago, pagos manuales y comprobantes para pedidos ecommerce de arcos de futbol.",
  alternates: {
    canonical: `${siteConfig.url}/payments`,
  },
};

export default function PaymentsPage() {
  return (
    <InformationPage
      eyebrow="Cobro"
      title="Medios de pago"
      intro="El checkout esta preparado para trabajar con Mercado Pago y contempla validaciones server-side antes de iniciar el cobro."
      sections={[
        {
          title: "Mercado Pago",
          paragraphs: [
            "Puedes pagar con tarjetas, saldo disponible y otras opciones habilitadas por Mercado Pago segun el perfil del comprador.",
            "La orden queda asociada a tu cuenta y el estado se actualiza por webhook cuando la pasarela confirma el pago.",
          ],
        },
        {
          title: "Pagos manuales",
          paragraphs: [
            "Para operaciones institucionales o mayoristas podemos coordinar pago manual y registrar la confirmacion desde el panel admin.",
          ],
        },
        {
          title: "Comprobantes",
          paragraphs: [
            "Conserva el comprobante del pago hasta recibir la mercaderia. Si surge una discrepancia, nos permite acelerar la conciliacion.",
          ],
        },
      ]}
    />
  );
}
