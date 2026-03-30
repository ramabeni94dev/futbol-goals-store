import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatOrderDate(value: string) {
  return format(new Date(value), "d 'de' MMM yyyy", { locale: es });
}
