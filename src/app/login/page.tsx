import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="page-shell section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">Acceso</span>
        <h1 className="mt-4 text-5xl font-heading uppercase tracking-[0.18em] text-foreground">
          Tu sesion lista para comprar
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-8 text-muted">
          Entra a tu cuenta para consultar pedidos, avanzar al checkout y mantener
          un historial simple de tus compras de arcos de futbol.
        </p>
      </section>

      <LoginForm />
    </div>
  );
}
