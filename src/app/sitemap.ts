import { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { listStorefrontProducts } from "@/server/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listStorefrontProducts();
  const staticRoutes = [
    "",
    "/shop",
    "/shipping",
    "/returns",
    "/payments",
    "/faq",
    "/terms",
    "/privacy",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${siteConfig.url}/shop/${product.slug}`,
      lastModified: new Date(product.updatedAt ?? product.createdAt),
    })),
  ];
}
