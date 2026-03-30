import "server-only";

import { DecodedIdToken } from "firebase-admin/auth";

import { getUserProfileByIdServer } from "@/repositories/server-users-repository";
import { AuthenticationError, AuthorizationError } from "@/server/errors";
import { getAdminAuth } from "@/server/firebase-admin";
import { UserProfile } from "@/types";

function extractBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function requireAuthenticatedUser(request: Request): Promise<{
  token: DecodedIdToken;
  profile: UserProfile | null;
}> {
  const bearerToken = extractBearerToken(request);

  if (!bearerToken) {
    throw new AuthenticationError("Falta el token de autenticacion.");
  }

  const decodedToken = await getAdminAuth().verifyIdToken(bearerToken);
  const profile = await getUserProfileByIdServer(decodedToken.uid);

  return {
    token: decodedToken,
    profile,
  };
}

export async function requireAdminUser(request: Request) {
  const auth = await requireAuthenticatedUser(request);

  if (auth.profile?.role !== "admin") {
    throw new AuthorizationError();
  }

  return auth;
}
