/**
 * Permission helpers for RBAC. Admin has "*" (all permissions).
 * Permission codes come from auth/details (MongoDB).
 */

/**
 * Check if user has a specific permission.
 * Admin with "*" is treated as having all permissions.
 */
export const hasPermission = (
  userPermissions: string[] | undefined,
  requiredPermission: string | string[],
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  if (userPermissions.includes("*")) {
    return true;
  }
  const permissionSet = new Set(userPermissions);
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.every((perm) => permissionSet.has(perm));
  }
  return permissionSet.has(requiredPermission);
};

/**
 * Check if user has ANY of the specified permissions (OR logic).
 */
export const hasAnyPermission = (
  userPermissions: string[] | undefined,
  requiredPermissions: string[],
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  if (userPermissions.includes("*")) {
    return true;
  }
  const permissionSet = new Set(userPermissions);
  return requiredPermissions.some((perm) => permissionSet.has(perm));
};

/**
 * Check if user has ALL of the specified permissions (AND logic).
 */
export const hasAllPermissions = (
  userPermissions: string[] | undefined,
  requiredPermissions: string[],
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  if (userPermissions.includes("*")) {
    return true;
  }
  const permissionSet = new Set(userPermissions);
  return requiredPermissions.every((perm) => permissionSet.has(perm));
};
