import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  reload,
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

async function postAuthAction(path: string, input: {
  token?: string;
  body?: Record<string, unknown>;
}) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(input.token ? { authorization: `Bearer ${input.token}` } : {}),
    },
    body: JSON.stringify(input.body ?? {}),
  });

  if (!response.ok) {
    const payload = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    throw new Error(payload.error?.message ?? "No se pudo completar la accion.");
  }
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
      emailVerified: credentials.user.emailVerified,
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
      emailVerified: credentials.user.emailVerified,
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
    emailVerified: credentials.user.emailVerified,
  });

  try {
    await postAuthAction("/api/auth/email-verification", {
      token: await credentials.user.getIdToken(),
    });
  } catch (error) {
    console.error("Unable to send verification email after registration", error);
  }

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
  await postAuthAction("/api/auth/password-reset", {
    body: {
      email: input.email,
    },
  });
}

export async function requestEmailVerification(input?: { token?: string }) {
  if (input?.token) {
    await postAuthAction("/api/auth/email-verification", {
      token: input.token,
    });
    return;
  }

  const authInstance = assertAuth();
  const currentUser = authInstance.currentUser;

  if (!currentUser) {
    throw new Error("Necesitas una sesion activa para reenviar la verificacion.");
  }

  await reload(currentUser);
  await postAuthAction("/api/auth/email-verification", {
    token: await currentUser.getIdToken(true),
  });
}
