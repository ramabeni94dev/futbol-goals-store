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

const registerSchema = z
  .object({
    name: z.string().min(2, "Ingresa tu nombre."),
    email: z.email("Ingresa un email valido."),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirma la contrasena."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { register: registerUser, firebaseEnabled } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Cuenta creada correctamente.");
      router.replace(redirect);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      toast.error(message);
    }
  }

  return (
    <div className="surface-card w-full max-w-xl p-6 sm:p-8">
      <span className="eyebrow">Nuevo cliente</span>
      <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
        Crear cuenta
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        Registra tu perfil para comprar mas rapido, guardar pedidos y acceder a tu
        historial.
      </p>

      {!firebaseEnabled ? (
        <div className="mt-6">
          <FirebaseDisabledMessage />
        </div>
      ) : null}

      <div className="mt-8">
        <GoogleSignInButton label="Crear cuenta con Google" />
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        <span className="h-px flex-1 bg-line" />
        o con email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Nombre</span>
          <Input placeholder="Ramiro Benitez" error={Boolean(errors.name)} {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </label>

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

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Confirmar contrasena</span>
          <Input
            type="password"
            placeholder="******"
            error={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-sm text-rose-600">{errors.confirmPassword.message}</p>
          ) : null}
        </label>

        <Button fullWidth loading={isSubmitting} disabled={!firebaseEnabled} type="submit">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Iniciar sesion
        </Link>
      </p>
    </div>
  );
}
