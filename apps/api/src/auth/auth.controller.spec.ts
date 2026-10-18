import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../rbac/services/rbac.service';
import { createMockConfigService } from '../test/mock-config.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: RbacService, useValue: {} },
        { provide: ConfigService, useValue: createMockConfigService() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
