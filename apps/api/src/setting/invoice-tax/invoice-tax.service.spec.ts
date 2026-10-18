import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceTaxService } from './invoice-tax.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { createMockCacheService } from '../../test/mock-cache.service';

describe('TaxService', () => {
  let service: InvoiceTaxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceTaxService,
        { provide: PrismaService, useValue: {} },
        { provide: CacheService, useValue: createMockCacheService() },
      ],
    }).compile();

    service = module.get<InvoiceTaxService>(InvoiceTaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
