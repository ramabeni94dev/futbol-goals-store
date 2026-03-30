import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { normalizeDate } from "@/lib/utils";
import { UserProfile, UserRole } from "@/types";

const COLLECTION_NAME = "users";

export async function ensureUserProfile(input: {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
}) {
  if (!db) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  await setDoc(
    doc(db, COLLECTION_NAME, input.uid),
    {
      uid: input.uid,
      name: input.name,
      email: input.email,
      role: input.role ?? "customer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid: string) {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, COLLECTION_NAME, uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<UserProfile> & { createdAt?: unknown };

  return {
    uid: data.uid ?? uid,
    name: data.name ?? "",
    email: data.email ?? "",
    role: data.role ?? "customer",
    createdAt: normalizeDate(data.createdAt),
  } satisfies UserProfile;
}
