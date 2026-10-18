import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponService } from '../coupon/coupon.service';

describe('CartService.attachGuestCartToUser', () => {
  let service: CartService;
  let prisma: {
    cart: Record<string, jest.Mock>;
    cartItem: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      cart: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      cartItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((fn) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prisma },
        { provide: CouponService, useValue: {} },
      ],
    }).compile();

    service = module.get(CartService);
  });

  it('merges different guest items onto the user cart', async () => {
    const guestCart = {
      id: 'guest-cart',
      coupon_id: null,
      coupon_applied_at: null,
      coupon_quantity_locked: false,
    };
    const userCart = {
      id: 'user-cart',
      coupon_id: 'coupon-user',
      coupon_applied_at: new Date(),
      coupon_quantity_locked: true,
    };
    const guestItem = {
      id: 'guest-item',
      product_color_id: 'color-b',
      lens_detail_id: null,
      lens_feature_id: null,
      power_type_id: null,
      frame_only: true,
      quantity: 1,
    };

    prisma.cart.findUnique
      .mockResolvedValueOnce(guestCart) // findCartByTempSession
      .mockResolvedValueOnce(userCart); // inside transaction
    prisma.cartItem.findMany.mockResolvedValue([guestItem]);
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.cartItem.update.mockResolvedValue({});
    prisma.cart.delete.mockResolvedValue({});

    const result = await service.attachGuestCartToUser('temp-1', 'user-1');

    expect(result).toEqual({ cart: { id: 'user-cart' } });
    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'guest-item' },
      data: { cart_id: 'user-cart' },
    });
    // User coupon preserved — guest coupon copy not attempted when user has one
    expect(prisma.cart.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ coupon_id: expect.anything() }),
      }),
    );
  });

  it('dedupes identical items with max quantity and matches frame_only', async () => {
    const guestCart = {
      id: 'guest-cart',
      coupon_id: null,
      coupon_applied_at: null,
      coupon_quantity_locked: false,
    };
    const userCart = {
      id: 'user-cart',
      coupon_id: null,
      coupon_applied_at: null,
      coupon_quantity_locked: false,
    };
    const guestItem = {
      id: 'guest-item',
      product_color_id: 'color-a',
      lens_detail_id: 'ld-1',
      lens_feature_id: 'lf-1',
      power_type_id: 'pt-1',
      frame_only: false,
      quantity: 1,
    };
    const existing = {
      id: 'user-item',
      quantity: 1,
    };

    prisma.cart.findUnique
      .mockResolvedValueOnce(guestCart)
      .mockResolvedValueOnce(userCart);
    prisma.cartItem.findMany.mockResolvedValue([guestItem]);
    prisma.cartItem.findFirst.mockResolvedValue(existing);
    prisma.cartItem.update.mockResolvedValue({});
    prisma.cartItem.delete.mockResolvedValue({});
    prisma.cart.delete.mockResolvedValue({});

    await service.attachGuestCartToUser('temp-1', 'user-1');

    expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
      where: {
        cart_id: 'user-cart',
        product_color_id: 'color-a',
        lens_detail_id: 'ld-1',
        lens_feature_id: 'lf-1',
        power_type_id: 'pt-1',
        frame_only: false,
      },
    });
    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'user-item' },
      data: { quantity: 1 },
    });
    expect(prisma.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'guest-item' },
    });
  });

  it('copies guest coupon onto user cart when user has none', async () => {
    const guestCart = {
      id: 'guest-cart',
      coupon_id: 'coupon-guest',
      coupon_applied_at: new Date('2026-01-01'),
      coupon_quantity_locked: true,
    };
    const userCart = {
      id: 'user-cart',
      coupon_id: null,
      coupon_applied_at: null,
      coupon_quantity_locked: false,
    };

    prisma.cart.findUnique
      .mockResolvedValueOnce(guestCart)
      .mockResolvedValueOnce(userCart);
    prisma.cartItem.findMany.mockResolvedValue([]);
    prisma.cart.update.mockResolvedValue({});
    prisma.cart.delete.mockResolvedValue({});

    await service.attachGuestCartToUser('temp-1', 'user-1');

    expect(prisma.cart.update).toHaveBeenCalledWith({
      where: { id: 'user-cart' },
      data: {
        coupon_id: 'coupon-guest',
        coupon_applied_at: guestCart.coupon_applied_at,
        coupon_quantity_locked: true,
      },
    });
  });
});
