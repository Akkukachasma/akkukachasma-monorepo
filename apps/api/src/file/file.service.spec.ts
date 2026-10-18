import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: PrismaService, useValue: {} },
        { provide: BucketService, useValue: {} },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
