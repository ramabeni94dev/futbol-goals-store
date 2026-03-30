import { normalizeDate } from "@/lib/utils";
import { UserProfile } from "@/types";

export function mapUserProfileRecord(
  uid: string,
  payload: Partial<UserProfile> & { createdAt?: unknown; updatedAt?: unknown },
): UserProfile {
  return {
    uid: payload.uid ?? uid,
    name: payload.name ?? "",
    email: payload.email ?? "",
    role: payload.role ?? "customer",
    emailVerified: Boolean(payload.emailVerified),
    createdAt: normalizeDate(payload.createdAt),
    updatedAt: normalizeDate(payload.updatedAt ?? payload.createdAt),
  };
}
