import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/lib/firebase/config";
import { ensureUserProfile, getUserProfile } from "@/services/users";

function assertAuth() {
  if (!auth) {
    throw new Error("Firebase no esta configurado. Completa las variables de entorno.");
  }

  return auth;
}

function fallbackNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "usuario";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export async function loginWithEmail(input: { email: string; password: string }) {
  const authInstance = assertAuth();
  const credentials = await signInWithEmailAndPassword(
    authInstance,
    input.email,
    input.password,
  );

  const profile = await getUserProfile(credentials.user.uid);

  if (!profile) {
    await ensureUserProfile({
      uid: credentials.user.uid,
      name: credentials.user.displayName ?? fallbackNameFromEmail(input.email),
      email: input.email,
    });
  }

  return credentials.user;
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  password: string;
}) {
  const authInstance = assertAuth();
  const credentials = await createUserWithEmailAndPassword(
    authInstance,
    input.email,
    input.password,
  );

  await updateProfile(credentials.user, {
    displayName: input.name,
  });

  await ensureUserProfile({
    uid: credentials.user.uid,
    name: input.name,
    email: input.email,
  });

  return credentials.user;
}

export async function logoutUser() {
  const authInstance = assertAuth();
  await signOut(authInstance);
}
