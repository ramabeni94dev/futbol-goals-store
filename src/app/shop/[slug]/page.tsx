import { ProductDetailView } from "@/components/shop/product-detail-view";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailView slug={slug} />;
}
