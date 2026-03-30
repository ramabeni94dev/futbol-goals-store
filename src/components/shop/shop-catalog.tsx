"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { useProducts } from "@/hooks/use-products";

export function ShopCatalog() {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch =
      deferredSearch.trim().length === 0 ||
      product.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(deferredSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-shell section-shell space-y-8">
      <SectionHeading
        eyebrow="Catalogo"
        title="Arcos listos para vender"
        description="Filtra por categoria, busca por nombre y recorre el inventario con una interfaz clara para desktop y mobile."
        action={
          <Link
            href="/register"
            className="inline-flex rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Crear cuenta
          </Link>
        }
      />

      <div className="surface-card grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o descripcion..."
            className="pl-11"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${category === "all" ? "bg-brand text-white" : "bg-white/70 text-foreground hover:bg-white"}`}
            type="button"
          >
            Todos
          </button>
          {siteConfig.categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              className={`rounded-full px-4 py-3 text-sm font-semibold transition ${category === item.id ? "bg-brand text-white" : "bg-white/70 text-foreground hover:bg-white"}`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-8 text-sm text-muted">Cargando catalogo...</div>
      ) : error ? (
        <div className="surface-card p-8 text-sm text-rose-600">{error}</div>
      ) : filteredProducts.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="surface-card p-8 text-sm text-muted">
          No encontramos productos con ese criterio. Prueba otra busqueda o cambia la
          categoria seleccionada.
        </div>
      )}
    </div>
  );
}
