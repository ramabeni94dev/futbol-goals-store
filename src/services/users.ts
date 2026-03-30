import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { mapUserProfileRecord } from "@/lib/serializers/user";
import { UserProfile, UserRole } from "@/types";

const COLLECTION_NAME = "users";

export async function ensureUserProfile(input: {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
  emailVerified?: boolean;
}) {
  const database = db;

  if (!database) {
    throw new Error("Firebase no esta configurado. Carga las variables de entorno.");
  }

  await setDoc(
    doc(database, COLLECTION_NAME, input.uid),
    {
      uid: input.uid,
      name: input.name,
      email: input.email,
      role: input.role ?? "customer",
      emailVerified: input.emailVerified ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid: string) {
  const database = db;

  if (!database) {
    return null;
  }

  const snapshot = await getDoc(doc(database, COLLECTION_NAME, uid));
  if (!snapshot.exists()) {
    return null;
  }

  return mapUserProfileRecord(
    uid,
    snapshot.data() as Partial<UserProfile> & { createdAt?: unknown; updatedAt?: unknown },
  );
}
