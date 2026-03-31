import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { serverEnv, isFirebaseAdminConfigured } from "@/server/env";

type FirebaseAdminCredentials = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getFirebaseAdminErrorMessage() {
  return "Firebase Admin no esta configurado. Completa FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY, o define FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH con el JSON de la cuenta de servicio.";
}

function readCredentialsFromServiceAccountFile(): FirebaseAdminCredentials | null {
  if (!serverEnv.firebaseAdminServiceAccountPath) {
    return null;
  }

  const resolvedPath = path.isAbsolute(serverEnv.firebaseAdminServiceAccountPath)
    ? serverEnv.firebaseAdminServiceAccountPath
    : path.join(
        /*turbopackIgnore: true*/ process.cwd(),
        serverEnv.firebaseAdminServiceAccountPath,
      );

  if (!existsSync(resolvedPath)) {
    throw new Error(
      `No se encontro el archivo de Firebase Admin en ${resolvedPath}. Revisa FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH.`,
    );
  }

  const fileContents = readFileSync(resolvedPath, "utf8");
  const parsedCredentials = JSON.parse(fileContents) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (
    !parsedCredentials.project_id ||
    !parsedCredentials.client_email ||
    !parsedCredentials.private_key
  ) {
    throw new Error(
      "El JSON de Firebase Admin no tiene project_id, client_email o private_key.",
    );
  }

  return {
    projectId: parsedCredentials.project_id,
    clientEmail: parsedCredentials.client_email,
    privateKey: parsedCredentials.private_key,
  };
}

function resolveFirebaseAdminCredentials(): FirebaseAdminCredentials | null {
  if (
    serverEnv.firebaseAdminProjectId &&
    serverEnv.firebaseAdminClientEmail &&
    serverEnv.firebaseAdminPrivateKey
  ) {
    return {
      projectId: serverEnv.firebaseAdminProjectId,
      clientEmail: serverEnv.firebaseAdminClientEmail,
      privateKey: serverEnv.firebaseAdminPrivateKey,
    };
  }

  return readCredentialsFromServiceAccountFile();
}

export function getFirebaseAdminApp() {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  const credentials = resolveFirebaseAdminCredentials();

  if (!credentials) {
    return null;
  }

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert(credentials),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  );
}

export function getAdminDb() {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error(getFirebaseAdminErrorMessage());
  }

  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error(getFirebaseAdminErrorMessage());
  }

  return getAuth(app);
}
