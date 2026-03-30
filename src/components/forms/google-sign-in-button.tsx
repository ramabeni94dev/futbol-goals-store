"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.023c0-.818-.074-1.607-.21-2.364H12v4.473h5.49a4.695 4.695 0 0 1-2.04 3.08v2.553h3.3c1.932-1.778 3.055-4.4 3.055-7.742Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.896 6.619-2.422l-3.3-2.553c-.91.61-2.073.972-3.319.972-2.547 0-4.704-1.72-5.474-4.031H3.114v2.633A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.526 13.966A5.997 5.997 0 0 1 6.22 12c0-.683.118-1.345.306-1.966V7.401H3.114A9.998 9.998 0 0 0 2 12c0 1.61.386 3.13 1.114 4.599l3.412-2.633Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.986c1.468 0 2.784.505 3.82 1.497l2.864-2.864C16.96 3.014 14.696 2 12 2a9.998 9.998 0 0 0-8.886 5.401l3.412 2.633C7.296 7.706 9.453 5.986 12 5.986Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  label = "Continuar con Google",
}: {
  label?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { firebaseEnabled, loginWithGoogle } = useAuth();

  async function handleGoogleLogin() {
    try {
      await loginWithGoogle();
      toast.success("Sesion iniciada con Google.");
      router.replace(redirect);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar con Google.";
      toast.error(message);
    }
  }

  return (
    <Button
      fullWidth
      variant="secondary"
      disabled={!firebaseEnabled}
      onClick={handleGoogleLogin}
      type="button"
      className="border border-line bg-white text-foreground hover:bg-background"
    >
      <GoogleLogo />
      {label}
    </Button>
  );
}
