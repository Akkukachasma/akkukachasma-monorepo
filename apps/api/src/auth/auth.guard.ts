import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TOKENS } from '../../lib/constants';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { RbacService } from '../rbac/services/rbac.service';
import { PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // If route is public, allow it no matter what
    if (isPublic) {
      // But still try to attach user if token is present
      if (token) {
        await this.attachUserIfValid(request, token);
      }
      return true;
    }

    // For protected routes, token must be valid
    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication token not found.',
      });
    }

    await this.attachUserIfValid(request, token, true);
    return true;
  }

  private async attachUserIfValid(
    request: Request,
    token: string,
    strict = false, // if true, throw on failure
  ) {
    try {
      const payload: any = this.tokenService.verifyToken(token);
      if (!payload?.id) throw new Error('Invalid token payload');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) throw new Error('User not found');

      const [permissions, roles] = await Promise.all([
        this.rbacService.getPermissionsForUser(user.id),
        this.rbacService.getRolesForUser(user.id),
      ]);

      request['user'] = {
        ...user,
        permissions,
        roles,
      };
    } catch (error) {
      if (strict) {
        throw new UnauthorizedException({
          success: false,
          message: 'Access denied !!',
        });
      }
      // If not strict (i.e. public route), silently skip attaching
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    try {
      return (
        request.cookies[TOKENS.auth_token] ||
        request.headers['authorization']?.split(' ')[1] ||
        null
      );
    } catch {
      return null;
    }
  }
}
