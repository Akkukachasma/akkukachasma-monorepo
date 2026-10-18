import { compareString, hashString } from '../../lib/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { RbacService } from '../rbac/services/rbac.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { TokenService } from '../token/token.service';
import { MailService } from '../mail/mail.service';
import dayjs from '../../lib/custom-dayjs';
import { ResetPasswordDto } from './dto/password.dto';

interface IResetPassword extends IWithTransactionClient {
  data: ResetPasswordDto;
  id: string;
  is_owner?: boolean;
}

interface ISendEmailAfterSignup {
  email: string;
  id: string;
  resending?: boolean;
}

export interface GoogleUserProfile {
  email: string;
  googleId: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private tokenService: TokenService,
    private mailService: MailService,
    private readonly rbacService: RbacService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        avatar: {
          select: this.prisma.getFileSelection()
        },
        user_roles: {
          select: { role: true }
        }
      },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { avatar: { select: this.prisma.getFileSelection() } },
    });
  }

  async createUser(data: SignupDto) {
    const { credentials, ...rest } = data;
    credentials.password = await hashString(credentials.password);
    const customerRole = await this.prisma.role.findUnique({
      where: { code: 'customer' },
    });
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        credentials: {
          create: credentials,
        },
        ...(customerRole && {
          user_roles: {
            create: { role_id: customerRole.id },
          },
        }),
      },
      select: {
        id: true,
        email: true,
      },
    });
    return user;
  }

  async sendEmailAfterSignup({ email, id, resending }: ISendEmailAfterSignup) {
    const token = this.tokenService.generateToken(
      { id, email: email },
      { expiresIn: '1d' },
    );
    const href = `verify-email?token=${token}&email=${email}`;
    const bodyHTML = resending
      ? `
        Greetings from Akku ka chasma. We are glad that you chose us. This email is sent to you by request; igonre this email if you didn't requested.
        `
      : `
                Greetings from Akku ka chasma. We are glad that you chose us. Please verify your account to access the website.
        `;

    await this.mailService.sendEmail({
      to: email,
      body: bodyHTML,
      closure: 'Thanks and regards',
      ctaLabel: 'Click to verify',
      href: href,
      subject: 'Account Email Verification',
      template_name: 'primary',
    });
  }

  async verifyEmail(email: string, user_id: string) {
    await this.prisma.user.update({
      where: { id: user_id, email },
      data: { email_verified: dayjs().format() },
    });
  }

  async getValidUser(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { credentials: true },
    });

    if (!user) {
      this.activityLogger.logWarning(
        'Auth: login failed - invalid credentials',
        `No user found for email: ${loginDto.email}`,
        { source: 'auth', email: loginDto.email },
      );
      throw new BadRequestException('Invalid credentials');
    }

    if (user.deleted_at) {
      this.activityLogger.logWarning(
        'Auth: login blocked - account deleted',
        `Blocked account attempted login: ${user.email}`,
        { source: 'auth', user_id: user.id },
      );
      throw new BadRequestException({
        success: false,
        message: 'Your account has been blocked by the administrator.',
      });
    }

    const roles = await this.rbacService.getRolesForUser(user.id);
    const isAdmin = roles.includes('admin');
    if (!isAdmin && !user.email_verified) {
      this.activityLogger.logWarning(
        'Auth: login blocked - email not verified',
        `Unverified email attempted login: ${user.email}`,
        { source: 'auth', user_id: user.id },
      );
      throw new BadRequestException({
        success: false,
        message:
          'Please verify your email by following the link sent to you at your email address.',
      });
    }

    const passwordCorrect = await compareString(
      loginDto.password,
      user.credentials.password,
    );

    if (!passwordCorrect) {
      this.activityLogger.logWarning(
        'Auth: login failed - wrong password',
        `Invalid password for: ${user.email}`,
        { source: 'auth', user_id: user.id },
      );
      throw new BadRequestException('Invalid credentials');
    }

    const { credentials: _, ...rest } = user;
    return { ...rest, roles };
  }

  async resetPassword({ data, id, prisma }: IResetPassword) {
    const PRISMA = prisma || this.prisma;
    await PRISMA.credential.update({
      where: { user_id: id },
      data: {
        password: await hashString(data.new_password),
      },
    });
  }

  async validateGoogleUser(profile: GoogleUserProfile) {
    if (!profile.email) {
      throw new BadRequestException('Google account email is required');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      const customerRole = await this.prisma.role.findUnique({
        where: { code: 'customer' },
      });
      const fullName = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: fullName || profile.email.split('@')[0] || 'Google User',
          agree_t_and_c: true,
          email_verified: dayjs().format(),
          ...(customerRole && {
            user_roles: {
              create: { role_id: customerRole.id },
            },
          }),
        },
      });
    }

    if (user.deleted_at) {
      throw new BadRequestException({
        success: false,
        message: 'Your account has been blocked by the administrator.',
      });
    }

    const roles = await this.rbacService.getRolesForUser(user.id);
    return { ...user, roles };
  }
}
