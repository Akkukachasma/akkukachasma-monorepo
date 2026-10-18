"use client";

import { useMemo } from "react";
import { useLoggedInUser } from "@/features/auth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/permissions";

/**
 * Hook to get current user's permissions for UI gating (PermissionGuard, etc.).
 * Permissions come from auth/details (MongoDB).
 */
export const usePermissions = () => {
  const { data: user } = useLoggedInUser();

  const permissions = useMemo(
    () => (user as { permissions?: string[] })?.permissions ?? [],
    [user]
  );

  return {
    permissions: permissions as string[],
    hasPermission: (permission: string | string[]) =>
      hasPermission(permissions, permission),
    hasAnyPermission: (requiredPermissions: string[]) =>
      hasAnyPermission(permissions, requiredPermissions),
    hasAllPermissions: (requiredPermissions: string[]) =>
      hasAllPermissions(permissions, requiredPermissions),
    isLoading: user === undefined,
  };
};
