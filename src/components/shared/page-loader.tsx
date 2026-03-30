import { Spinner } from "@/components/ui/spinner";

export function PageLoader({
  title = "Cargando",
  description = "Preparando la seccion...",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="page-shell section-shell">
      <div className="surface-card flex min-h-[320px] flex-col items-center justify-center gap-4 p-10 text-center">
        <Spinner className="size-6 text-brand" />
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
