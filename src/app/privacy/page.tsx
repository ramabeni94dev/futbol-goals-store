import { Metadata } from "next";

import { InformationPage } from "@/components/shared/information-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Politica de privacidad",
  description:
    "Informacion sobre datos personales, autenticacion, pedidos y tratamiento basico de informacion comercial.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <InformationPage
      eyebrow="Privacidad"
      title="Politica de privacidad"
      intro="Tratamos datos personales y transaccionales para operar la tienda, procesar pagos y brindar soporte."
      sections={[
        {
          title: "Datos que utilizamos",
          paragraphs: [
            "Podemos almacenar nombre, email, direccion, historial de ordenes y eventos operativos asociados al checkout o al panel administrativo.",
          ],
        },
        {
          title: "Finalidad",
          paragraphs: [
            "Usamos la informacion para autenticar usuarios, validar pedidos, cobrar, despachar, responder consultas y sostener auditoria basica del ecommerce.",
          ],
        },
        {
          title: "Seguridad",
          paragraphs: [
            "La aplicacion utiliza Firebase Authentication, Firestore, Storage, validaciones server-side y webhooks firmados para reducir riesgo operativo.",
          ],
        },
      ]}
    />
  );
}
