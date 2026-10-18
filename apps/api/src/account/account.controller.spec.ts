import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../token/token.service';

describe('AccountController', () => {
  let controller: AccountController;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        AccountService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: AuthService, useValue: mockService },
        { provide: TokenService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
