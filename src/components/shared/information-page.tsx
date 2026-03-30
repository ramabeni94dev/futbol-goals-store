import Link from "next/link";

export interface InformationSection {
  title: string;
  paragraphs: string[];
}

export function InformationPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InformationSection[];
}) {
  return (
    <div className="page-shell section-shell space-y-8">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-muted">{intro}</p>
      </section>

      <section className="grid gap-4">
        {sections.map((section) => (
          <article key={section.title} className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-muted">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div>
          <p className="text-sm font-bold text-foreground">Necesitas ayuda comercial?</p>
          <p className="mt-2 text-sm text-muted">
            Si tu compra es para un club o institucion, podemos asesorarte por cantidad,
            logistica y medios de pago.
          </p>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-brand">
          Volver a la tienda
        </Link>
      </section>
    </div>
  );
}
