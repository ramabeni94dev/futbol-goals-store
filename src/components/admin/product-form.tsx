"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadProductImage } from "@/services/storage";
import { upsertProduct } from "@/services/products";
import { slugify } from "@/lib/utils";
import { Product, ProductCategory } from "@/types";

const productCategories = ["professional", "training", "kids", "mini"] as const;

const productSchema = z.object({
  name: z.string().min(2, "Ingresa el nombre del producto."),
  slug: z.string().optional(),
  shortDescription: z.string().min(10, "Agrega una descripcion corta."),
  description: z.string().min(20, "Agrega una descripcion completa."),
  price: z.coerce.number().positive("El precio debe ser mayor a cero."),
  category: z.enum(productCategories),
  size: z.string().min(2, "Ingresa las medidas."),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo."),
  images: z.string().min(3, "Agrega al menos una URL de imagen."),
  technicalSpecs: z.string().min(3, "Agrega especificaciones tecnicas."),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

function formatTechnicalSpecs(product?: Product) {
  return (
    product?.technicalSpecs.map((item) => `${item.label}|${item.value}`).join("\n") || ""
  );
}

function getDefaultValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    category: product?.category ?? "training",
    size: product?.size ?? "",
    stock: product?.stock ?? 0,
    images: product?.images.join("\n") ?? "",
    technicalSpecs:
      formatTechnicalSpecs(product) ||
      "Medidas|7,32 x 2,44 m\nMaterial|Acero reforzado\nIncluye|Ganchos y tensores",
    featured: product?.featured ?? false,
  };
}

function parseImages(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseTechnicalSpecs(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, ...rest] = entry.split("|");
      return {
        label: label?.trim() || "",
        value: rest.join("|").trim(),
      };
    })
    .filter((entry) => entry.label && entry.value);
}

export function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product?: Product | null;
  onSaved: () => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues, undefined, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(product ?? undefined),
  });

  useEffect(() => {
    reset(getDefaultValues(product ?? undefined));
  }, [product, reset]);

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadProductImage(file);
      const currentValue = getValues("images");
      setValue("images", currentValue ? `${currentValue}\n${imageUrl}` : imageUrl, {
        shouldDirty: true,
      });
      toast.success("Imagen subida correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo subir la imagen.";
      toast.error(message);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function onSubmit(values: ProductFormOutput) {
    try {
      await upsertProduct({
        id: product?.id,
        name: values.name,
        slug: values.slug?.trim() || slugify(values.name),
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        category: values.category as ProductCategory,
        size: values.size,
        stock: values.stock,
        images: parseImages(values.images),
        technicalSpecs: parseTechnicalSpecs(values.technicalSpecs),
        featured: values.featured,
      });

      toast.success(product ? "Producto actualizado." : "Producto creado.");
      await onSaved();
      reset(getDefaultValues());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar el producto.";
      toast.error(message);
    }
  }

  return (
    <div className="surface-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Productos</span>
          <h2 className="mt-4 text-3xl font-heading uppercase tracking-[0.16em] text-foreground">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted">
            Cancelar edicion
          </button>
        ) : null}
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Nombre</span>
            <Input error={Boolean(errors.name)} {...register("name")} />
            {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Slug</span>
            <Input
              placeholder="Se genera automaticamente si queda vacio"
              error={Boolean(errors.slug)}
              {...register("slug")}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-4">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Categoria</span>
            <select
              className="h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand focus:bg-white"
              {...register("category")}
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Precio</span>
            <Input type="number" error={Boolean(errors.price)} {...register("price")} />
            {errors.price ? <p className="text-sm text-rose-600">{errors.price.message}</p> : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-foreground">Stock</span>
            <Input type="number" error={Boolean(errors.stock)} {...register("stock")} />
            {errors.stock ? <p className="text-sm text-rose-600">{errors.stock.message}</p> : null}
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Medidas</span>
          <Input placeholder="7,32 x 2,44 m" error={Boolean(errors.size)} {...register("size")} />
          {errors.size ? <p className="text-sm text-rose-600">{errors.size.message}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Descripcion corta</span>
          <Textarea
            error={Boolean(errors.shortDescription)}
            {...register("shortDescription")}
            className="min-h-24"
          />
          {errors.shortDescription ? (
            <p className="text-sm text-rose-600">{errors.shortDescription.message}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Descripcion completa</span>
          <Textarea error={Boolean(errors.description)} {...register("description")} />
          {errors.description ? (
            <p className="text-sm text-rose-600">{errors.description.message}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Imagenes
          </span>
          <Textarea
            error={Boolean(errors.images)}
            {...register("images")}
            className="min-h-24"
            placeholder="Una URL por linea"
          />
          {errors.images ? <p className="text-sm text-rose-600">{errors.images.message}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">Subir imagen a Storage</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full rounded-2xl border border-dashed border-line bg-white/70 px-4 py-3 text-sm text-muted"
          />
          <p className="text-xs text-muted">
            {uploadingImage ? "Subiendo imagen..." : "La URL se agregara automaticamente al campo de imagenes."}
          </p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Especificaciones tecnicas
          </span>
          <Textarea
            error={Boolean(errors.technicalSpecs)}
            {...register("technicalSpecs")}
            placeholder="Una por linea, usando etiqueta|valor"
          />
          {errors.technicalSpecs ? (
            <p className="text-sm text-rose-600">{errors.technicalSpecs.message}</p>
          ) : null}
        </label>

        <label className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white/70 px-4 py-3">
          <input type="checkbox" className="size-4 rounded border-line" {...register("featured")} />
          <span className="text-sm font-semibold text-foreground">Mostrar como destacado</span>
        </label>

        <Button fullWidth loading={isSubmitting} type="submit">
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </form>
    </div>
  );
}
