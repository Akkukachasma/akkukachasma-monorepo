import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GUEST_SESSION_COOKIE } from '../../../lib/constants';

/**
 * Extracts _aksid (guest session) from request cookies.
 * Returns string | undefined - undefined if not present.
 */
export const GuestSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies?.[GUEST_SESSION_COOKIE];
  },
);
