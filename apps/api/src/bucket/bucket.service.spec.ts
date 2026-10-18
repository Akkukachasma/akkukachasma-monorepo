import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BucketService } from './bucket.service';
import { createMockConfigService } from '../test/mock-config.service';

describe('BucketService', () => {
  let service: BucketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BucketService,
        { provide: ConfigService, useValue: createMockConfigService() },
      ],
    }).compile();

    service = module.get<BucketService>(BucketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
