"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { GoogleSignInButton } from "@/components/forms/google-sign-in-button";
import { FirebaseDisabledMessage } from "@/components/shared/firebase-disabled-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.email("Ingresa un email valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { login, firebaseEnabled } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      toast.success("Sesion iniciada correctamente.");
      router.replace(redirect);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesion.";
      toast.error(message);
    }
  }

  return (
    <div className="surface-card w-full max-w-xl p-6 sm:p-8">
      <span className="eyebrow">Acceso clientes</span>
      <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
        Ingresar
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        Accede a tu cuenta para revisar pedidos, completar compras y gestionar tu
        informacion de entrega.
      </p>

      {!firebaseEnabled ? (
        <div className="mt-6">
          <FirebaseDisabledMessage />
        </div>
      ) : null}

      <div className="mt-8">
        <GoogleSignInButton label="Ingresar con Google" />
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        <span className="h-px flex-1 bg-line" />
        o con email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Email</span>
          <Input
            type="email"
            placeholder="cliente@club.com"
            error={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Contrasena</span>
          <Input
            type="password"
            placeholder="******"
            error={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-sm text-rose-600">{errors.password.message}</p>
          ) : null}
        </label>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand">
            Olvide mi contrasena
          </Link>
        </div>

        <Button fullWidth loading={isSubmitting} disabled={!firebaseEnabled} type="submit">
          Iniciar sesion
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿Todavia no tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
