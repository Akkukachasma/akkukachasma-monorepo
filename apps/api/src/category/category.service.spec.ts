import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { WishlistService } from '../wishlist/wishlist.service';

describe('CategoryService', () => {
  let service: CategoryService;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: {} },
        { provide: ProductService, useValue: mockService },
        { provide: WishlistService, useValue: mockService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
