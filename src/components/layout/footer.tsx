import Link from "next/link";

import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-line/80 bg-white/60">
      <div className="page-shell grid gap-10 py-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <p className="font-heading text-3xl uppercase tracking-[0.18em] text-foreground">
            {siteConfig.name}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
            Soluciones deportivas para clubes, academias, escuelas y espacios
            recreativos. Catalogo preparado para vender arcos de futbol con una
            experiencia moderna y clara.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-foreground">
            Navegacion
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            {siteConfig.navigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </Link>
            ))}
            <Link href="/cart" className="transition hover:text-foreground">
              Carrito
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-foreground">
            Contacto
          </p>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>{siteConfig.supportEmail}</p>
            <p>Envios coordinados para todo el pais</p>
            <p>Deploy ready para Vercel + Firebase</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
