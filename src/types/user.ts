export const userRoles = ["admin", "customer"] as const;

export type UserRole = (typeof userRoles)[number];

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}
