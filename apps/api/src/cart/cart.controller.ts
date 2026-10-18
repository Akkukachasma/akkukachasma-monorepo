import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { CartService } from './cart.service';
import { ApiResponse, PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { AddProductToCartDto } from './dto/add-product.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { GuestSession } from '../auth/decorators/guest-session.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { PrescriptionService } from '../prescription/prescription.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { CouponService } from '../coupon/coupon.service';
import { CouponDto } from './dto/add-coupon.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateQuantityDto } from './dto/update.dto';
import { InventoryService } from '../inventory/inventory.service';
import { OrderService } from '../order/order.service';
import {
  cookieEnvFromDevEnvironmentString,
  removeCookie,
  setCookie,
} from '../../lib/utils';
import {
  GUEST_SESSION_COOKIE,
  GUEST_SESSION_MAX_AGE,
} from '../../lib/constants';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { PopularityService } from '../popularity/popularity.service';
import { PrescriptionType } from '@prisma/client';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_CART_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_CART_MUTATION)
@Controller('cart')
@ApiTags('Cart Management')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly prescriptionService: PrescriptionService,
    private readonly couponService: CouponService,
    private readonly inventoryService: InventoryService,
    private readonly orderService: OrderService,
    private readonly activityLogger: ActivityLoggerService,
    private readonly configService: ConfigService,
    private readonly popularityService: PopularityService,
  ) {}

  private cookieEnv() {
    return cookieEnvFromDevEnvironmentString(
      this.configService.get<string>('DEV_ENVIRONMENT'),
    );
  }

  private async resolveCart(
    tenant: ITenant | undefined,
    guestSession: string | undefined,
    options?: { createGuestIfMissing?: boolean; res?: Response },
  ) {
    if (tenant) {
      return this.cartService.ensureCart({ user_id: tenant.id });
    }
    let tempSessionId = guestSession;
    if (!tempSessionId && options?.createGuestIfMissing) {
      tempSessionId = randomUUID();
      const cart = await this.cartService.ensureCartForGuest({
        temp_session_id: tempSessionId,
      });
      if (options.res) {
        setCookie(
          options.res,
          {
            name: GUEST_SESSION_COOKIE,
            data: tempSessionId,
            age: GUEST_SESSION_MAX_AGE,
          },
          this.cookieEnv(),
        );
      }
      return cart;
    }
    if (!tempSessionId) {
      throw new UnauthorizedException(
        'Cart requires sign in or a valid guest session.',
      );
    }
    return this.cartService.ensureCartForGuest({
      temp_session_id: tempSessionId,
    });
  }

  @Post()
  @PublicApi()
  async addItemInCart(
    @Body() addProductToCartDto: AddProductToCartDto,
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    const quantity = 1;

    const hasStock = await this.inventoryService.hasSufficientStock(
      addProductToCartDto.product_color_id,
      quantity,
    );

    if (!hasStock) {
      this.activityLogger.logWarning(
        'Cart: insufficient stock',
        `product_color_id: ${addProductToCartDto.product_color_id}`,
        { source: 'cart', product_color_id: addProductToCartDto.product_color_id },
      );
      throw new BadRequestException('Insufficient stock for this item');
    }

    // Resolves user cart (tenant) or guest cart (temp_session_id). For guests,
    // creates cart + sets _aksid cookie if missing.
    const cart = await this.resolveCart(tenant, guestSession, {
      createGuestIfMissing: true,
      res,
    });
    const { save_prescription, ...rest } = addProductToCartDto;
    const prescription = addProductToCartDto.prescription;
    const prescImage =
      prescription?.type === PrescriptionType.photo
        ? prescription.image
        : undefined;
    await this.prisma.$transaction(async (prisma) => {
      await this.cartService.addProductToCart({
        cart_id: cart.id,
        addProductToCartDto: rest,
        prisma,
      });
      await this.popularityService.recordAddToCart(
        addProductToCartDto.product_color_id,
        prisma,
      );
      if (!save_prescription && prescImage) {
        await this.fileService.update({
          file_id: prescImage,
          data: {
            is_temp: false,
          },
          prisma,
        });
      }
    });

    // Save prescription as reusable record (tenant only). Guest prescription is
    // already stored in the cart item's prescription JSON.
    if (save_prescription && prescription && tenant) {
      const { image: saveImage, ...restPrescription } = prescription;
      await this.prisma.$transaction(async (prisma) => {
        const saved = await this.prescriptionService.createPrescription({
          user_id: tenant.id,
          createPrescriptionDto: restPrescription,
          prisma,
        });
        if (saveImage) {
          await this.fileService.update({
            file_id: saveImage,
            data: {
              is_temp: false,
              prescription: {
                connect: { id: saved.id },
              },
            },
            prisma,
          });
        }
      });
    }

    return { success: true, message: 'Item added to cart successfully.' };
  }

  @Post('/coupon')
  @PublicApi()
  async addCouponToCart(
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
    @Body() dto: CouponDto,
  ): Promise<ApiResponse> {
    const cart = await this.resolveCart(tenant, guestSession);
    const cartItems = await this.cartService.findAllItems({
      cart_id: cart.id,
    });
    const orderValue = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const coupon = await this.couponService.validCoupon({
      coupon_code: dto.coupon_code,
      user_id: tenant?.id,
      order_value: orderValue,
    });
    if (!coupon) {
      this.activityLogger.logWarning(
        'Cart: invalid coupon code',
        `Code: ${dto.coupon_code}`,
        { source: 'cart', coupon_code: dto.coupon_code },
      );
      throw new BadRequestException('Invalid coupon code');
    }

    await this.cartService.addCouponToCart({
      cart_id: cart.id,
      coupon_id: coupon.id,
    });

    return { success: true, message: 'Coupon added to cart successfully.' };
  }

  @Delete('/coupon')
  @PublicApi()
  @ApiOperation({ description: 'Use to remove any coupon attached in cart' })
  async removeCouponFromCart(
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
  ): Promise<ApiResponse> {
    const cart = await this.resolveCart(tenant, guestSession);

    if (!cart.coupon_id) {
      throw new BadRequestException('Cart does not have a coupon');
    }

    await this.cartService.removeCouponFromCart({
      cart_id: cart.id,
    });

    return { success: true, message: 'Coupon removed from cart successfully.' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({
    description:
      'Use to get all items in cart. Guest read: requires _aksid. When no session, returns empty cart.',
  })
  async getCartItems(
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
  ): Promise<ApiResponse> {
    // Read operations: return empty cart when no tenant and no guest session
    // (avoids 401 for direct /cart visit without _aksid). Mutating ops require session.
    if (!tenant && !guestSession) {
      return {
        success: true,
        data: {
          cart_items: [],
          checkout_initiated: false,
          coupon: null,
          summary: { subtotal: 0, estimated_total: 0 },
        },
      };
    }

    const cart = await this.resolveCart(tenant, guestSession);

    const cartItems = await this.cartService.findAllItems({
      cart_id: cart.id,
    });

    const orderValue = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const coupon = await this.cartService.reconcileCartCoupon({
      cart_id: cart.id,
      user_id: tenant?.id,
      order_value: orderValue,
    });

    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );

    return {
      success: true,
      data: {
        cart_items: cartItems,
        checkout_initiated: cart.checkout_initiated,
        coupon: coupon || null,
        summary: {
          subtotal,
          estimated_total: subtotal,
        },
      },
    };
  }

  @Get('checkout-preview')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({
    description:
      'Cart data for checkout page (guest or logged-in). Returns full pricing (GST, delivery, total). When no session, returns empty cart.',
  })
  async getCheckoutPreview(
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
  ): Promise<ApiResponse> {
    // Read operations: return empty cart when no tenant and no guest session
    if (!tenant && !guestSession) {
      return {
        success: true,
        data: {
          cart_items: [],
          coupon: null,
          pricing: null,
          summary: { subtotal: 0, estimated_total: 0 },
        },
      };
    }

    const cart = await this.resolveCart(tenant, guestSession);

    const cartItems = await this.cartService.findAllItems({
      cart_id: cart.id,
    });

    if (cartItems.length === 0) {
      return {
        success: true,
        data: {
          cart_items: [],
          coupon: null,
          pricing: null,
          summary: { subtotal: 0, estimated_total: 0 },
        },
      };
    }

    const orderValue = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const coupon = await this.cartService.reconcileCartCoupon({
      cart_id: cart.id,
      user_id: tenant?.id,
      order_value: orderValue,
    });

    const pricing = await this.orderService.getCalculationFromCartItems(
      cartItems,
      coupon,
    );

    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );

    return {
      success: true,
      data: {
        cart_items: cartItems,
        coupon: coupon || null,
        pricing,
        summary: {
          subtotal,
          estimated_total: pricing.total,
        },
      },
    };
  }

  @Post('attach')
  @Roles('customer')
  @ApiOperation({
    description:
      'Attach guest cart to user after login/signup. Requires _aksid cookie.',
  })
  async attachGuestCart(
    @Tenant() tenant: ITenant,
    @GuestSession() guestSession: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    if (!guestSession) {
      return {
        success: true,
        message: 'No guest cart to attach.',
      };
    }

    const { cart } =
      await this.cartService.attachGuestCartToUser(guestSession, tenant.id);

    if (cart) {
      removeCookie(res, GUEST_SESSION_COOKIE, this.cookieEnv());
      // Keep initiated checkout order in sync with merged cart (+ coupon reconcile)
      try {
        await this.orderService.syncInitiatedOrderFromCart(tenant.id);
      } catch {
        // Empty cart or no checkout yet — attach still succeeded
      }
    }

    return {
      success: true,
      data: cart,
      message: cart
        ? 'Guest cart attached successfully.'
        : 'No guest cart found to attach.',
    };
  }

  @Delete(':id')
  @PublicApi()
  @ApiOperation({
    description:
      'Use to remove an item from cart. Expects cart_item_id in params.',
  })
  async removeItemFromCart(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
  ): Promise<ApiResponse> {
    const cart = await this.resolveCart(tenant, guestSession);
    const exists = await this.cartService.findCartItem({
      cart_item_id: params.id,
    });
    if (!exists || exists.cart_id !== cart.id) {
      throw new NotFoundException('Cart item not found.');
    }
    let image = null;
    const rawPrescription = exists.prescription;
    if (rawPrescription) {
      try {
        const parsedPrescription =
          typeof rawPrescription === 'string'
            ? JSON.parse(rawPrescription)
            : rawPrescription;
        if (
          parsedPrescription?.type === 'photo' &&
          parsedPrescription.image
        ) {
          image = await this.fileService.getFileById(
            parsedPrescription.image,
          );
        }
      } catch {
        // Ignore malformed prescription JSON; still remove the cart item.
      }
    }

    const removed = await this.prisma.$transaction(
      async (prisma) => {
        const removedItem = await this.cartService.removeProductFromCart({
          cart_item_id: params.id,
          prisma,
        });
        if (image && image.user_id == undefined) {
          await this.bucketService.remove(image.key);
        }
        return removedItem;
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );

    return {
      success: true,
      data: removed,
      message: 'Item removed from cart successfully.',
    };
  }

  @Patch('item/:id/quantity')
  @PublicApi()
  @ApiOperation({
    description:
      'Use to update the quantity of an item in cart. Expects cart_item_id in params.',
  })
  async updateQuantity(
    @Param() params: RequiredIdDto,
    @Body() body: UpdateQuantityDto,
    @Tenant() tenant: ITenant | undefined,
    @GuestSession() guestSession: string | undefined,
  ): Promise<ApiResponse> {
    const cart = await this.resolveCart(tenant, guestSession);
    const existing = await this.prisma.cartItem.findUnique({
      where: { id: params.id },
      select: { product_color_id: true, cart_id: true },
    });

    if (!existing || existing.cart_id !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

    const hasStock = await this.inventoryService.hasSufficientStock(
      existing.product_color_id,
      body.quantity,
    );

    if (!hasStock) {
      this.activityLogger.logWarning(
        'Cart: insufficient stock for quantity update',
        `product_color_id: ${existing.product_color_id}, requested: ${body.quantity}`,
        { source: 'cart', product_color_id: existing.product_color_id, quantity: body.quantity },
      );
      throw new BadRequestException('Insufficient stock for requested quantity');
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: params.id },
      data: body,
    });

    return {
      success: true,
      data: updated,
      message: 'Updated quantity.',
    };
  }
}
