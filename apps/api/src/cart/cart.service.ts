import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ICartItem,
  IAddCouponToCart,
  IAddProductToCart,
  ICalculation,
  ICreateCart,
  ICreateCartGuest,
  IFindAllItems,
  IFindCartItem,
  IProductIsInCart,
  IRemoveCouponFromCart,
  IRemoveProductFromCart,
  IPrescription,
} from './type';
import { Coupon, Prescription } from '@prisma/client';
import { CouponService } from '../coupon/coupon.service';

/** Applied cart coupons expire (and release quantity) after 24 hours if unused. */
export const COUPON_RESERVATION_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponService: CouponService,
  ) {}

  async findCart(user_id: string) {
    return await this.prisma.cart.findUnique({
      where: { user_id },
      include: { coupon: true },
    });
  }

  async productIsInCart({
    cart_id,
    product_color_id,
    lens_detail_id,
    lens_feature_id,
    power_type_id,
    prisma = this.prisma,
  }: IProductIsInCart) {
    return await prisma.cartItem.findFirst({
      where: {
        cart_id,
        product_color_id,
        lens_detail_id,
        lens_feature_id,
        power_type_id,
      },
    });
  }

  async createCart({ user_id, prisma = this.prisma }: ICreateCart) {
    return await prisma.cart.create({
      data: {
        user: { connect: { id: user_id } },
      },
      include: { coupon: true },
    });
  }

  async ensureCart({ user_id, prisma = this.prisma }: ICreateCart) {
    const cart = await this.findCart(user_id);
    if (!cart) {
      return await this.createCart({ user_id, prisma });
    }
    return cart;
  }

  async findCartByTempSession(temp_session_id: string) {
    return await this.prisma.cart.findUnique({
      where: { temp_session_id },
      include: { coupon: true },
    });
  }

  async createCartForGuest({
    temp_session_id,
    prisma = this.prisma,
  }: ICreateCartGuest) {
    return await prisma.cart.create({
      data: {
        temp_session_id,
      },
      include: { coupon: true },
    });
  }

  async ensureCartForGuest({
    temp_session_id,
    prisma = this.prisma,
  }: ICreateCartGuest) {
    const cart = await this.findCartByTempSession(temp_session_id);
    if (!cart) {
      return await this.createCartForGuest({ temp_session_id, prisma });
    }
    return cart;
  }

  async attachGuestCartToUser(
    temp_session_id: string,
    user_id: string,
  ): Promise<{ cart: { id: string } | null }> {
    const guestCart = await this.findCartByTempSession(temp_session_id);
    if (!guestCart) return { cart: null }; // Idempotent: no guest cart or already attached

    return this.prisma.$transaction(async (prisma) => {
      const userCart = await prisma.cart.findUnique({
        where: { user_id },
        include: { coupon: true },
      });

      if (!userCart) {
        const updated = await prisma.cart.update({
          where: { id: guestCart.id },
          data: {
            user_id,
            temp_session_id: null,
          },
        });
        return { cart: { id: updated.id } };
      }

      const guestItems = await prisma.cartItem.findMany({
        where: { cart_id: guestCart.id },
      });

      for (const item of guestItems) {
        const existing = await prisma.cartItem.findFirst({
          where: {
            cart_id: userCart.id,
            product_color_id: item.product_color_id,
            lens_detail_id: item.lens_detail_id ?? null,
            lens_feature_id: item.lens_feature_id ?? null,
            power_type_id: item.power_type_id ?? null,
            frame_only: item.frame_only ?? false,
          },
        });
        if (existing) {
          // Same config → keep one line; do not sum (show just 1 when both qty 1)
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: {
              quantity: Math.max(existing.quantity, item.quantity),
            },
          });
          await prisma.cartItem.delete({ where: { id: item.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { cart_id: userCart.id },
          });
        }
      }

      // User coupon wins when both exist. Copy guest coupon only if user has none.
      // Surviving coupon is re-validated later via reconcileCartCoupon on cart-checkout.
      if (guestCart.coupon_id && !userCart.coupon_id) {
        await prisma.cart.update({
          where: { id: userCart.id },
          data: {
            coupon_id: guestCart.coupon_id,
            coupon_applied_at: guestCart.coupon_applied_at ?? new Date(),
            coupon_quantity_locked: guestCart.coupon_quantity_locked ?? false,
          },
        });
        await prisma.cart.update({
          where: { id: guestCart.id },
          data: {
            coupon: { disconnect: true },
            coupon_applied_at: null,
            coupon_quantity_locked: false,
          },
        });
      }

      await prisma.cart.delete({ where: { id: guestCart.id } });

      return { cart: { id: userCart.id } };
    });
  }

  async addCouponToCart({
    cart_id,
    coupon_id,
    prisma = this.prisma,
  }: IAddCouponToCart) {
    const existing = await prisma.cart.findUnique({ where: { id: cart_id } });
    if (existing?.coupon_id === coupon_id && existing.coupon_quantity_locked) {
      return await prisma.cart.update({
        where: { id: cart_id },
        data: { coupon_applied_at: new Date() },
      });
    }

    if (
      existing?.coupon_id &&
      existing.coupon_id !== coupon_id &&
      existing.coupon_quantity_locked
    ) {
      await this.couponService.releaseQuantity(existing.coupon_id, prisma);
    }

    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    let locked = false;
    if (coupon.quantity != null && coupon.quantity > 0) {
      const ok = await this.couponService.lockQuantity(coupon_id, prisma);
      if (!ok) {
        throw new BadRequestException('Coupon is no longer available');
      }
      locked = true;
    }

    return await prisma.cart.update({
      where: { id: cart_id },
      data: {
        coupon: { connect: { id: coupon_id } },
        coupon_applied_at: new Date(),
        coupon_quantity_locked: locked,
      },
    });
  }

  async removeCouponFromCart({
    cart_id,
    confirm = false,
    prisma = this.prisma,
  }: IRemoveCouponFromCart) {
    const cart = await prisma.cart.findUnique({ where: { id: cart_id } });
    if (!cart?.coupon_id) {
      return cart;
    }

    if (!confirm && cart.coupon_quantity_locked) {
      await this.couponService.releaseQuantity(cart.coupon_id, prisma);
    }

    return await prisma.cart.update({
      where: { id: cart_id },
      data: {
        coupon: { disconnect: true },
        coupon_applied_at: null,
        coupon_quantity_locked: false,
      },
    });
  }

  /**
   * On every cart/checkout refresh: drop expired (24h) or invalid coupons and
   * return the still-valid coupon (if any).
   */
  async reconcileCartCoupon({
    cart_id,
    user_id,
    order_value,
    prisma = this.prisma,
  }: {
    cart_id: string;
    user_id?: string;
    order_value: number;
    prisma?: any;
  }): Promise<Coupon | null> {
    const cart = await prisma.cart.findUnique({ where: { id: cart_id } });
    if (!cart?.coupon_id) return null;

    if (
      cart.coupon_applied_at &&
      Date.now() - new Date(cart.coupon_applied_at).getTime() >
        COUPON_RESERVATION_MS
    ) {
      await this.removeCouponFromCart({ cart_id, prisma });
      return null;
    }

    const coupon = await this.couponService.validCoupon({
      user_id,
      coupon_id: cart.coupon_id,
      order_value,
      skip_quantity: !!cart.coupon_quantity_locked,
      prisma,
    });

    if (!coupon) {
      await this.removeCouponFromCart({ cart_id, prisma });
      return null;
    }

    return coupon;
  }

  async releaseExpiredCartCoupons(prisma: any = this.prisma) {
    const cutoff = new Date(Date.now() - COUPON_RESERVATION_MS);
    const expired = await prisma.cart.findMany({
      where: {
        coupon_id: { not: null },
        coupon_applied_at: { lt: cutoff },
      },
      select: { id: true },
    });

    for (const cart of expired) {
      await this.removeCouponFromCart({ cart_id: cart.id, prisma });
    }

    return expired.length;
  }

  async addProductToCart({
    addProductToCartDto,
    cart_id,
    prisma = this.prisma,
  }: IAddProductToCart) {
    const {
      product_color_id,
      lens_detail_id,
      lens_feature_id,
      power_type_id,
      prescription,
      frame_only,
      ...rest
    } = addProductToCartDto;
    return await prisma.cartItem.create({
      data: {
        ...rest,
        frame_only: !!frame_only,
        cart: { connect: { id: cart_id } },
        product_color: { connect: { id: product_color_id } },
        ...(!frame_only &&
          lens_detail_id && {
            lens_detail: { connect: { id: lens_detail_id } },
          }),
        ...(!frame_only &&
          lens_feature_id && {
            lens_feature: { connect: { id: lens_feature_id } },
          }),
        ...(!frame_only &&
          power_type_id && {
            power_type: { connect: { id: power_type_id } },
          }),
        prescription: prescription ? JSON.stringify(prescription) : undefined,
      },
    });
  }

  async findAllItems({ cart_id }: IFindAllItems) {
    const data = await this.prisma.cartItem.findMany({
      where: { cart_id },
      include: {
        lens_detail: {
          select: {
            title: true,
            price: true,
            id: true,
            lens_id: true,
            anti_reflection: true,
            blue_light_blocker: true,
            uv_protection: true,
            hydrophobic: true,
          },
        },
        lens_feature: {
          select: {
            id: true,
            title: true,
          },
        },
        power_type: {
          select: {
            id: true,
            title: true,
          },
        },
        product_color: {
          select: {
            id: true,
            images: {
              where: { fieldname: 'thumbnail' },
              select: this.prisma.getFileSelection(),
            },
            product: {
              select: {
                model_name: true,
                id: true,
                listing_price: true,
                price: true,
                discount_percent: true,
                slug: true,
                lens_height: true,
                lens_width: true,
                frame_width: true,
                category_id: true,
              },
            },
            colors: {
              select: {
                name: true,
                color: true,
              },
            },
            model_number: true,
          },
        },
      },
    });

    const hydratedData = await Promise.all(
      data.map(async (d) => {
        let parsedPrescription: IPrescription | null = null;

        try {
          parsedPrescription = JSON.parse(
            d.prescription as string,
          ) as IPrescription;
        } catch (error) {
          console.log('error parsing', error);
        }

        const prescriptionHydration =
          parsedPrescription?.type === 'photo' && parsedPrescription.image
            ? {
                image: await this.prisma.file.findUnique({
                  where: { id: parsedPrescription.image as string },
                  select: this.prisma.getFileSelection(),
                }),
              }
            : {};

        return {
          ...d,
          price:
            (d.product_color.product.price || 0) + (d.lens_detail?.price || 0),
          ...(parsedPrescription && {
            prescription: {
              ...parsedPrescription,
              ...prescriptionHydration,
            },
          }),
        };
      }),
    );

    return hydratedData;
  }

  calculateOrderValue(cartItems: ICartItem[]) {
    let total = 0;
    for (const item of cartItems) {
      const unitPrice =
        (item.product_color?.product?.price || 0) +
        (item.frame_only ? 0 : (item.lens_detail?.price ?? 0));
      total += unitPrice * (item.quantity || 1);
    }
    return total;
  }

  async findCartItem({ cart_item_id }: IFindCartItem) {
    const data = await this.prisma.cartItem.findUnique({
      where: { id: cart_item_id },
    });
    return data;
  }

  async removeProductFromCart({
    cart_item_id,
    prisma = this.prisma,
  }: IRemoveProductFromCart) {
    return await prisma.cartItem.delete({
      where: { id: cart_item_id },
    });
  }
}
