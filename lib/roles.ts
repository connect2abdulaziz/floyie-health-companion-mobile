/**
 * User/role types for wellness app (non-medical).
 */
export type UserRole = "user" | "coach" | "admin";

export const ROLES: Record<UserRole, string> = {
  user: "User",
  coach: "Coach",
  admin: "Admin",
};
