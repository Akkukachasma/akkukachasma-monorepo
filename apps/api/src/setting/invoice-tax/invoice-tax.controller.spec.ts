import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTaxController } from './invoice-tax.controller';
import { InvoiceTaxService } from './invoice-tax.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { createMockCacheService } from '../../test/mock-cache.service';

describe('InvoiceTaxController', () => {
  let controller: InvoiceTaxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceTaxController],
      providers: [
        InvoiceTaxService,
        { provide: PrismaService, useValue: {} },
        { provide: CacheService, useValue: createMockCacheService() },
      ],
    }).compile();

    controller = module.get<InvoiceTaxController>(InvoiceTaxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
