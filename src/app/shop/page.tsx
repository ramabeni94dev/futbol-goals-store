import { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { siteConfig } from "@/config/site";
import { getStorefrontCatalogPage } from "@/server/catalog";
import { CatalogSortOption, ProductCategory } from "@/types";

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

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.query === "string" ? resolvedSearchParams.query : "";
  const category =
    typeof resolvedSearchParams.category === "string"
      ? (resolvedSearchParams.category as ProductCategory | "all")
      : "all";
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? (resolvedSearchParams.sort as CatalogSortOption)
      : "featured";
  const page =
    typeof resolvedSearchParams.page === "string"
      ? Number(resolvedSearchParams.page)
      : 1;
  const catalog = await getStorefrontCatalogPage({
    query,
    category,
    sort,
    page: Number.isFinite(page) ? page : 1,
  });

  return <ShopCatalog catalog={catalog} />;
}
