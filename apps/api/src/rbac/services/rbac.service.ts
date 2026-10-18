import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Fetches user's permissions and roles from DB (UserRole -> Role -> RolePermission -> Permission).
 * Used by AuthGuard to attach permissions/roles to request.user and by PermissionGuard when not pre-attached.
 */
@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns distinct permission codes for the user (from all their roles).
   */
  async getPermissionsForUser(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId, role: { is_active: true } },
      include: {
        role: {
          include: {
            role_permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const codes = new Set<string>();
    for (const ur of userRoles) {
      if (!ur.role) continue;
      for (const rp of ur.role.role_permissions ?? []) {
        if (rp.permission?.code) codes.add(rp.permission.code);
      }
    }
    return Array.from(codes);
  }

  /**
   * Returns distinct role codes for the user.
   */
  async getRolesForUser(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId, role: { is_active: true } },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role?.code).filter(Boolean) as string[];
  }

  /** User IDs that have an active role with the given code (e.g. `admin`). */
  async getUserIdsWithRoleCode(roleCode: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: {
        role: { code: roleCode, is_active: true },
      },
      select: { user_id: true },
    });
    return rows.map((r) => r.user_id);
  }

  /**
   * Primary role: system role if any, else first role. For backward compat (e.g. API returning "type").
   */
  async getPrimaryRoleForUser(userId: string): Promise<string | null> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { user_id: userId, role: { is_active: true } },
      include: { role: true },
    });
    // Prefer system role first, then first role
    const sorted = [...userRoles].sort(
      (a, b) => (b.role?.is_system_role ? 1 : 0) - (a.role?.is_system_role ? 1 : 0),
    );
    const first = sorted.find((ur) => ur.role?.code);
    return first?.role?.code ?? null;
  }

  /**
   * Returns true if the user has at least one of the given permission codes.
   */
  async userHasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    if (!permissionCodes?.length) return true;
    const userPermissions = await this.getPermissionsForUser(userId);
    return permissionCodes.some((p) => userPermissions.includes(p));
  }
}
