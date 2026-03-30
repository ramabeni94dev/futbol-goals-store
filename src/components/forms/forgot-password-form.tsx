"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FirebaseDisabledMessage } from "@/components/shared/firebase-disabled-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

const forgotPasswordSchema = z.object({
  email: z.email("Ingresa un email valido."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { firebaseEnabled, requestPasswordReset } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: emailParam,
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await requestPasswordReset({ email: values.email });
      toast.success("Te enviamos un correo de recuperacion a tu casilla.");
      reset({ email: values.email });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo de recuperacion.";
      toast.error(message);
    }
  }

  return (
    <div className="surface-card w-full max-w-xl p-6 sm:p-8">
      <span className="eyebrow">Recupero de acceso</span>
      <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
        Restablecer contrasena
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        Ingresa tu email y enviaremos un correo de recuperacion con una plantilla
        transaccional mas profesional. El enlace final sigue estando protegido por
        Firebase Authentication.
      </p>

      {!firebaseEnabled ? (
        <div className="mt-6">
          <FirebaseDisabledMessage />
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

        <Button fullWidth loading={isSubmitting} disabled={!firebaseEnabled} type="submit">
          Enviar correo de recuperacion
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-sm text-muted">
        <p>
          Soporte sugerido:{" "}
          <span className="font-semibold text-foreground">{siteConfig.supportEmail}</span>
        </p>
        <Link href="/login" className="font-semibold text-brand">
          Volver al login
        </Link>
      </div>
    </div>
  );
}
