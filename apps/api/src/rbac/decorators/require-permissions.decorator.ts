import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'rbac:require_permissions';

/**
 * Require at least one of the given permissions (resolved from user role).
 * Use with PermissionGuard.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
