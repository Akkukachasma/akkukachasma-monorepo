import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { CouponService } from '../coupon/coupon.service';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import {
  UpdateOrderAddressDto,
  UpdateOrderCouponDto,
  UpdateOrderPaymentModeDto,
} from './dto/update-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { CheckOwnership } from '../rbac/decorators/check-ownership.decorator';
import { PERMISSIONS } from '../rbac/constants';
import { ORDER_RESOURCE_TYPE } from './order-ownership.resolver';
import { AddressService } from '../address/address.service';
import { OrderStatus, PaymentMode, PrescriptionType, Prisma } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { FileService } from '../file/file.service';
import { PrescriptionService } from '../prescription/prescription.service';
import { AddProductToCartDto } from '../cart/dto/add-product.dto';
import { ProductColorService } from '../product/product-color/product-color.service';
import { LensDetailService } from '../lens-detail/lens-detail.service';
import { LensFeatureService } from '../lens-feature/lens-feature.service';
import { PowerTypeService } from '../power-type/power-type.service';
import { ICalculation } from '../cart/type';
import { GetAllOrdersDto, OrderSearchType } from './dto/get-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderShipmentDto } from './dto/update-order-shipment.dto';
import { ManifestOrdersDto } from './dto/manifest-orders.dto';
import { DelhiveryService } from '../delhivery/delhivery.service';
import { OrderStatusSyncService } from '../delhivery/order-status-sync.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { PopularityService } from '../popularity/popularity.service';
import { CompanyInfoService } from '../setting/company-info/company-info.service';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_ORDER_MUTATION } from '../cache/cache-invalidation.presets';
import { OrderManifestService } from './order-manifest.service';

