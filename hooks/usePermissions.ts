import { useAuth } from "./useAuth";
import type { UserRole } from "@/lib/roles";
import * as permissions from "@/lib/permissions";

/**
 * Resolve role from session (e.g. app_metadata.role). Default to "user".
 */
function getRoleFromSession(role?: string): UserRole {
  if (role === "coach" || role === "admin") return role;
  return "user";
}

export function usePermissions() {
  const { session } = useAuth();
  const role: UserRole = getRoleFromSession(session?.user?.app_metadata?.role);

  return {
    role,
    canViewInsights: permissions.canViewInsights(role),
    canManageUsers: permissions.canManageUsers(role),
  };
}
