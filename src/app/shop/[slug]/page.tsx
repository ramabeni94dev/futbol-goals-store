import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/shop/product-detail-view";
import { siteConfig } from "@/config/site";
import { getAvailableStock } from "@/lib/inventory";
import { getStorefrontProductBySlug } from "@/server/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado",
      alternates: {
        canonical: `${siteConfig.url}/shop/${slug}`,
      },
    } satisfies Metadata;
  }

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `${siteConfig.url}/shop/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `${siteConfig.url}/shop/${product.slug}`,
      images: product.images[0]
        ? [
            {
              url: product.images[0],
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  } satisfies Metadata;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    sku: product.sku ?? product.id,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability:
        getAvailableStock(product) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