@InvalidateCache(INVALIDATE_ON_ORDER_MUTATION)
@Controller('orders')
@ApiTags('Order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
    private readonly couponService: CouponService,
    private readonly addressService: AddressService,
    private readonly delhiveryService: DelhiveryService,
    private readonly orderStatusSyncService: OrderStatusSyncService,
    private readonly productColorService: ProductColorService,
    private readonly lensDetailService: LensDetailService,
    private readonly lensFeatureService: LensFeatureService,
    private readonly powerTypeService: PowerTypeService,
    private readonly activityLogger: ActivityLoggerService,
    private readonly popularityService: PopularityService,
    private readonly companyInfoService: CompanyInfoService,
    private readonly inventoryService: InventoryService,
    private readonly fileService: FileService,
    private readonly prescriptionService: PrescriptionService,
    private readonly orderManifestService: OrderManifestService,
  ) {}

  @Post('cart-checkout')
  @Roles('customer')
  @ApiOperation({ description: 'Creates order from the items of cart.' })
  async createOrderFromCart(@Tenant() tenant: ITenant): Promise<ApiResponse> {
    const order = await this.orderService.syncInitiatedOrderFromCart(tenant.id);

    this.activityLogger.logInfo(
      'Order: checkout initiated',
      `Order ${order.id} synced from cart`,
      {
        source: 'order',
        order_id: order.id,
        user_id: tenant.id,
      },
      tenant.id,
    );

    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    };
  }

  @Post('checkout')
  @Roles('customer')
  @ApiOperation({
    description:
      'Adds item to cart and syncs the single initiated checkout order (merge).',
  })
  async createOrder(
    @Tenant() tenant: ITenant,
    @Body() checkoutDto: AddProductToCartDto,
  ): Promise<ApiResponse> {
    const productColor = await this.productColorService.getProductColor(
      checkoutDto.product_color_id,
    );
    if (!productColor) {
      throw new NotFoundException('Product not found');
    }

    if (!checkoutDto.frame_only) {
      if (
        !checkoutDto.lens_detail_id ||
        !checkoutDto.lens_feature_id ||
        !checkoutDto.power_type_id
      ) {
        throw new BadRequestException(
          'Lens details are required when not selecting frame only.',
        );
      }
      await Promise.all([
        this.lensDetailService.doesExist(checkoutDto.lens_detail_id),
        this.lensFeatureService.doesExist(checkoutDto.lens_feature_id),
        this.powerTypeService.doesExist(checkoutDto.power_type_id),
      ]);
    }

    const quantity = 1;
    const hasStock = await this.inventoryService.hasSufficientStock(
      checkoutDto.product_color_id,
      quantity,
    );
    if (!hasStock) {
      throw new BadRequestException('Insufficient stock for this item');
    }

    const { save_prescription, ...addToCartDto } = checkoutDto;
    const prescription = checkoutDto.prescription;
    const prescImage =
      prescription?.type === PrescriptionType.photo
        ? prescription.image
        : undefined;

    await this.prisma.$transaction(async (prisma) => {
      const cart = await this.cartService.ensureCart({
        user_id: tenant.id,
        prisma,
      });
      await this.cartService.addProductToCart({
        cart_id: cart.id,
        addProductToCartDto: addToCartDto,
        prisma,
      });
      await this.popularityService.recordAddToCart(
        checkoutDto.product_color_id,
        prisma,
      );
      if (!save_prescription && prescImage) {
        await this.fileService.update({
          file_id: prescImage,
          data: { is_temp: false },
          prisma,
        });
      }
    });

    if (save_prescription && prescription) {
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

    const order = await this.orderService.syncInitiatedOrderFromCart(tenant.id);

    this.activityLogger.logInfo(
      'Order: checkout initiated',
      `Order ${order.id} synced after direct checkout (cart merge)`,
      {
        source: 'order',
        order_id: order.id,
        user_id: tenant.id,
      },
      tenant.id,
    );

    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    };
  }

  @Get()
  @Roles('admin')
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({ description: 'Get all orders (Admin only)' })
  async getAllOrdersAdmin(
    @Query() query: GetAllOrdersDto,
  ): Promise<PaginatedResponse> {
    const searchText = (query.search ?? query.search_term ?? '').trim();
    const searchType = this.resolveSearchType(searchText, query.type);
    const filters: Prisma.OrderWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.start_date || query.end_date
        ? {
            created_at: {
              ...(query.start_date && { gte: new Date(query.start_date) }),
              ...(query.end_date && { lte: new Date(query.end_date) }),
            },
          }
        : {}),
      ...(searchText ? this.buildAdminSearchFilter(searchText, searchType) : {}),
      ...(query.payment_status && {
        payment: {
          status: query.payment_status,
        },
      }),
      ...(query.payment_mode && {
        payment: {
          mode: query.payment_mode,
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.orderService.findAll({
        page: query.page,
        page_size: query.page_size,
        filters,
        sort_by: query.sort_by,
      }),
      this.orderService.count({
        filters,
      }),
    ]);

    return {
      success: true,
      data: orders,
      page: query.page,
      page_size: query.page_size,
      total,
    };
  }

  @Get('my-orders')
  @Roles('customer')
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({ description: 'Fetch all orders for customer' })
  async getAllOrders(
    @Query() query: GetAllOrdersDto,
    @Tenant() tenant: ITenant,
  ): Promise<PaginatedResponse> {
    const filters: Prisma.OrderWhereInput = {
      ...(tenant.roles?.includes('customer') && {
        user_id: tenant.id,
        status: { not: OrderStatus.initiated },
      }),

      ...(query.status && { status: query.status }),
      ...(query.start_date || query.end_date
        ? {
            created_at: {
              ...(query.start_date && {
                gte: new Date(query.start_date),
              }),
              ...(query.end_date && {
                lte: new Date(query.end_date),
              }),
            },
          }
        : {}),
      ...(query.search_term && {
        OR: [
          {
            user: {
              name: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              email: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
      ...(query.payment_status && {
        payment: {
          status: query.payment_status,
        },
      }),
      ...(query.payment_mode && {
        payment: {
          mode: query.payment_mode,
        },
      }),
    };

    const page = query.page || 1;
    const pageSize = query.page_size || 10;

    const [orders, total] = await Promise.all([
      this.orderService.findAll({
        page,
        page_size: pageSize,
        filters,
        sort_by: query.sort_by,
      }),
      this.orderService.count({
        filters,
      }),
    ]);

    return {
      success: true,
      data: orders,
      total,
      page,
      page_size: pageSize,
    };
  }

  @Get('track/:orderId')
  @PublicApi()
  @ApiOperation({ description: 'Public: Track order by order ID (no auth)' })
  async trackOrder(@Param('orderId') orderId: string): Promise<ApiResponse> {
    let order = await this.orderService.getOrderForPublicTrack(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { synced, trackingInfo } =
      await this.orderStatusSyncService.syncOrderFromDelhiveryIfNeeded(
        orderId,
        order,
      );
    if (synced) {
      const refreshed = await this.orderService.getOrderForPublicTrack(orderId);
      if (refreshed) order = refreshed;
    }

    const sd = order.shipment_details;
    const waybill = sd?.waybill_number ?? null;
    const shipment = waybill && sd
      ? {
          waybill_number: sd.waybill_number,
          tracking_url: sd.tracking_url,
          delivery_partner: sd.delivery_partner ?? 'Delhivery',
          estimated_delivery: sd.estimated_delivery,
          actual_delivery: sd.actual_delivery,
        }
      : undefined;

    return {
      success: true,
      data: {
        order_id: order.id,
        status: order.status,
        created_at: order.created_at,
        confirmed_at: order.confirmed_at,
        picked_at: order.picked_at,
        delivered_at: order.delivered_at,
        shipment,
        tracking_info: trackingInfo ?? null,
        address: order.address,
        customer_name: order.user?.name,
      },
      message: 'Order tracking information retrieved',
    };
  }

  @Get('checkout')
  @Roles('customer')
  @ApiOperation({ description: 'Fetch initiated checkout' })
  async fetchInitiatedCheckout(
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.orderService.cleanupDuplicateInitiatedOrders(tenant.id);

    const order = await this.orderService.fetchInitiatedCheckout(tenant.id);
    if (!order || order.status !== OrderStatus.initiated) {
      throw new NotFoundException('Order not found');
    }

    const saving = this.orderService.calculateSaving(
      order.pricing,
      order.order_items,
    );
    const gst_breakdown = this.orderService.getGstBreakdownFromOrderItems(
      order.order_items,
      order.address?.zip_code,
    );

    (order as any).saving = saving;
    (order as any).gst_breakdown = gst_breakdown;

    return {
      success: true,
      data: order,
      message: 'Order fetched successfully',
    };
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORDER_VIEW)
  @CheckOwnership({ resourceType: ORDER_RESOURCE_TYPE, paramKey: 'id' })
  @ApiOperation({ description: 'Get single order by ID (admin: any, customer: own)' })
  async getOrderById(
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    let order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone_number: true,
            email: true,
          },
        },
        address: true,
        pricing: true,
        payment: true,
        invoice: {
          select: {
            id: true,
            status: true,
            invoice_number: true,
          },
        },
        order_items: {
          include: {
            taxes: true,
          },
        },
        shipment_details: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { synced } =
      await this.orderStatusSyncService.syncOrderFromDelhiveryIfNeeded(
        id,
        order,
      );
    if (synced) {
      const refreshed = await this.prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              phone_number: true,
              email: true,
            },
          },
          address: true,
          pricing: true,
          payment: true,
          invoice: {
            select: {
              id: true,
              status: true,
              invoice_number: true,
            },
          },
          order_items: {
            include: { taxes: true },
          },
          shipment_details: true,
        },
      });
      if (refreshed) order = refreshed;
    }

    const order_items =
      await this.orderService.hydrateOrderItemPrescriptions(order.order_items);

    return {
      success: true,
      data: { ...order, order_items },
    };
  }

  @Post('manifest')
  @Roles('admin')
  @ApiOperation({
    description:
      'Start Delhivery manifestation (Ready To Ship) for selected orders. Progress is pushed over WebSocket.',
  })
  async manifestOrders(
    @Body() dto: ManifestOrdersDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const uniqueIds = [...new Set(dto.order_ids)];
    const existing = await this.prisma.order.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((o) => o.id));
    const missing = uniqueIds.filter((id) => !existingIds.has(id));
    if (missing.length === uniqueIds.length) {
      throw new NotFoundException('No matching orders found');
    }

    const { job_id, accepted } = this.orderManifestService.startManifestJob({
      orderIds: uniqueIds.filter((id) => existingIds.has(id)),
      adminUserId: tenant.id,
    });

    return {
      success: true,
      data: {
        job_id,
        accepted,
        missing_order_ids: missing,
      },
      message: 'Manifest job started',
    };
  }

  @Put(':id/shipment')
  @Roles('admin')
  @ApiOperation({ description: 'Update order shipment info (Admin only)' })
  async updateOrderShipment(
    @Param('id') id: string,
    @Body() dto: UpdateOrderShipmentDto,
  ): Promise<ApiResponse> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const trackingUrl = `https://track.delhivery.com/track/${dto.waybill_number}`;
    const updated = await this.orderService.upsertOrderShipmentDetails({
      order_id: id,
      waybill_number: dto.waybill_number,
      tracking_url: trackingUrl,
      delivery_partner: dto.delivery_partner,
      estimated_delivery: dto.estimated_delivery
        ? new Date(dto.estimated_delivery)
        : undefined,
    });

    return {
      success: true,
      data: updated,
      message: 'Shipment information updated',
    };
  }

  @Get(':id/shipment/live')
  @RequirePermissions(PERMISSIONS.ORDER_VIEW)
  @CheckOwnership({ resourceType: ORDER_RESOURCE_TYPE, paramKey: 'id' })
  @ApiOperation({
    description:
      'Poll Delhivery Track API for live scans and sync order status (Admin/Customer)',
  })
  async getShipmentLive(@Param('id') id: string): Promise<ApiResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shipment_details: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const waybill = order.shipment_details?.waybill_number;
    if (!waybill) {
      return {
        success: true,
        data: { waybill_number: null, tracking_info: null },
        message: 'No shipment waybill found',
      };
    }

    const { trackingInfo } =
      await this.orderStatusSyncService.syncOrderFromDelhiveryIfNeeded(id, {
        id: order.id,
        status: order.status,
        shipment_details: order.shipment_details,
      });

    return {
      success: true,
      data: {
        waybill_number: waybill,
        tracking_info: trackingInfo,
      },
    };
  }

  @Put(':id/status')
  @Roles('admin')
  @ApiOperation({ description: 'Update order status (Admin only)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.orderService.updateOrderStatus({
      order_id: id,
      new_status: updateOrderStatusDto.status,
      changed_by_id: tenant.id,
      remark: updateOrderStatusDto.remark,
    });

    return {
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    };
  }

  @Put(':id/mode')
  @Roles('customer')
  @ApiOperation({
    description: 'Update order payment mode from checkout page.',
  })
  async updateOrderPaymentMode(
    @Param() params: RequiredIdDto,
    @Body() updateOrderPaymentModeDto: UpdateOrderPaymentModeDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const order = await this.orderService.fetchOrderById(params.id, tenant.id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.initiated) {
      throw new BadRequestException('Invalid order status');
    }

    const previousMode = order.payment?.mode;
    const nextMode = updateOrderPaymentModeDto.payment_mode;
    const COD_SHIPPING_FEE = 70;

    if (nextMode === PaymentMode.cod) {
      const codEnabled = await this.companyInfoService.isCodEnabled();
      if (!codEnabled) {
        throw new BadRequestException(
          'Cash on Delivery is currently unavailable.',
        );
      }

      if (order.address?.zip_code) {
        await this.delhiveryService.assertPincodeDeliverable(
          order.address.zip_code,
          {
            requireCod: true,
            allowUnverified: true,
            acknowledgeUnverified:
              !!updateOrderPaymentModeDto.acknowledge_unverified_pincode,
          },
        );
      }
    }

    await this.prisma.$transaction(
      async (prisma) => {
        await this.orderService.updateOrderPaymentMode({
          order_id: params.id,
          updateOrderPaymentModeDto,
          prisma,
        });

        // Only adjust shipping when the mode actually changes to avoid
        // double-charging or over-decrementing on repeat selections.
        if (previousMode === nextMode) {
          return;
        }

        if (nextMode === PaymentMode.cod) {
          await this.orderService.updatePricing({
            order_id: params.id,
            data: {
              shipping_price: COD_SHIPPING_FEE,
              total: {
                increment: COD_SHIPPING_FEE,
              },
            },
            prisma,
          });
        } else if (previousMode === PaymentMode.cod) {
          const currentShipping = Number(
            order.pricing?.shipping_price ?? COD_SHIPPING_FEE,
          );
          await this.orderService.updatePricing({
            order_id: params.id,
            data: {
              shipping_price: 0,
              total: {
                decrement: currentShipping,
              },
            },
            prisma,
          });
        }
      },
      { maxWait: 40000, timeout: 60000 },
    );

    return {
      success: true,
      message: 'Order payment mode updated successfully',
    };
  }

  @Put(':id/coupon')
  @Roles('customer')
  @ApiOperation({
    description: 'Apply or remove coupon from an order from checkout page.',
  })
  async updateOrderCoupon(
    @Param() params: RequiredIdDto,
    @Body() updateOrderCouponDto: UpdateOrderCouponDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const order = await this.orderService.fetchOrderById(params.id, tenant.id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.initiated) {
      throw new ForbiddenException('Invalid order status');
    }

    let coupon = null;
    if (updateOrderCouponDto.coupon_code) {
      const byCode = await this.couponService.findCouponByCode({
        coupon_code: updateOrderCouponDto.coupon_code,
      });
      const skip_quantity = Boolean(
        byCode &&
          order.user.cart?.coupon_id === byCode.id &&
          order.user.cart?.coupon_quantity_locked,
      );
      coupon = await this.couponService.validCoupon({
        coupon_code: updateOrderCouponDto.coupon_code,
        order_value: order.pricing.subtotal,
        user_id: tenant.id,
        skip_quantity,
      });
      if (!coupon) {
        throw new BadRequestException('This coupon is not valid for you.');
      }
    }

    await this.prisma.$transaction(
      async (prisma) => {
        const orderItems = await this.orderService.updateOrderItemsDiscount({
          coupon,
          order_items: order.order_items,
          coupon_code: updateOrderCouponDto.coupon_code,
          prisma,
        });

        const calculation = this.orderService.getCalculation(
          orderItems,
          coupon,
        );

        // Preserve COD shipping when recalculating after coupon change.
        const existingShipping = Number(order.pricing?.shipping_price ?? 0);
        const shipping_price =
          order.payment?.mode === 'cod' ? existingShipping || 70 : 0;

        await prisma.orderPricing.update({
          where: { order_id: params.id },
          data: {
            ...calculation,
            total: calculation.total + shipping_price,
            shipping_price,
          },
        });

        if (coupon) {
          await this.cartService.addCouponToCart({
            cart_id: order.user.cart.id,
            coupon_id: coupon.id,
            prisma,
          });
        } else {
          await this.cartService.removeCouponFromCart({
            cart_id: order.user.cart.id,
            prisma,
          });
        }
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );

    return {
      success: true,
      message: 'Order coupon updated successfully',
    };
  }

  @Put(':id/address')
  @Roles('customer')
  @ApiOperation({
    description: 'Use this api to change order address from checkout page.',
  })
  async updateOrderAddress(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
    @Body() updateOrderAddressDto: UpdateOrderAddressDto,
  ): Promise<ApiResponse> {
    const order = await this.orderService.fetchOrderById(params.id, tenant.id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.initiated) {
      throw new ForbiddenException('Invalid order status');
    }

    // check if the address actually belongs to user.
    const address = await this.addressService.isUserAddress(
      tenant.id,
      updateOrderAddressDto.address_id,
    );
    if (!address) throw new ForbiddenException('Address not found');

    await this.delhiveryService.assertPincodeDeliverable(address.zip_code, {
      requireCod: order.payment?.mode === PaymentMode.cod,
      allowUnverified: true,
      acknowledgeUnverified:
        !!updateOrderAddressDto.acknowledge_unverified_pincode,
    });

    await this.orderService.updateOrderAddress({
      order_id: order.id,
      address_id: updateOrderAddressDto.address_id,
    });

    return { success: true, message: 'Order address updated successfully' };
  }

  @Delete(':order_id/item/:id')
  @Roles('customer')
  @ApiOperation({
    description: 'Use this api to remove an item from an initiated checkout order.',
  })
  async removeOrderItem(
    @Param('order_id') order_id: string,
    @Param('id') item_id: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const order = await this.orderService.fetchOrderById(order_id, tenant.id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.initiated) {
      throw new ForbiddenException('Invalid order status');
    }

    if (!order.order_items.find((oi) => oi.id === item_id)) {
      throw new NotFoundException('Order item not found');
    }

    const remainingItems = order.order_items.filter((oi) => oi.id !== item_id);

    if (remainingItems.length === 0) {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.order.delete({ where: { id: order.id } });
        const userCart = await prisma.cart.findUnique({
          where: { user_id: tenant.id },
        });
        if (userCart) {
          await prisma.cart.update({
            where: { id: userCart.id },
            data: { checkout_initiated: false },
          });
        }
      });
      return {
        success: true,
        message: 'Item removed. Your checkout order was cleared.',
        data: { order_cleared: true },
      };
    }

    const appliedCoupon = order.pricing?.applied_coupon as unknown as
      | ICalculation['applied_coupon']
      | null
      | undefined;
    const coupon = appliedCoupon?.coupon ?? null;

    await this.prisma.$transaction(async (prisma) => {
      await prisma.orderItem.delete({ where: { id: item_id } });

      const orderItems = await this.orderService.updateOrderItemsDiscount({
        coupon,
        order_items: remainingItems,
        prisma,
      });

      const calculation = this.orderService.getCalculation(
        orderItems,
        coupon,
      );
      const existingShipping = Number(order.pricing?.shipping_price ?? 0);
      const shipping_price =
        order.payment?.mode === PaymentMode.cod ? existingShipping || 70 : 0;

      await this.orderService.updatePricing({
        order_id: order.id,
        data: {
          ...calculation,
          shipping_price,
          total: (calculation.total ?? 0) + shipping_price,
        },
        prisma,
      });
    });

    return { success: true, message: 'Item removed successfully' };
  }

  /** Mongo ObjectId string (admin list / URLs use this, not Razorpay `order_id`). */
  private isMongoObjectIdString(value: string): boolean {
    return /^[a-f\d]{24}$/i.test(value.trim());
  }

  private resolveSearchType(
    search: string,
    suppliedType?: OrderSearchType,
  ): OrderSearchType {
    if (!search) return 'generic';
    if (suppliedType) return suppliedType;
    const trimmed = search.trim();
    if (/^\d{10}$/.test(trimmed)) return 'phone';
    if (this.isMongoObjectIdString(trimmed)) return 'orderId';
    const normalized = trimmed.toLowerCase();
    /** Razorpay order ids are `order_…`; legacy/spec used `ord_…`. */
    if (normalized.startsWith('order_') || normalized.startsWith('ord_')) {
      return 'orderId';
    }
    if (normalized.startsWith('pay_')) return 'paymentId';
    if (normalized.startsWith('txn_')) return 'transactionId';
    return 'generic';
  }

  private buildAdminSearchFilter(
    search: string,
    type: OrderSearchType,
  ): Prisma.OrderWhereInput {
    const trimmed = search.trim();
    const idClause = this.isMongoObjectIdString(trimmed)
      ? ([{ id: trimmed }] as const)
      : [];
    switch (type) {
      case 'phone':
        return { user: { phone_number: trimmed } };
      case 'orderId':
        return {
          OR: [
            { order_id: { equals: trimmed, mode: 'insensitive' } },
            ...idClause,
          ],
        };
      case 'paymentId':
      case 'transactionId':
        return {
          payment: {
            transaction_id: { equals: trimmed, mode: 'insensitive' },
          },
        };
      case 'generic':
      default:
        return {
          OR: [
            ...idClause,
            { order_id: { contains: trimmed, mode: 'insensitive' } },
            {
              payment: {
                transaction_id: { contains: trimmed, mode: 'insensitive' },
              },
            },
            { user: { phone_number: { contains: trimmed } } },
            { user: { name: { contains: trimmed, mode: 'insensitive' } } },
            { user: { email: { contains: trimmed, mode: 'insensitive' } } },
          ],
        };
    }
  }
}
