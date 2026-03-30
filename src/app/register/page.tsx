import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="page-shell section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">Registro</span>
        <h1 className="mt-4 text-5xl font-heading uppercase tracking-[0.18em] text-foreground">
          Crea tu cuenta y acelera el pedido
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-8 text-muted">
          Un registro rapido permite vincular cada orden al usuario, administrar
          futuras compras y mantener el panel listo para flujo real con Firebase.
        </p>
      </section>

      <RegisterForm />
    </div>
  );
}
