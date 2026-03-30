"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FirebaseDisabledMessage } from "@/components/shared/firebase-disabled-message";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/hooks/use-auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, firebaseEnabled, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && firebaseEnabled && !user) {
      const redirect = encodeURIComponent(pathname || "/admin");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [firebaseEnabled, loading, pathname, router, user]);

  if (!firebaseEnabled) {
    return (
      <FirebaseDisabledMessage title="Configura Firebase para habilitar el panel admin" />
    );
  }

  if (loading) {
    return (
      <PageLoader
        title="Validando acceso admin"
        description="Comprobando autenticacion y rol del usuario."
      />
    );
  }

  if (!user) {
    return (
      <PageLoader
        title="Redirigiendo"
        description="Necesitas una sesion valida para acceder al panel."
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-shell section-shell">
        <div className="surface-card space-y-4 p-8">
          <span className="eyebrow">Acceso restringido</span>
          <h1 className="text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
            Tu usuario no tiene permisos de administrador
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            El rol se controla desde la coleccion <code>users</code> y las reglas de
            Firestore/Storage. Asigna <code>role: &quot;admin&quot;</code> al usuario para
            habilitar este panel.
          </p>
          <div className="pt-2">
            <Link href="/account" className="text-sm font-semibold text-brand">
              Volver a mi cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
