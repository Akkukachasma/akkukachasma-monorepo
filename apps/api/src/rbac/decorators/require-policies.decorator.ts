import { SetMetadata } from '@nestjs/common';

export const REQUIRE_POLICIES_KEY = 'rbac:require_policies';

/**
 * Require that the named policies pass (for future policy evaluator).
 * Use with PolicyGuard when named policies are introduced.
 */
export const RequirePolicies = (...policyNames: string[]) =>
  SetMetadata(REQUIRE_POLICIES_KEY, policyNames);
