import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
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

function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });
  return provider;
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

export async function loginWithGoogle() {
  const authInstance = assertAuth();
  const credentials = await signInWithPopup(authInstance, getGoogleProvider());
  const email = credentials.user.email ?? "";
  const profile = await getUserProfile(credentials.user.uid);

  if (!profile) {
    await ensureUserProfile({
      uid: credentials.user.uid,
      name:
        credentials.user.displayName ??
        fallbackNameFromEmail(email || "usuario@gmail.com"),
      email,
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

export async function requestPasswordReset(input: {
  email: string;
  continueUrl?: string;
}) {
  const authInstance = assertAuth();
  const continueUrl =
    input.continueUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "http://localhost:3000/login");

  await sendPasswordResetEmail(authInstance, input.email, {
    url: continueUrl,
    handleCodeInApp: false,
  });
}
