import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase/config";
import { slugify } from "@/lib/utils";

export async function uploadProductImage(file: File) {
  if (!storage) {
    throw new Error("Firebase Storage no esta configurado. Completa las variables de entorno.");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const fileName = slugify(file.name.replace(/\.[^.]+$/, ""));
  const fileRef = ref(storage, `products/${Date.now()}-${fileName}.${extension}`);

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
}
