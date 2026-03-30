import "server-only";

import { mapUserProfileRecord } from "@/lib/serializers/user";
import { getAdminDb } from "@/server/firebase-admin";
import { UserProfile } from "@/types";

const COLLECTION_NAME = "users";

export async function getUserProfileByIdServer(uid: string) {
  const snapshot = await getAdminDb().collection(COLLECTION_NAME).doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapUserProfileRecord(snapshot.id, snapshot.data() as Partial<UserProfile>);
}
