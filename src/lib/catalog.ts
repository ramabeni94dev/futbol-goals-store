import { ProductCategory } from "@/types";

const categoryLabels: Record<ProductCategory, string> = {
  professional: "Profesional",
  training: "Entrenamiento",
  kids: "Infantil",
  mini: "Mini goal",
};

export function getCategoryLabel(category: ProductCategory) {
  return categoryLabels[category];
}
