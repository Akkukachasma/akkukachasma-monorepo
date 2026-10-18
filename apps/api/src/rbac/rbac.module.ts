import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PolicyEvaluatorService } from './services/policy-evaluator.service';
import { RbacService } from './services/rbac.service';
import { OwnershipResolverRegistry } from './services/ownership-resolver.registry';
import { PermissionGuard } from './guards/permission.guard';
import { OwnershipGuard } from './guards/ownership.guard';

/**
 * RBAC module: permissions/roles from DB, ownership, guards, decorators.
 * Global so decorators/guards can be used in any module without importing RbacModule.
 * Domain modules register ownership resolvers via OwnershipResolverRegistry.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RbacService,
    PolicyEvaluatorService,
    OwnershipResolverRegistry,
    PermissionGuard,
    OwnershipGuard,
  ],
  exports: [
    RbacService,
    PolicyEvaluatorService,
    OwnershipResolverRegistry,
    PermissionGuard,
    OwnershipGuard,
  ],
})
export class RbacModule {}
