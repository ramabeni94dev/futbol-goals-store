function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readPrivateKey(name: string) {
  return readEnv(name).replace(/\\n/g, "\n");
}

export const serverEnv = {
  appUrl: readEnv("NEXT_PUBLIC_SITE_URL") || readEnv("APP_URL") || "http://localhost:3000",
  firebaseAdminProjectId: readEnv("FIREBASE_ADMIN_PROJECT_ID"),
  firebaseAdminClientEmail: readEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
  firebaseAdminPrivateKey: readPrivateKey("FIREBASE_ADMIN_PRIVATE_KEY"),
};

export function isFirebaseAdminConfigured() {
  return Boolean(
    serverEnv.firebaseAdminProjectId &&
      serverEnv.firebaseAdminClientEmail &&
      serverEnv.firebaseAdminPrivateKey,
  );
}
