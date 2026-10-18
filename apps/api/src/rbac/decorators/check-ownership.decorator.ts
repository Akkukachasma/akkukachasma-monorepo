import { SetMetadata } from '@nestjs/common';
import { ICheckOwnershipOptions } from '../interfaces';

export const CHECK_OWNERSHIP_KEY = 'rbac:check_ownership';

/**
 * Require that the current user owns the resource (or is admin; admin bypasses ownership).
 * Use with OwnershipGuard after RequirePermissions: permission first, then ownership.
 */
export const CheckOwnership = (options: ICheckOwnershipOptions) =>
  SetMetadata(CHECK_OWNERSHIP_KEY, options);
