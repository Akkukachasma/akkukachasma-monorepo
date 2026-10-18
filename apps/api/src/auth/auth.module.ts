import { Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
    imports: [TokenModule, MailModule, PrismaModule, PassportModule.register({ session: false })],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy, GoogleAuthGuard],
    exports: [AuthService],
})
export class AuthModule { }
