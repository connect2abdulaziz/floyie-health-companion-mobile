import type { UserRole } from "./roles";

/**
 * Simple permission checks by role (wellness app, non-medical).
 */
export function canViewInsights(role: UserRole): boolean {
  return true;
}

export function canManageUsers(role: UserRole): boolean {
  return role === "admin" || role === "coach";
}
