import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { serverEnv, isFirebaseAdminConfigured } from "@/server/env";

export function getFirebaseAdminApp() {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: serverEnv.firebaseAdminProjectId,
        clientEmail: serverEnv.firebaseAdminClientEmail,
        privateKey: serverEnv.firebaseAdminPrivateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  );
}

export function getAdminDb() {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error(
      "Firebase Admin no esta configurado. Completa FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error(
      "Firebase Admin no esta configurado. Completa FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  return getAuth(app);
}
