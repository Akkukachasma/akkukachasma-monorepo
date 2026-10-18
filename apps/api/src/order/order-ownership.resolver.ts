import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IOwnershipResolver } from '../rbac/interfaces';

export const ORDER_RESOURCE_TYPE = 'order';

/**
 * Resolves owner user id for order resources. Registered with RbacModule's OwnershipResolverRegistry.
 */
@Injectable()
export class OrderOwnershipResolver implements IOwnershipResolver {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnerId(resourceType: string, resourceId: string): Promise<string | null> {
    if (resourceType !== ORDER_RESOURCE_TYPE) return null;
    const order = await this.prisma.order.findUnique({
      where: { id: resourceId },
      select: { user_id: true },
    });
    return order?.user_id ?? null;
  }
}
