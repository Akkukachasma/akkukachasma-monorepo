import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../token/token.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, PrismaService, FileService, BucketService],
})
export class AccountModule {}
