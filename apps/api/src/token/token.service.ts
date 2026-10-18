import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ERR_TYPES, TOKENS, TOKEN_EXPIRATIONS } from '../../lib/constants';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';

interface IBlacklistToken extends IWithTransactionClient {
  token: string;
  iat: number;
  exp: number;
}
interface IFindToken extends IWithTransactionClient {
  token: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.config.getOrThrow<string>('SECRET_KEY'));
    } catch (error) {
      console.log(error, 'error');
      throw new BadRequestException({
        success: false,
        message: 'Invalid token.',
        type: ERR_TYPES.token_invalid,
      });
    }
  }

  generateToken(payload: any, options?: jwt.SignOptions) {
    return jwt.sign(payload, this.config.getOrThrow<string>('SECRET_KEY'), {
      expiresIn: TOKEN_EXPIRATIONS[TOKENS.auth_token],
      ...(options && options),
    });
  }

  getRefreshPayload(refresh_token: string, id: string) {
    const payload: any = this.verifyToken(refresh_token);
    if (payload.type !== TOKENS.refresh_token)
      throw new UnauthorizedException({
        success: false,
        message: 'Refresh token is not valid.',
      });
    if (payload.data.id !== id)
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid user requesting refresh action.',
      });
    return payload;
  }

  async findToken({ token, prisma }: IFindToken) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.token.findUnique({ where: { token } });
  }

  async blacklistToken({ token, iat, exp, prisma }: IBlacklistToken) {
    const PRISMA = prisma || this.prisma;

    try {
      const tkn = await this.findToken({ token, prisma: PRISMA });
      if (!tkn) {
        await this.prisma.token.create({
          data: {
            token,
            iat,
            exp,
          },
        });
      }
    } catch (error) {
      Logger.log('Error blacklisting token', 'TokenService');
    }
  }
}
