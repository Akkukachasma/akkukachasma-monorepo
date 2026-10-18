import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ResendEmailVerificationLinkDto, SignupDto } from './dto/signup.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { PublicApi } from './decorators/public.decorator';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { TokenDto } from '../token/dto/token.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import {
  ERR_TYPES,
  MAX_AGES,
  TOKENS,
  TOKEN_DATA,
  TOKEN_EXPIRATIONS,
  TokensType,
} from '../../lib/constants';
import { ITenant, Tenant } from './decorators/tenant.decorator';
import {
  cookieEnvFromDevEnvironmentString,
  removeCookie,
  setCookie,
} from '../../lib/utils';
import { Tokens } from '../token/decorators/tokens.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { RbacService } from '../rbac/services/rbac.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { randomBytes } from 'crypto';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_AUTH_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_AUTH_MUTATION)
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  private static readonly GOOGLE_STATE_COOKIE = '_akgs';

  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService,
    private readonly configService: ConfigService,
  ) {}

  private cookieEnv() {
    return cookieEnvFromDevEnvironmentString(
      this.configService.get<string>('DEV_ENVIRONMENT'),
    );
  }

  private frontendOrigin(): string {
    const explicit = this.configService.get<string>('FRONTEND_URL')?.trim();
    if (explicit) return explicit;
    const origins = this.configService.get<string>('ALLOWED_ORIGINS') ?? '';
    const first = origins
      .split(',')
      .map((s) => s.trim())
      .find(Boolean);
    return first || 'http://localhost:3000';
  }

  private issueSessionCookies(
    response: Response,
    payload: ITenant,
    rememberMe = false,
  ) {
    const refreshTokenPayload = {
      type: TOKENS.refresh_token,
      data: payload,
    };
    const authTokenAge = rememberMe
      ? 1000 * 60 * 60 * 24 * 15
      : MAX_AGES[TOKENS.auth_token];
    const authToken = this.tokenService.generateToken(payload, {
      expiresIn: rememberMe ? '15d' : TOKEN_EXPIRATIONS[TOKENS.auth_token],
    });
    const refreshToken = this.tokenService.generateToken(refreshTokenPayload, {
      expiresIn: TOKEN_EXPIRATIONS[TOKENS.refresh_token],
    });

    setCookie(
      response,
      { data: authToken, name: TOKENS.auth_token, age: authTokenAge },
      this.cookieEnv(),
    );
    setCookie(
      response,
      {
        data: refreshToken,
        name: TOKENS.refresh_token,
        age: MAX_AGES[TOKENS.refresh_token],
      },
      this.cookieEnv(),
    );
    return { authToken, refreshToken, authTokenAge };
  }

  @PublicApi()
  @Post('signup')
  @ApiOperation({
    description: 'Creates a new user account.',
  })
  async signup(@Body() signupDto: SignupDto) {
    const exist = await this.authService.findUserByEmail(signupDto.email);
    if (exist)
      throw new BadRequestException(
        'An account already exists with same email. Please login.',
      );

    const created = await this.authService.createUser(signupDto);
    if (created)
      await this.authService.sendEmailAfterSignup({
        email: created.email,
        id: created.id,
      });

    return {
      success: true,
      message:
        'Registration successful. Verify your email by clicking the link sent to your email address.',
    };
  }

  @PublicApi()
  @Post('verfiy-email')
  @ApiOperation({
    description: `This API endpoint is used to verify a user's email by providing the token sent to their registered email ID during the signup process. Successful verification is required for users to proceed with the login process.`,
  })
  async verifyEmail(@Query() verifyEmailDto: TokenDto) {
    const payload: any = this.tokenService.verifyToken(verifyEmailDto.token);
    if (!payload)
      throw new UnauthorizedException({
        success: false,
        message:
          'Verification link is expired. Please request another verification link.',
        type: ERR_TYPES.token_expired,
      });

    const user = await this.authService.findUserByEmail(payload.email);
    if (!user)
      throw new NotFoundException({
        success: false,
        message: 'Verification failed no user exist with this email address.',
        type: ERR_TYPES.token_invalid,
      });

    if (user.email_verified) {
      throw new BadRequestException({
        success: true,
        message: 'Email is already verified. You can close this page.',
        type: ERR_TYPES.already_verified,
      });
    }

    await this.authService.verifyEmail(user.email, user.id);

    return { success: true, message: 'Email successfully verified.' };
  }

  @PublicApi()
  @Post('resend-verification-link')
  @ApiOperation({
    description: `Resends the email verification link to the user to the given email address.`,
  })
  async resendEmailVerificationLink(
    @Body() resendEmailVerificationLinkDto: ResendEmailVerificationLinkDto,
  ) {
    const user = await this.authService.findUserByEmail(
      resendEmailVerificationLinkDto.email,
    );
    if (!user)
      throw new BadRequestException({
        success: false,
        message: 'The user does not exist.',
      });
    if (user.email_verified)
      throw new BadRequestException('The eamil is already verified.');
    await this.authService.sendEmailAfterSignup({
      email: user.email,
      id: user.id,
      resending: true,
    });

    return { success: true, message: 'Verification link sent to your email.' };
  }

  @PublicApi()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const user = await this.authService.getValidUser(loginDto);

    const tokenPayload: ITenant = {
      id: user.id,
      email: user.email,
      roles: user.roles ?? [],
      created_at: user?.created_at,
    };

    const { authToken, refreshToken, authTokenAge } = this.issueSessionCookies(
      response,
      tokenPayload,
      loginDto.remember_me,
    );

    return response.status(HttpStatus.OK).json({
      success: true,
      data: {
        auth_token: {
          value: authToken,
          type: TOKENS.auth_token,
          life: Date.now() + authTokenAge,
        },
        refresh_token: refreshToken,
      },
      message: 'Logged in successfully.',
    });
  }

  @PublicApi()
  @Get('google')
  async googleAuthStart(@Res() response: Response) {
    const state = randomBytes(24).toString('hex');
    response.cookie(AuthController.GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !this.cookieEnv().isDevEnvironment,
      path: '/',
      maxAge: 1000 * 60 * 10,
    });
    return response.redirect(`/v1/auth/google/redirect?state=${encodeURIComponent(state)}`);
  }

  @PublicApi()
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect() {
    return;
  }

  @PublicApi()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() response: Response) {
    const stateFromCookie = req.cookies?.[AuthController.GOOGLE_STATE_COOKIE];
    const stateFromQuery = typeof req.query?.state === 'string' ? req.query.state : '';
    response.clearCookie(AuthController.GOOGLE_STATE_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !this.cookieEnv().isDevEnvironment,
      path: '/',
    });

    if (!stateFromCookie || !stateFromQuery || stateFromCookie !== stateFromQuery) {
      throw new UnauthorizedException('OAuth state validation failed.');
    }

    const googleProfile = req.user as {
      email?: string;
      googleId?: string;
      firstName?: string;
      lastName?: string;
    };
    if (!googleProfile?.email || !googleProfile?.googleId) {
      throw new UnauthorizedException('Google authentication payload is invalid.');
    }

    const user = await this.authService.validateGoogleUser({
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
    });

    const tokenPayload: ITenant = {
      id: user.id,
      email: user.email,
      roles: user.roles ?? [],
      created_at: user.created_at,
    };
    this.issueSessionCookies(response, tokenPayload);

    return response.redirect(this.frontendOrigin());
  }

  @Get('/details')
  @Cacheable({ ttl: 60, scope: 'user' })
  async getLoggedUserDetails(@Tenant() tenant: ITenant) {
    const details = await this.authService.findUserByEmail(tenant.email);
    if (!details) {
      return { success: false, data: null };
    }
    const roles =
      (details as any)?.user_roles?.map((ur: any) => ur.role?.code).filter(Boolean) ?? [];
    const permissions = await this.rbacService.getPermissionsForUser(details.id);
    return {
      success: true,
      data: {
        ...details,
        roles,
        permissions,
      },
    };
  }

  @PublicApi()
  @Post('/forgot')
  async sendForgotEmail(@Body() forgotDto: ForgotPasswordDto) {
    const user = await this.authService.findUserByEmail(forgotDto.email);

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User does not exists.',
      });
    }

    const token = this.tokenService.generateToken(user, { expiresIn: '48h' });
    const htmlBody = `
            <p>Hi ${user.name},</p>
            <p>Please click the link below to reset your password. If you did not make this request, please ignore this email. This link is valid for 48 hours.</p>
        `;
    const href = `reset-password?token=${token}`;
    try {
      await this.mailService.sendEmail({
        to: forgotDto.email,
        body: htmlBody,
        closure: 'Thanks and regards',
        ctaLabel: `Reset Password`,
        href,
        subject: `Reset Password`,
        template_name: 'primary',
      });
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Something went wrong.',
        error,
      });
    }

    return {
      success: true,
      data: { email: forgotDto.email },
      message: `A password reset link is sent to your email address.`,
    };
  }

  @PublicApi()
  @Put('/reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query() tokenDto: TokenDto,
  ) {
    // check for authenticity of token
    const tokenBlacklisted = await this.tokenService.findToken({
      token: tokenDto.token,
    });

    if (tokenBlacklisted)
      throw new BadRequestException({
        success: false,
        message:
          'The link has been used kindly request again for resetting your password.',
      });

    // extract data from token
    const payload: any = this.tokenService.verifyToken(tokenDto.token);
    if (!payload)
      throw new UnauthorizedException({
        success: false,
        message:
          'Reset password link is expired. Please request another reset link.',
      });

    const { id, is_owner, iat, exp } = payload || {};

    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'Owner does not exist.',
      });
    }

    await this.prisma.$transaction(
      async (prisma) => {
        await this.authService.resetPassword({
          data: resetPasswordDto,
          id,
          is_owner,
          prisma,
        });
        await this.tokenService.blacklistToken({
          token: tokenDto.token,
          iat,
          exp,
          prisma,
        });
      },
      { timeout: 20000, maxWait: 5000 },
    );

    return { success: true, message: 'Password reset successfully.' };
  }

  @Get('refresh-token')
  refreshToken(
    @Query() refreshTokenDto: RefreshTokenDto,
    @Tokens() tokens: TokensType,
    @Tenant() tenant: ITenant,
    @Res() response: Response,
  ) {
    if (!tokens[TOKENS.refresh_token])
      throw new UnauthorizedException({
        success: false,
        message: 'Refresh token not found',
      });
    const refreshPayload = this.tokenService.getRefreshPayload(
      tokens[TOKENS.refresh_token],
      tenant.id,
    );

    const new_token: TOKEN_DATA = {};

    if (refreshTokenDto.type === TOKENS.auth_token) {
      new_token.value = this.tokenService.generateToken(refreshPayload.data);
      new_token.life = Date.now() + MAX_AGES[TOKENS.auth_token];
      new_token.type = TOKENS.auth_token;
      setCookie(
        response,
        { data: new_token.value, name: TOKENS.auth_token },
        this.cookieEnv(),
      );
    }

    const new_refresh_token = this.tokenService.generateToken(
      { type: TOKENS.refresh_token, data: refreshPayload.data },
      { expiresIn: TOKEN_EXPIRATIONS[TOKENS.refresh_token] },
    );
    setCookie(
      response,
      {
        name: TOKENS.refresh_token,
        data: new_refresh_token,
        age: MAX_AGES[TOKENS.refresh_token],
      },
      this.cookieEnv(),
    );

    response.status(HttpStatus.OK).json({
      success: true,
      data: {
        new_token: new_token,
        refresh_token: new_refresh_token,
      },
    });
  }

  @Delete('logout')
  @ApiOperation({
    description: 'Used to delete the session. Only works with web browsers.',
  })
  async logout(@Tokens() tokens: TokensType, @Res() response: Response) {
    for (const token in tokens) {
      removeCookie(response, token, this.cookieEnv());
      try {
        const decoded: any = this.tokenService.verifyToken(tokens[token]);
        if (decoded) {
          await this.tokenService.blacklistToken({
            token: tokens[token],
            iat: decoded.iat,
            exp: decoded.exp,
          });
        }
      } catch (error) {
        Logger.log('Error while blacklisting tokens', 'AuthController');
      }
    }
    return response
      .status(HttpStatus.OK)
      .json({ success: true, message: 'Successfully logged out.' });
  }
}
