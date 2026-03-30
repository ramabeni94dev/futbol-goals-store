import { z } from "zod";

import { shippingMethods } from "@/types";

export const cartLineInputSchema = z.object({
  productId: z.string().trim().min(1, "El item no tiene producto valido."),
  quantity: z
    .number()
    .int("La cantidad debe ser un entero.")
    .positive("La cantidad debe ser mayor a cero.")
    .max(99, "La cantidad maxima por item es 99."),
});

export const shippingAddressSchema = z.object({
  street: z.string().trim().min(4, "Ingresa la direccion de entrega."),
  city: z.string().trim().min(2, "Ingresa la ciudad."),
  province: z.string().trim().min(2, "Ingresa la provincia."),
  postalCode: z.string().trim().min(3, "Ingresa el codigo postal."),
  country: z.string().trim().min(2).optional(),
  notes: z
    .string()
    .trim()
    .max(300, "El detalle adicional es demasiado largo.")
    .optional(),
});

export const checkoutRequestSchema = shippingAddressSchema.extend({
  customerName: z.string().trim().min(2, "Ingresa el nombre del comprador."),
  customerEmail: z.string().trim().email("Ingresa un email valido."),
  items: z.array(cartLineInputSchema).min(1, "Debes enviar al menos un item."),
  shippingMethod: z.enum(shippingMethods).optional(),
  couponCode: z.string().trim().min(3).max(32).optional(),
});
