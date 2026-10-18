import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/** Request user (from AuthGuard). roles = role codes for @Roles() / API (e.g. ['admin'], ['customer']). */
export interface ITenant {
  email: string;
  id: string;
  created_at: Date;
  permissions?: string[];
  roles?: string[];
}

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
