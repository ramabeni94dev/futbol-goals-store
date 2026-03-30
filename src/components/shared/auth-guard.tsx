"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FirebaseDisabledMessage } from "@/components/shared/firebase-disabled-message";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, firebaseEnabled } = useAuth();

  useEffect(() => {
    if (!loading && firebaseEnabled && !user) {
      const redirect = encodeURIComponent(pathname || "/account");
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [firebaseEnabled, loading, pathname, router, user]);

  if (!firebaseEnabled) {
    return <FirebaseDisabledMessage />;
  }

  if (loading) {
    return (
      <PageLoader
        title="Validando sesion"
        description="Chequeando credenciales y permisos del usuario."
      />
    );
  }

  if (!user) {
    return (
      <PageLoader
        title="Redirigiendo al login"
        description="Necesitas iniciar sesion para acceder a esta pagina."
      />
    );
  }

  return <>{children}</>;
}
