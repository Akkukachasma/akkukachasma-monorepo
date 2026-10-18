import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../services/rbac.service';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Guard that allows access if the user has at least one of the required permissions.
 * Permissions are read from request.user.permissions (set by AuthGuard from DB).
 * Run after AuthGuard so request.user is set.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    let permissions: string[] = user.permissions;
    if (!Array.isArray(permissions)) {
      permissions = await this.rbacService.getPermissionsForUser(user.id);
    }

    const allowed = requiredPermissions.some((p) => permissions.includes(p));
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
