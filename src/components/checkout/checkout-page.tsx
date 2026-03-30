"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthGuard } from "@/components/shared/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateCommercialPricing,
  findCouponDefinition,
  isFreeShippingEligible,
} from "@/lib/commerce";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { createCheckoutOrder } from "@/services/checkout";
import { checkoutRequestSchema } from "@/validators/checkout";

const checkoutSchema = checkoutRequestSchema.omit({
  items: true,
});

type CheckoutFormValues = z.input<typeof checkoutSchema>;
type CheckoutFormOutput = z.output<typeof checkoutSchema>;

function CheckoutInner() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues, undefined, CheckoutFormOutput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: profile?.name ?? user?.displayName ?? "",
      customerEmail: profile?.email ?? user?.email ?? "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
      shippingMethod: "pickup",
      couponCode: "",
    },
  });
  const watchedShippingMethod = useWatch({
    control,
    name: "shippingMethod",
  });
  const watchedCouponCode = useWatch({
    control,
    name: "couponCode",
  });
  const couponCodeValue =
    typeof watchedCouponCode === "string" ? watchedCouponCode : undefined;
  const pricingPreview = useMemo(() => {
    try {
      return calculateCommercialPricing({
        subtotal,
        shippingMethod: watchedShippingMethod ?? "pickup",
        couponCode: couponCodeValue,
      });
    } catch {
      return calculateCommercialPricing({
        subtotal,
        shippingMethod: "pickup",
        couponCode: couponCodeValue,
      });
    }
  }, [couponCodeValue, subtotal, watchedShippingMethod]);
  const couponPreview = findCouponDefinition(couponCodeValue);
  const freeShippingEligible = isFreeShippingEligible(subtotal);

  useEffect(() => {
    reset({
      customerName: profile?.name ?? user?.displayName ?? "",
      customerEmail: profile?.email ?? user?.email ?? "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
      shippingMethod: "pickup",
      couponCode: "",
    });
  }, [profile?.email, profile?.name, reset, user?.displayName, user?.email]);

  async function onSubmit(values: CheckoutFormOutput) {
    if (!user) {
      toast.error("Necesitas iniciar sesion para confirmar el pedido.");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!items.length) {
      toast.error("Tu carrito esta vacio.");
      return;
    }

    if (!user.emailVerified) {
      toast.error("Verifica tu email antes de continuar con el checkout.");
      router.push("/account");
      return;
    }

    try {
      const token = await user.getIdToken();
      const order = await createCheckoutOrder({
        token,
        payload: {
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingMethod: values.shippingMethod,
          couponCode: values.couponCode,
          street: values.street,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode,
          notes: values.notes,
        },
      });

      clearCart();
      toast.success(`Orden ${order.orderId.slice(0, 8)} creada con stock reservado.`);

      if (order.checkoutUrl) {
        window.location.assign(order.checkoutUrl);
        return;
      }

      router.replace("/account");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo registrar la orden.";
      toast.error(message);
    }
  }

  if (!items.length) {
    return (
      <div className="page-shell section-shell">
        <div className="surface-card space-y-4 p-8 text-center">
          <span className="eyebrow">Checkout</span>
          <h1 className="text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
            No hay productos para confirmar
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-muted">
            Agrega productos al carrito antes de iniciar el proceso de compra.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="text-sm font-semibold text-brand">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell section-shell grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="surface-card p-6 sm:p-8">
        <span className="eyebrow">Checkout</span>
        <h1 className="mt-4 text-4xl font-heading uppercase tracking-[0.16em] text-foreground">
          Confirmar compra
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          El pedido se valida y se recalcula del lado del servidor. Solo se reserva
          stock real y se rechazan cantidades o productos manipulados desde el
          navegador.
        </p>
        {!user?.emailVerified ? (
          <div className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Verifica tu email desde tu cuenta para habilitar el cobro y la confirmacion
            del pedido.
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Nombre</span>
              <Input error={Boolean(errors.customerName)} {...register("customerName")} />
              {errors.customerName ? (
                <p className="text-sm text-rose-600">{errors.customerName.message}</p>
              ) : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Email</span>
              <Input
                type="email"
                error={Boolean(errors.customerEmail)}
                {...register("customerEmail")}
              />
              {errors.customerEmail ? (
                <p className="text-sm text-rose-600">{errors.customerEmail.message}</p>
              ) : null}
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Direccion</span>
            <Input error={Boolean(errors.street)} {...register("street")} />
            {errors.street ? <p className="text-sm text-rose-600">{errors.street.message}</p> : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Ciudad</span>
              <Input error={Boolean(errors.city)} {...register("city")} />
              {errors.city ? <p className="text-sm text-rose-600">{errors.city.message}</p> : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Provincia</span>
              <Input error={Boolean(errors.province)} {...register("province")} />
              {errors.province ? (
                <p className="text-sm text-rose-600">{errors.province.message}</p>
              ) : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Codigo postal</span>
              <Input error={Boolean(errors.postalCode)} {...register("postalCode")} />
              {errors.postalCode ? (
                <p className="text-sm text-rose-600">{errors.postalCode.message}</p>
              ) : null}
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Indicaciones adicionales</span>
            <Textarea
              placeholder="Ej. coordinar entrega con administracion del club."
              error={Boolean(errors.notes)}
              {...register("notes")}
            />
            {errors.notes ? <p className="text-sm text-rose-600">{errors.notes.message}</p> : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Metodo de entrega</span>
              <select
                className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
                {...register("shippingMethod")}
              >
                <option value="pickup">Retiro en deposito</option>
                <option value="standard">Envio estandar</option>
                {freeShippingEligible ? (
                  <option value="free_shipping">Envio gratis</option>
                ) : null}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Cupon</span>
              <Input
                placeholder="CLUB10 o ARCO50000"
                error={Boolean(errors.couponCode)}
                {...register("couponCode")}
              />
              {couponPreview ? (
                <p className="text-xs text-muted">
                  {couponPreview.label}
                  {couponPreview.minSubtotal
                    ? ` - minimo ${formatCurrency(couponPreview.minSubtotal)}`
                    : ""}
                </p>
              ) : couponCodeValue?.trim() ? (
                <p className="text-xs text-muted">
                  El codigo se valida en servidor al confirmar la orden.
                </p>
              ) : null}
            </label>
          </div>

          <Button fullWidth loading={isSubmitting} type="submit">
            Confirmar pedido
          </Button>
        </form>
      </section>

      <aside className="surface-card h-fit p-6 sm:p-8">
        <span className="eyebrow">Resumen del pedido</span>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <article
              key={item.product.id}
              className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-[22px] border border-line bg-white/70 p-3"
            >
              <div className="relative h-[72px] overflow-hidden rounded-2xl">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.product.name}</p>
                <p className="mt-1 text-xs text-muted">Cantidad {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(item.product.price * item.quantity)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm text-muted">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envio</span>
            <span className="font-semibold text-foreground">
              {pricingPreview.shippingCost
                ? formatCurrency(pricingPreview.shippingCost)
                : pricingPreview.shippingLabel}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Impuestos</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(pricingPreview.tax)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Descuento</span>
            <span className="font-semibold text-foreground">
              {pricingPreview.discount ? `- ${formatCurrency(pricingPreview.discount)}` : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(pricingPreview.total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function CheckoutPageView() {
  return (
    <AuthGuard>
      <CheckoutInner />
    </AuthGuard>
  );
}
