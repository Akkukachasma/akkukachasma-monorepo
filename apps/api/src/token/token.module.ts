import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token.service';
import { TokenCrons } from './token.crons';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TokenService, TokenCrons],
  exports: [TokenService],
})
export class TokenModule {}
