import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Trophy } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/config/site";
import { demoProducts } from "@/data/demo-products";

const featuredProducts = demoProducts.filter((product) => product.featured).slice(0, 3);

export default function HomePage() {
  return (
    <div>
      <section className="page-shell section-shell">
        <div className="surface-card grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <div>
            <span className="eyebrow">Ecommerce deportivo</span>
            <h1 className="display-title mt-6 max-w-4xl text-foreground">
              Arcos de futbol para clubes, predios y entrenamiento.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-muted sm:text-base">
              {siteConfig.description} Diseñado para vender con claridad, buena UX y
              una estetica comercial enfocada en conversion.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(15,53,40,0.22)] transition hover:bg-brand-strong"
              >
                Ver catalogo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full border border-line bg-white/70 px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-white"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[30px] bg-brand p-6 text-white shadow-[0_20px_70px_rgba(15,53,40,0.22)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Venta destacada
              </p>
              <p className="mt-4 font-heading text-5xl uppercase tracking-[0.18em]">
                11 vs 11
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                Soluciones robustas para instalaciones deportivas con foco en duracion
                y presentacion profesional.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/70 p-5">
                <Trophy className="size-5 text-brand" />
                <p className="mt-3 text-sm font-bold text-foreground">Arcos premium</p>
                <p className="mt-2 text-sm leading-7 text-muted">Modelos profesionales y reforzados.</p>
              </div>
              <div className="rounded-[24px] bg-white/70 p-5">
                <ShieldCheck className="size-5 text-brand" />
                <p className="mt-3 text-sm font-bold text-foreground">Compra segura</p>
                <p className="mt-2 text-sm leading-7 text-muted">Autenticacion, pedidos y panel admin.</p>
              </div>
              <div className="rounded-[24px] bg-white/70 p-5">
                <Truck className="size-5 text-brand" />
                <p className="mt-3 text-sm font-bold text-foreground">Cobertura nacional</p>
                <p className="mt-2 text-sm leading-7 text-muted">Despachos coordinados segun destino.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section-shell">
        <SectionHeading
          eyebrow="Destacados"
          title="Productos con mayor salida"
          description="Una seleccion inicial orientada a clubes, entrenadores y clientes que buscan rendimiento, resistencia y presencia comercial."
          action={
            <Link href="/shop" className="text-sm font-semibold text-brand">
              Ver toda la tienda
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-shell section-shell">
        <SectionHeading
          eyebrow="Categorias"
          title="Lineas pensadas para distintos usos"
          description="Desde instalaciones de competencia hasta backyard soccer. Cada categoria ya tiene descripcion y estructura lista para escalar con Firestore."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {siteConfig.categories.map((category) => (
            <article key={category.id} className="surface-card p-6">
              <h3 className="mt-3 text-xl font-bold text-foreground">{category.label}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section-shell">
        <SectionHeading
          eyebrow="Beneficios"
          title="Preparado para vender y administrar"
          description="La base del proyecto ya contempla autenticacion, carrito, checkout, admin y despliegue en Vercel sobre una interfaz responsive."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {siteConfig.benefits.map((benefit) => (
            <div key={benefit} className="surface-card p-6 text-sm leading-7 text-muted">
              {benefit}
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell section-shell">
        <SectionHeading
          eyebrow="Confianza"
          title="Informacion clara antes de pagar"
          description="La tienda publica condiciones de envio, devoluciones, medios de pago y politicas para reducir friccion comercial y mejorar conversion."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {siteConfig.trustLinks.map((item) => (
            <Link key={item.href} href={item.href} className="surface-card p-6 transition hover:-translate-y-0.5">
              <p className="text-lg font-bold text-foreground">{item.label}</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                Ver informacion comercial y operativa relevante antes de confirmar la
                compra.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
