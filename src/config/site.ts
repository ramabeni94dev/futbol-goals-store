import { ProductCategory } from "@/types";

export const siteConfig = {
  name: "Futbol Goals Store",
  shortName: "FGS",
  description:
    "Ecommerce especializado en arcos de futbol para clubes, entrenamientos y espacios recreativos.",
  supportEmail: "ventas@futbolgoalsstore.com",
  navigation: [
    { href: "/", label: "Inicio" },
    { href: "/shop", label: "Tienda" },
    { href: "/account", label: "Mi cuenta" },
  ],
  categories: [
    {
      id: "professional" satisfies ProductCategory,
      label: "Profesionales",
      description: "Arcos 11 reforzados para competencia y entrenamiento intensivo.",
    },
    {
      id: "training" satisfies ProductCategory,
      label: "Entrenamiento",
      description: "Modelos desarmables y livianos para trabajos tecnicos.",
    },
    {
      id: "kids" satisfies ProductCategory,
      label: "Infantiles",
      description: "Opciones seguras para escuelas, plazas y clubes de barrio.",
    },
    {
      id: "mini" satisfies ProductCategory,
      label: "Mini goals",
      description: "Versiones compactas para precision, indoor y backyard.",
    },
  ],
  benefits: [
    "Fabricacion reforzada con medidas reglamentarias y opciones portables.",
    "Asesoramiento para clubes, escuelas y proyectos deportivos.",
    "Entrega en todo el pais con seguimiento y atencion posventa.",
  ],
};
