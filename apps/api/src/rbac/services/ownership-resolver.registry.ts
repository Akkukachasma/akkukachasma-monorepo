import { Injectable } from '@nestjs/common';
import { IOwnershipResolver } from '../interfaces';

/**
 * Registry of ownership resolvers per resource type.
 * Domain modules (e.g. OrderModule) register a resolver for their resource type.
 */
@Injectable()
export class OwnershipResolverRegistry {
  private readonly resolvers = new Map<string, IOwnershipResolver>();

  register(resourceType: string, resolver: IOwnershipResolver): void {
    this.resolvers.set(resourceType, resolver);
  }

  getResolver(resourceType: string): IOwnershipResolver | undefined {
    return this.resolvers.get(resourceType);
  }

  async getOwnerId(resourceType: string, resourceId: string): Promise<string | null> {
    const resolver = this.resolvers.get(resourceType);
    if (!resolver) {
      return null;
    }
    return resolver.getOwnerId(resourceType, resourceId);
  }
}
