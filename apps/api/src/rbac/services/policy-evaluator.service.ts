import { Injectable } from '@nestjs/common';
import { IRbacUser } from '../interfaces';
import { ROLE_PERMISSIONS } from '../constants';

/**
 * Resolves permissions for a role and evaluates permission checks.
 * No business logic; pure role → permissions mapping.
 */
@Injectable()
export class PolicyEvaluatorService {
  /**
   * Returns the list of permissions for the given role.
   * Role is normalized to lowercase for lookup.
   */
  getPermissionsForRole(role: string): string[] {
    const normalized = (role ?? '').toLowerCase();
    return ROLE_PERMISSIONS[normalized] ?? [];
  }

  /**
   * Returns true if the user has at least one of the required permissions.
   */
  hasAnyPermission(user: IRbacUser, requiredPermissions: string[]): boolean {
    if (!requiredPermissions?.length) return true;
    const userPermissions = this.getPermissionsForRole(user.role);
    return requiredPermissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Returns true if the user has all of the required permissions.
   */
  hasAllPermissions(user: IRbacUser, requiredPermissions: string[]): boolean {
    if (!requiredPermissions?.length) return true;
    const userPermissions = this.getPermissionsForRole(user.role);
    return requiredPermissions.every((p) => userPermissions.includes(p));
  }
}
