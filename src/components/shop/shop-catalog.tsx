import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/config/site";
import { CatalogSortOption, Product, ProductCategory, catalogSortOptions } from "@/types";

function buildCatalogUrl(input: {
  query?: string;
  category?: string;
  sort?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (input.query) {
    searchParams.set("query", input.query);
  }

  if (input.category && input.category !== "all") {
    searchParams.set("category", input.category);
  }

  if (input.sort && input.sort !== "featured") {
    searchParams.set("sort", input.sort);
  }

  if (input.page && input.page > 1) {
    searchParams.set("page", String(input.page));
  }

  const serialized = searchParams.toString();
  return serialized ? `/shop?${serialized}` : "/shop";
}

function getSortLabel(sort: CatalogSortOption) {
  switch (sort) {
    case "price_asc":
      return "Precio menor";
    case "price_desc":
      return "Precio mayor";
    case "name_asc":
      return "Nombre A-Z";
    case "name_desc":
      return "Nombre Z-A";
    default:
      return "Destacados";
  }
}

export function ShopCatalog({
  catalog,
}: {
  catalog: {
    items: Product[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    query: string;
    category: ProductCategory | "all";
    sort: CatalogSortOption;
  };
}) {
  return (
    <div className="page-shell section-shell space-y-8">
      <SectionHeading
        eyebrow="Catalogo"
        title="Arcos listos para vender"
        description="Busqueda, filtros y paginacion viven en la URL para escalar el catalogo sin cargar toda la tienda en cliente."
        action={
          <Link
            href="/register"
            className="inline-flex rounded-full border border-line bg-white/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
          >
            Crear cuenta
          </Link>
        }
      />

      <form className="surface-card grid gap-4 p-5 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto]" method="get">
        <label className="block">
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            name="query"
            defaultValue={catalog.query}
            placeholder="Buscar por nombre o descripcion..."
            className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="sr-only">Categoria</span>
          <select
            name="category"
            defaultValue={catalog.category}
            className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
          >
            <option value="all">Todas las categorias</option>
            {siteConfig.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Ordenar</span>
          <select
            name="sort"
            defaultValue={catalog.sort}
            className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
          >
            {catalogSortOptions.map((sort) => (
              <option key={sort} value={sort}>
                {getSortLabel(sort)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
        >
          Aplicar
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {catalog.totalItems} productos encontrados
          {catalog.category !== "all" ? ` en ${catalog.category}` : ""}
          {catalog.query ? ` para "${catalog.query}"` : ""}
        </p>
        <Link href="/shop" className="font-semibold text-brand">
          Limpiar filtros
        </Link>
      </div>

      {catalog.items.length ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {catalog.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm text-muted">
              Pagina {catalog.currentPage} de {catalog.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildCatalogUrl({
                  query: catalog.query,
                  category: catalog.category,
                  sort: catalog.sort,
                  page: Math.max(catalog.currentPage - 1, 1),
                })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  catalog.currentPage === 1
                    ? "pointer-events-none border-line/60 text-muted"
                    : "border-line bg-white/70 text-foreground hover:bg-white"
                }`}
              >
                Anterior
              </Link>
              <Link
                href={buildCatalogUrl({
                  query: catalog.query,
                  category: catalog.category,
                  sort: catalog.sort,
                  page: Math.min(catalog.currentPage + 1, catalog.totalPages),
                })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  catalog.currentPage === catalog.totalPages
                    ? "pointer-events-none border-line/60 text-muted"
                    : "border-line bg-white/70 text-foreground hover:bg-white"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="surface-card p-8 text-sm text-muted">
          No encontramos productos con ese criterio. Prueba otra busqueda o cambia el
          orden y la categoria seleccionada.
        </div>
      )}
    </div>
  );
}
