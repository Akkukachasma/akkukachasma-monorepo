import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { MailService } from '../mail/mail.service';
import { RbacService } from '../rbac/services/rbac.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: RbacService, useValue: {} },
        { provide: ActivityLoggerService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
