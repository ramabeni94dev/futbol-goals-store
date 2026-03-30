import { siteConfig } from "@/config/site";

export function FirebaseDisabledMessage({
  title = "Configura Firebase para habilitar esta seccion",
  description = "Completa las variables NEXT_PUBLIC_FIREBASE_* para activar autenticacion, pedidos y panel administrativo.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="surface-card p-6 sm:p-8">
      <span className="eyebrow">Setup requerido</span>
      <h2 className="mt-4 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      <p className="mt-4 text-sm text-muted">
        Variables esperadas en <code>.env.local</code>: <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>,{" "}
        <code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> y el resto del bundle publico de Firebase.
      </p>
      <p className="mt-4 text-sm text-muted">
        Soporte sugerido: <span className="font-semibold text-foreground">{siteConfig.supportEmail}</span>
      </p>
    </div>
  );
}
