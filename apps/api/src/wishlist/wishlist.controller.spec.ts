import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { PopularityService } from '../popularity/popularity.service';

describe('WishlistController', () => {
  let controller: WishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        WishlistService,
        { provide: PrismaService, useValue: {} },
        { provide: PopularityService, useValue: { recordWishlistAdd: jest.fn() } },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
