import { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Tienda de arcos de futbol",
  description:
    "Catalogo ecommerce de arcos de futbol con filtros, categorias y modelos para clubes, entrenamiento e instalaciones deportivas.",
  alternates: {
    canonical: `${siteConfig.url}/shop`,
  },
  openGraph: {
    title: "Tienda de arcos de futbol",
    description:
      "Explora arcos profesionales, infantiles y de entrenamiento con checkout seguro y envios a todo el pais.",
    url: `${siteConfig.url}/shop`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda de arcos de futbol",
    description:
      "Explora arcos profesionales, infantiles y de entrenamiento con checkout seguro y envios a todo el pais.",
  },
};

export default function ShopPage() {
  return <ShopCatalog />;
}
