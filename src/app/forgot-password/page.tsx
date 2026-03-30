import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="page-shell section-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">Password reset</span>
        <h1 className="mt-4 text-5xl font-heading uppercase tracking-[0.18em] text-foreground">
          Recupera el acceso por email
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-8 text-muted">
          Envia un correo de recuperacion seguro y redirige al usuario nuevamente al
          login. El branding final del mensaje se personaliza desde Firebase Console.
        </p>
      </section>

      <ForgotPasswordForm />
    </div>
  );
}
