import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { ProductService } from '../product/product.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('ArticleController', () => {
  let controller: ArticleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        ArticleService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        {
          provide: ProductService,
          useValue: {
            getPublicSeparatedProductColorSelect: jest.fn(() => ({})),
          },
        },
        {
          provide: WishlistService,
          useValue: { flagProductColors: jest.fn((rows: unknown[]) => rows) },
        },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
