"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string | string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Conditionally renders children based on user permissions.
 * Use for hiding buttons, sections, etc. that the user lacks permission for.
 */
export const PermissionGuard = ({
  children,
  permission,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
    usePermissions();

  if (isLoading) {
    return null;
  }

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
