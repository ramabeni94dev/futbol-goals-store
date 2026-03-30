import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell section-shell">
      <div className="surface-card space-y-4 p-8 text-center">
        <span className="eyebrow">404</span>
        <h1 className="text-4xl font-heading uppercase tracking-[0.18em] text-foreground">
          La pagina no existe
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted">
          El recurso que buscas no esta disponible. Vuelve al catalogo para seguir
          navegando entre los arcos publicados.
        </p>
        <div className="pt-2">
          <Link href="/shop" className="text-sm font-semibold text-brand">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
