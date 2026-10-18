import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorController } from './product-color.controller';
import { ProductColorService } from './product-color.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../../file/file.service';
import { BucketService } from '../../bucket/bucket.service';

describe('ProductColorController', () => {
  let controller: ProductColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductColorController],
      providers: [
        ProductColorService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProductColorController>(ProductColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
