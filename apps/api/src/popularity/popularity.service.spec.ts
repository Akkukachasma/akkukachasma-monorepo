import { Test, TestingModule } from '@nestjs/testing';
import { PopularityService } from './popularity.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PopularityService', () => {
  let service: PopularityService;

  const mockPrisma = {
    productColor: { findUnique: jest.fn() },
    popularity: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopularityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PopularityService>(PopularityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('recordView upserts, then recalculates score from stored row', async () => {
    mockPrisma.productColor.findUnique.mockResolvedValue({ id: 'pc1' });
    mockPrisma.popularity.upsert.mockResolvedValue({});
    mockPrisma.popularity.findUnique.mockResolvedValue({
      views: 3,
      times_liked: 1,
      times_added_to_cart: 0,
      times_shared: 0,
      times_purchased: 0,
    });
    mockPrisma.popularity.update.mockResolvedValue({});

    await service.recordView('pc1');

    expect(mockPrisma.popularity.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_color_id: 'pc1' },
        update: { views: { increment: 1 } },
      }),
    );
    const updateArg = mockPrisma.popularity.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ product_color_id: 'pc1' });
    expect(updateArg.data.score).toBeCloseTo(3 * 0.1 + 1 * 0.2);
  });
});
