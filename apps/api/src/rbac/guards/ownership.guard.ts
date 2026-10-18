import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OwnershipResolverRegistry } from '../services/ownership-resolver.registry';
import { RbacService } from '../services/rbac.service';
import { CHECK_OWNERSHIP_KEY } from '../decorators/check-ownership.decorator';
import { ICheckOwnershipOptions } from '../interfaces';

/**
 * Guard: allow only if the current user owns the resource, or is admin (role-based bypass).
 * Permission layer runs first; ownership is enforced here. No special "read_any" permissions.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ownershipRegistry: OwnershipResolverRegistry,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<ICheckOwnershipOptions>(
      CHECK_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options?.resourceType || !options?.paramKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.roles?.includes('admin')) {
      return true;
    }

    const resourceId = request.params?.[options.paramKey];
    if (!resourceId) {
      throw new ForbiddenException('Resource id not found in request');
    }

    const ownerId = await this.ownershipRegistry.getOwnerId(options.resourceType, resourceId);
    if (ownerId === null) {
      throw new ForbiddenException('Resource not found or access denied');
    }

    if (ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return true;
  }
}
