import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';

describe('FileController', () => {
  let controller: FileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        FileService,
        { provide: PrismaService, useValue: {} },
        { provide: BucketService, useValue: {} },
      ],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
