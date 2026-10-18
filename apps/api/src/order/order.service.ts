import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import {
  ICreateOrder,
  ICreateOrderPricing,
  IOrderLensFeature,
  IOrderPowerType,
  IUpdateCouponUsage,
  IUpdateOrderPaymentMode,
  IUpdatePricing,
  IUpdateOrderAddress,
  IGetPaybleOrder,
  IUpdateOrder,
  IOrderItem,
  IOrderLensDetail,
  IUpdateOrderItemsDiscount,
  IFindAll,
  ICount,
} from './types';
import { ICalculation, ICartItem } from '../cart/type';
import {
  Coupon,
  DiscountType,
  InvoiceTax,
  LensDetail,
  OrderPricing,
  Prisma,
  Product,
  ProductColor,
  OrderStatus,
  PaymentMode,
} from '@prisma/client';
import { isActiveOrderLine } from './order-item-active';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { percentToAbsolute } from '../../lib/utils';
import { PincodeService } from '../address/pincode.service';
import { PopularityService } from '../popularity/popularity.service';
import { InvoiceService } from '../invoice/invoice.service';
import { computeGstLumpBreakdown } from './gst-lump-breakdown';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly pincodeService: PincodeService,
    private readonly popularityService: PopularityService,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly notificationDispatch: NotificationsDispatchService,
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
  ) {}

  /** Truncate to 2 decimals (strip excess precision); do not banker's-round. */
  private stripCurrency(value: number): number {
    const v = Number(value) || 0;
    const sign = v < 0 ? -1 : 1;
    const abs = Math.abs(v);
    return sign * (Math.floor(abs * 100 + 1e-9) / 100);
  }

  /** Tax on the amount after coupon discount (GST inclusive extraction when type is GST). */
  private computeTaxAmount(
    baseAmount: number,
    tax: { type?: string; percentage?: number },
  ): number {
    const base = Math.max(0, Number(baseAmount) || 0);
    const percentage = Number(tax.percentage) || 0;
    if (tax.type === 'GST') {
      return this.stripCurrency((base * percentage) / (100 + percentage));
    }
    return this.stripCurrency((base * percentage) / 100);
  }

  private isDeliveryInUP(zipCode?: string | null): boolean {
    if (!zipCode) return false;
    try {
      const pincodeData = this.pincodeService.getPincodeData(zipCode);
      return pincodeData.some(
        (data) =>
          data.State.toLowerCase() === 'uttar pradesh' ||
          data.State.toLowerCase() === 'up',
      );
    } catch {
      return false;
    }
  }

  /** Lump-sum GST → CGST/SGST or IGST; odd-paise intra rounding in {@link computeGstLumpBreakdown}. */
  private getGstBreakdown(totalGst: number, zipCode?: string | null) {
    return computeGstLumpBreakdown(
      totalGst,
      this.isDeliveryInUP(zipCode),
    );
  }
  async count({ filters = {} }: ICount) {
    return await this.prisma.order.count({ where: filters });
  }

  async findAllTaxesOnCategory(category_id: string) {
    const taxSelect: Prisma.InvoiceTaxSelect = {
      label: true,
      description: true,
      type: true,
      percentage: true,
    };

    const gstTax = await this.prisma.invoiceTax.findFirst({
      where: {
        type: 'GST',
        OR: [
          { categories: { none: {} } },
          { categories: { some: { id: category_id } } },
        ],
      },
      select: taxSelect,
    });

    // find the invoice taxes that either has no categories or has categories that includes this one
    const otherTaxes = await this.prisma.invoiceTax.findMany({
      where: {
        type: { not: 'GST' },
        OR: [
          { categories: { none: {} } },
          { categories: { some: { id: category_id } } },
        ],
      },
      select: taxSelect,
    });

    const taxesToApply = [...otherTaxes, ...(gstTax ? [gstTax] : [])];

    return taxesToApply;
  }

  async prepareDirectCheckoutOrderItemPayload({
    productColor,
    frame_only,
    lens_detail,
    lens_feature,
    power_type,
    prescription,
    taxesToApply,
    discount_amount = 0,
  }: {
    productColor: any;
    frame_only: boolean;
    lens_detail?: any;
    lens_feature?: any;
    power_type?: any;
    prescription?: any;
    taxesToApply: Array<Partial<InvoiceTax>>;
    discount_amount?: number;
  }) {
    const unitPrice =
      productColor.product.price + (frame_only ? 0 : lens_detail?.price ?? 0);
    const totalItemPrice = unitPrice * 1;

    const taxesPayload = taxesToApply.map(
      (tax): Omit<Prisma.OrderItemTaxCreateInput, 'order_item'> => {
        return {
          name: tax.label,
          tax_type: tax.type,
          tax_rate: tax.percentage,
          tax_amount: this.computeTaxAmount(
            totalItemPrice - discount_amount,
            tax,
          ),
        };
      },
    );

    const lensDetailJson = frame_only
      ? ({} as IOrderLensDetail)
      : (lens_detail as IOrderLensDetail);
    const lensFeatureJson = frame_only
      ? ({} as IOrderLensFeature)
      : ({ id: lens_feature.id, title: lens_feature.title } as IOrderLensFeature);
    const powerTypeJson = frame_only
      ? ({} as IOrderPowerType)
      : ({ id: power_type.id, title: power_type.title } as IOrderPowerType);

    const thumbnail =
      productColor.images?.find((img: any) => img.fieldname === 'thumbnail')
        ?.url || '';

    return {
      lens_detail: lensDetailJson,
      lens_feature: lensFeatureJson,
      power_type: powerTypeJson,
      product_color: {
        id: productColor.id,
        color: productColor.colors?.map((c: any) => ({
          color: c.color,
          name: c.name,
        })),
        model_number: productColor.model_number,
        product: {
          id: productColor.product.id,
          model_name: productColor.product.model_name,
          listing_price: productColor.product.listing_price,
          price: productColor.product.price,
          discount_percent: productColor.product.discount_percent,
          slug: productColor.product.slug,
          lens_height: productColor.product.lens_height,
          lens_width: productColor.product.lens_width,
          frame_width: productColor.product.frame_width,
        },
        thumbnail,
      } as InputJsonValue,
      price: totalItemPrice,
      frame_only,
      prescription: (prescription as InputJsonValue) ?? undefined,
      quantity: 1,
      discount: discount_amount,
      taxes: {
        create: taxesPayload,
      },
    };
  }

  async prepareOrderItemPayload(
    cart_item: ICartItem,
    taxesToApply: Array<Partial<InvoiceTax>>,
    discount_amount: number,
  ) {
    const totalItemPrice = cart_item.price * cart_item.quantity;

    const taxesPayload = taxesToApply.map(
      (tax): Omit<Prisma.OrderItemTaxCreateInput, 'order_item'> => {
        return {
          name: tax.label,
          tax_type: tax.type,
          tax_rate: tax.percentage,
          tax_amount: this.computeTaxAmount(
            totalItemPrice - discount_amount,
            tax,
          ),
        };
      },
    );

    const lensDetailJson = cart_item.frame_only
      ? ({} as IOrderLensDetail)
      : (cart_item.lens_detail as IOrderLensDetail);
    const lensFeatureJson = cart_item.frame_only
      ? ({} as IOrderLensFeature)
      : ({
          id: cart_item.lens_feature?.id,
          title: cart_item.lens_feature?.title,
        } as IOrderLensFeature);
    const powerTypeJson = cart_item.frame_only
      ? ({} as IOrderPowerType)
      : ({
          id: cart_item.power_type?.id,
          title: cart_item.power_type?.title,
        } as IOrderPowerType);

    return {
      lens_detail: lensDetailJson,
      lens_feature: lensFeatureJson,
      power_type: powerTypeJson,
      product_color: {
        id: cart_item.product_color.id,
        color: cart_item.product_color.colors?.map((c) => ({
          color: c.color,
          name: c.name,
        })),
        model_number: cart_item.product_color.model_number,
        product: {
          id: cart_item.product_color.product.id,
          model_name: cart_item.product_color.product.model_name,
          listing_price: cart_item.product_color.product.listing_price,
          price: cart_item.product_color.product.price,
          discount_percent: cart_item.product_color.product.discount_percent,
          slug: cart_item.product_color.product.slug,
          lens_height: cart_item.product_color.product.lens_height,
          lens_width: cart_item.product_color.product.lens_width,
          frame_width: cart_item.product_color.product.frame_width,
        },
        thumbnail:
          cart_item.product_color.images.find(
            (image: any) => image.fieldname === 'thumbnail',
          )?.url || '',
      } as InputJsonValue,
      price: totalItemPrice,
      frame_only: cart_item.frame_only,
      prescription: cart_item.prescription as InputJsonValue,
      quantity: cart_item.quantity,
      discount: discount_amount,
      taxes: {
        create: taxesPayload,
      },
    };
  }

  async createOrder({
    user_id,
    cart_items,
    coupon = null,
    source,
    prisma = this.prisma,
  }: ICreateOrder) {
    const order_items_create_payload = [];
    const discountPercentOrFixed = !coupon
      ? 0
      : coupon.discount_type === DiscountType.FIXED
        ? coupon.discount_value / (cart_items.length || 1)
        : coupon.discount_value;

    for (const cart_item of cart_items) {
      let discount = 0;

      if (coupon) {
        if (coupon.discount_type === DiscountType.FIXED) {
          // still okay to split fixed discount across items
          discount = discountPercentOrFixed;
        } else if (coupon.discount_type === DiscountType.PERCENT) {
          // FIX: apply percentage to total price for the item
          discount =
            (cart_item.price * cart_item.quantity * coupon.discount_value) /
            100;
        }
      }

      const taxesToApply = await this.findAllTaxesOnCategory(
        cart_item.product_color.product.category_id,
      );

      const orderItemPayload = await this.prepareOrderItemPayload(
        cart_item,
        taxesToApply,
        discount,
      );

      order_items_create_payload.push(orderItemPayload);
    }

    const created = await prisma.order.create({
      data: {
        order_items: {
          create: order_items_create_payload,
        },
        payment: {
          create: {
            mode: 'online',
            status: 'pending',
            provider: 'razorpay',
          },
        },
        user: {
          connect: { id: user_id },
        },
        ...(source && { source }),
      },
      include: {
        order_items: {
          include: {
            taxes: true,
          },
        },
      },
    });

    for (const cart_item of cart_items) {
      const pcId = cart_item.product_color?.id;
      if (pcId) {
        await this.popularityService.recordPurchase(
          pcId,
          cart_item.quantity ?? 1,
          prisma,
        );
      }
    }

    return created;
  }

  /**
   *
   * @param order_items array of order items. each order item should contain taxes array that is array of OrderItemTax
   * @param coupon Optional coupon applied on the order.
   * @returns ICalculation useful when showing order details and saving order pricing. Maps directly to order pricing schema
   */
  /**
   * Compute full pricing (GST, taxes, total) from cart items for guest checkout preview.
   */
  async getCalculationFromCartItems(
    cart_items: ICartItem[],
    coupon: Coupon | null = null,
    delivery_zip_code?: string | null,
  ): Promise<ICalculation> {
    const discountPercentOrFixed = !coupon
      ? 0
      : coupon.discount_type === DiscountType.FIXED
        ? coupon.discount_value / (cart_items.length || 1)
        : coupon.discount_value;

    const orderItemLikes: IOrderItem[] = [];

    for (const cart_item of cart_items) {
      let discount = 0;
      if (coupon) {
        if (coupon.discount_type === DiscountType.FIXED) {
          discount = discountPercentOrFixed;
        } else if (coupon.discount_type === DiscountType.PERCENT) {
          discount =
            (cart_item.price * cart_item.quantity * coupon.discount_value) / 100;
        }
      }

      const taxesToApply = await this.findAllTaxesOnCategory(
        cart_item.product_color.product.category_id,
      );

      const totalItemPrice = cart_item.price * cart_item.quantity;
      const taxesPayload = taxesToApply.map((tax) => ({
        name: tax.label,
        tax_type: tax.type,
        tax_rate: tax.percentage,
        tax_amount: this.computeTaxAmount(totalItemPrice - discount, tax),
      }));

      orderItemLikes.push({
        product_color: cart_item.product_color as any,
        lens_detail: (cart_item.frame_only
          ? { price: 0 }
          : cart_item.lens_detail) as any,
        quantity: cart_item.quantity,
        price: totalItemPrice,
        discount,
        taxes: taxesPayload,
      } as IOrderItem);
    }

    const calculation = this.getCalculation(orderItemLikes, coupon);

    const totalGst = orderItemLikes.reduce(
      (sum, item) =>
        sum +
        (item.taxes?.find((t) => t.tax_type === 'GST')?.tax_amount ?? 0),
      0,
    );
    const totalOtherTaxes = orderItemLikes.reduce(
      (sum, item) =>
        sum +
        (item.taxes?.filter((t) => t.tax_type !== 'GST') ?? []).reduce(
          (s, t) => s + (t.tax_amount ?? 0),
          0,
        ),
      0,
    );

    const gst_breakdown = this.getGstBreakdown(totalGst, delivery_zip_code);

    return {
      ...calculation,
      total_gst: gst_breakdown.total_gst,
      total_other_taxes: totalOtherTaxes,
      gst_breakdown,
    } as ICalculation & {
      total_gst: number;
      total_other_taxes: number;
      gst_breakdown: {
        total_gst: number;
        cgst: number;
        sgst: number;
        igst: number;
        rounded_by: number;
      };
    };
  }

  getGstBreakdownFromOrderItems(
    order_items: Array<{ taxes?: Array<{ tax_type?: string; tax_amount?: number }> }>,
    delivery_zip_code?: string | null,
  ) {
    const totalGst = order_items.reduce(
      (sum, item) =>
        sum +
        (item.taxes?.filter((tax) => tax.tax_type === 'GST') ?? []).reduce(
          (acc, tax) => acc + (tax.tax_amount ?? 0),
          0,
        ),
      0,
    );

    return this.getGstBreakdown(totalGst, delivery_zip_code);
  }

  getCalculation(
    order_items: IOrderItem[],
    coupon: Coupon = null,
  ): ICalculation {
    return {
      ...order_items.reduce(
        (calculated, item) => {
          const productColor = item.product_color as unknown as ProductColor & {
            product: Product;
          };
          const lensDetail = item.lens_detail as unknown as LensDetail;

          return {
            base_subtotal:
              calculated.base_subtotal +
              ((productColor.product.listing_price || 0) +
                (lensDetail.price || 0)) *
                item.quantity,

            subtotal:
              calculated.subtotal +
              ((productColor.product.price || 0) + (lensDetail.price || 0)) *
                item.quantity,

            lens_detail_price:
              calculated.lens_detail_price +
              (lensDetail.price || 0) * item.quantity,

            discount_on_mrp:
              calculated.discount_on_mrp +
              ((productColor.product.listing_price || 0) -
                (productColor.product.price || 0)) *
                item.quantity,

            total:
              calculated.total + (item.price - item.discount),
          };
        },
        {
          base_subtotal: 0,
          subtotal: 0,
          lens_detail_price: 0,
          discount_on_mrp: 0,
          total: 0,
        },
      ),
      shipping_price: 0,
      applied_coupon: coupon
        ? {
            coupon,
            discount: order_items.reduce((acc, item) => acc + item.discount, 0),
          }
        : null,
    };
  }

  calculateSaving(pricing: OrderPricing, order_items: IOrderItem[]): number {
    const saving =
      pricing.discount_on_mrp +
      order_items.reduce((acc, item) => acc + item.discount, 0);
    return saving;
  }

  async createOrderPricing({
    order_id,
    order_items,
    coupon = null,
    prisma = this.prisma,
  }: ICreateOrderPricing) {
    const calculation = this.getCalculation(order_items, coupon);

    return await prisma.orderPricing.create({
      data: {
        ...calculation,
        order: {
          connect: { id: order_id },
        },
      },
    });
  }

  /**
   * Recompute OrderPricing from lines that are not admin-cancelled (invoice line cancel).
   */
  async recalculatePricingForOrder(
    orderId: string,
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        pricing: true,
        order_items: { include: { taxes: true } },
      },
    });
    if (!order?.pricing) {
      return;
    }

    const activeItems = order.order_items.filter((i) =>
      isActiveOrderLine(i as { admin_cancelled_at?: Date | null }),
    );
    const applied = order.pricing.applied_coupon as
      | { coupon?: Coupon; discount?: number }
      | null
      | undefined;
    const coupon = applied?.coupon ?? null;
    const ship = Number(order.pricing.shipping_price || 0);

    if (activeItems.length === 0) {
      await prisma.orderPricing.update({
        where: { order_id: orderId },
        data: {
          base_subtotal: 0,
          subtotal: 0,
          discount_on_mrp: 0,
          lens_detail_price: 0,
          shipping_price: ship,
          total: ship,
          // Mongo Prisma: use plain `null` for optional Json — not `Prisma.JsonNull` (runtime rejects as Enum).
          applied_coupon: coupon != null ? { coupon, discount: 0 } : null,
        },
      });
      return;
    }

    const calculation = this.getCalculation(activeItems as IOrderItem[], coupon);

    await prisma.orderPricing.update({
      where: { order_id: orderId },
      data: {
        base_subtotal: calculation.base_subtotal,
        subtotal: calculation.subtotal,
        discount_on_mrp: calculation.discount_on_mrp,
        lens_detail_price: calculation.lens_detail_price,
        shipping_price: ship,
        total: (calculation.total ?? 0) + ship,
        applied_coupon: calculation.applied_coupon ?? null,
      },
    });
  }

  async createCouponRedemption({
    coupon_id,
    user_id,
    prisma = this.prisma,
  }: IUpdateCouponUsage) {
    return await prisma.couponRedemption.create({
      data: {
        coupon: {
          connect: { id: coupon_id },
        },
        user: {
          connect: { id: user_id },
        },
      },
    });
  }

  private readonly checkoutOrderInclude = {
    pricing: true,
    order_items: {
      include: {
        taxes: true,
      },
    },
    payment: true,
    user: true,
    address: true,
  } as const;

  async findAllInitiatedOrders(user_id: string) {
    return await this.prisma.order.findMany({
      where: { user_id, status: OrderStatus.initiated },
      orderBy: { created_at: 'desc' },
      select: { id: true, created_at: true },
    });
  }

  async deleteInitiatedOrders(
    user_id: string,
    exceptOrderId?: string,
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    await prisma.order.deleteMany({
      where: {
        user_id,
        status: OrderStatus.initiated,
        ...(exceptOrderId ? { id: { not: exceptOrderId } } : {}),
      },
    });
  }

  /**
   * Removes duplicate initiated orders, keeping the newest.
   */
  async cleanupDuplicateInitiatedOrders(user_id: string) {
    const orders = await this.findAllInitiatedOrders(user_id);
    if (orders.length <= 1) {
      return orders[0]?.id;
    }
    const [newest, ...orphans] = orders;
    for (const orphan of orphans) {
      await this.prisma.order.delete({ where: { id: orphan.id } });
    }
    return newest.id;
  }

  private async buildOrderItemsCreatePayloadsFromCart(
    cart_items: ICartItem[],
    coupon: Coupon | null,
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    const order_items_create_payload = [];
    const discountPercentOrFixed = !coupon
      ? 0
      : coupon.discount_type === DiscountType.FIXED
        ? coupon.discount_value / (cart_items.length || 1)
        : coupon.discount_value;

    for (const cart_item of cart_items) {
      let discount = 0;

      if (coupon) {
        if (coupon.discount_type === DiscountType.FIXED) {
          discount = discountPercentOrFixed;
        } else if (coupon.discount_type === DiscountType.PERCENT) {
          discount =
            (cart_item.price * cart_item.quantity * coupon.discount_value) /
            100;
        }
      }

      const taxesToApply = await this.findAllTaxesOnCategory(
        cart_item.product_color.product.category_id,
      );

      const orderItemPayload = await this.prepareOrderItemPayload(
        cart_item,
        taxesToApply,
        discount,
      );

      order_items_create_payload.push(orderItemPayload);
    }

    return order_items_create_payload;
  }

  /**
   * Single initiated checkout order synced from the user's cart (source of truth).
   */
  async syncInitiatedOrderFromCart(user_id: string) {
    return await this.prisma.$transaction(
      async (prisma) => {
        const cart = await this.cartService.ensureCart({ user_id, prisma });
        const cartItems = await this.cartService.findAllItems({
          cart_id: cart.id,
        });

        if (!cartItems.length) {
          throw new BadRequestException('Cannot create order from empty cart');
        }

        const orderValue = this.cartService.calculateOrderValue(cartItems);

        let coupon = await this.cartService.reconcileCartCoupon({
          cart_id: cart.id,
          user_id,
          order_value: orderValue,
          prisma,
        });

        let order = await prisma.order.findFirst({
          where: { user_id, status: OrderStatus.initiated },
          orderBy: { created_at: 'desc' },
          include: this.checkoutOrderInclude,
        });

        if (!order) {
          order = await prisma.order.create({
            data: {
              user: { connect: { id: user_id } },
              source: 'cart',
              payment: {
                create: {
                  mode: 'online',
                  status: 'pending',
                  provider: 'razorpay',
                },
              },
            },
            include: this.checkoutOrderInclude,
          });
        }

        await prisma.orderItem.deleteMany({
          where: { order_id: order.id },
        });

        const itemPayloads = await this.buildOrderItemsCreatePayloadsFromCart(
          cartItems,
          coupon,
          prisma,
        );

        await prisma.order.update({
          where: { id: order.id },
          data: {
            source: 'cart',
            order_items: {
              create: itemPayloads,
            },
          },
        });

        const orderItems = await prisma.orderItem.findMany({
          where: { order_id: order.id },
          include: { taxes: true },
        });

        const calculation = this.getCalculation(
          orderItems as IOrderItem[],
          coupon,
        );

        const existingShipping = Number(order.pricing?.shipping_price ?? 0);
        const shipping_price =
          order.payment?.mode === PaymentMode.cod ? existingShipping || 70 : 0;
        const pricingData = {
          ...calculation,
          shipping_price,
          total: (calculation.total ?? 0) + shipping_price,
        };

        if (order.pricing) {
          await prisma.orderPricing.update({
            where: { order_id: order.id },
            data: pricingData,
          });
        } else {
          await prisma.orderPricing.create({
            data: {
              ...pricingData,
              order: { connect: { id: order.id } },
            },
          });
        }

        await prisma.cart.update({
          where: { id: cart.id },
          data: { checkout_initiated: true },
        });

        await this.deleteInitiatedOrders(user_id, order.id, prisma);

        const synced = await prisma.order.findUnique({
          where: { id: order.id },
          include: this.checkoutOrderInclude,
        });
        if (!synced) {
          throw new NotFoundException('Checkout order not found after sync');
        }
        return synced;
      },
      {
        maxWait: 40000,
        timeout: 10000,
      },
    );
  }

  async fetchInitiatedCheckout(user_id: string) {
    return await this.prisma.order.findFirst({
      where: { user_id, status: OrderStatus.initiated },
      orderBy: {
        created_at: 'desc',
      },
      include: this.checkoutOrderInclude,
    });
  }

  async fetchOrderById(order_id: string, user_id: string) {
    return await this.prisma.order.findFirst({
      where: { id: order_id, user_id },
      include: {
        address: true,
        pricing: true,
        order_items: {
          include: {
            taxes: true,
          },
        },
        payment: true,
        user: {
          include: {
            cart: {
              select: {
                id: true,
                coupon_id: true,
                coupon_quantity_locked: true,
              },
            },
          },
        },
      },
    });
  }

  async updatePricing({
    data,
    order_id,
    prisma = this.prisma,
  }: IUpdatePricing) {
    return await prisma.orderPricing.update({
      where: { order_id },
      data,
    });
  }

  async updateOrderPaymentMode({
    order_id,
    updateOrderPaymentModeDto,
    prisma = this.prisma,
  }: IUpdateOrderPaymentMode) {
    return await prisma.orderPayment.update({
      where: { order_id: order_id },
      data: {
        mode: updateOrderPaymentModeDto.payment_mode,
        provider:
          updateOrderPaymentModeDto.payment_mode === 'cod' ? 'cod' : 'razorpay',
      },
    });
  }

  async updateOrderAddress({
    address_id,
    order_id,
    prisma = this.prisma,
  }: IUpdateOrderAddress) {
    return await prisma.order.update({
      where: { id: order_id },
      data: {
        address: {
          connect: { id: address_id },
        },
      },
    });
  }

  async getPaybleOrder({ order_id, user_id }: IGetPaybleOrder) {
    const order = await this.prisma.order.findFirst({
      where: { id: order_id, user_id },
      include: {
        address: true,
        order_items: true,
        pricing: true,
        payment: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order?.pricing) {
      throw new BadRequestException(
        'The order does not have a pricing information',
      );
    }

    if (!order?.address) {
      throw new BadRequestException('Please select a shipping address');
    }

    if (!order?.order_items.length) {
      throw new BadRequestException('You removed all items from your order');
    }

    return order;
  }

  async updateOrder({ order_id, data, prisma = this.prisma }: IUpdateOrder) {
    return await prisma.order.update({
      where: { id: order_id },
      data,
      include: {
        pricing: true,
        order_items: true,
        payment: true,
        user: true,
        address: true,
      },
    });
  }

  async updateOrderStatus({
    order_id,
    new_status,
    changed_by_id,
    remark,
    prisma = this.prisma,
  }: {
    order_id: string;
    new_status: OrderStatus;
    changed_by_id: string;
    remark?: string;
    prisma?: any;
  }) {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore stock when cancelling a confirmed order (stock was decremented at payment)
      if (new_status === 'cancelled') {
        const existingOrder = await tx.order.findUnique({
          where: { id: order_id },
          include: { order_items: true },
        });

        if (existingOrder?.status === 'confirmed' && existingOrder.order_items) {
          for (const item of existingOrder.order_items) {
            if (!isActiveOrderLine(item)) {
              continue;
            }
            const pc = item.product_color as { id?: string };
            const productColorId = pc?.id;
            const quantity = item.quantity ?? 1;
            if (productColorId) {
              await this.inventoryService.restoreStock(
                productColorId,
                quantity,
                tx,
              );
            }
          }
        }
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order_id },
        data: {
          status: new_status,
          ...(new_status === 'cancelled' && { cancelled_at: new Date() }),
          ...(new_status === 'confirmed' && { confirmed_at: new Date() }),
          ...(new_status === 'picked' && { picked_at: new Date() }),
          ...(new_status === 'delivered' && { delivered_at: new Date() }),
        },
        include: {
          pricing: true,
          payment: true,
          user: true,
          address: true,
          order_items: {
            include: {
              taxes: true,
            },
          },
        },
      });

      await this.invoiceService.syncFromOrderLifecycle(order_id, tx);

      return updatedOrder;
    });

    try {
      if (new_status === 'picked' || new_status === 'delivered') {
        await this.notificationDispatch.notifyCustomerOrderStatus(
          updatedOrder,
          new_status,
        );
      }
    } catch {
      /* non-fatal: notifications must not block order updates */
    }

    return updatedOrder;
  }

  async updateOrderItemsDiscount({
    order_items,
    coupon_code,
    coupon,
    prisma = this.prisma,
  }: IUpdateOrderItemsDiscount) {
    const flatOrPercent =
      coupon?.discount_type === 'FIXED'
        ? coupon.discount_value / (order_items.length || 1)
        : coupon?.discount_value || 0;

    const updateOrderItemPromises = order_items.map(async (oi) => {
      let discount = 0;

      if ((coupon_code ? coupon_code : true) && coupon) {
        if (coupon.discount_type === DiscountType.FIXED) {
          discount = flatOrPercent;
        } else if (coupon.discount_type === DiscountType.PERCENT) {
          discount = percentToAbsolute(oi.price, flatOrPercent);
        }
      }

      const taxUpdates = (oi.taxes ?? []).map((tax) =>
        prisma.orderItemTax.update({
          where: { id: tax.id },
          data: {
            tax_amount: this.computeTaxAmount(oi.price - discount, {
              type: tax.tax_type,
              percentage: tax.tax_rate,
            }),
          },
        }),
      );

      await Promise.all(taxUpdates);

      return prisma.orderItem.update({
        where: { id: oi.id },
        data: { discount },
        include: {
          taxes: true,
        },
      });
    });

    return await Promise.all(updateOrderItemPromises);
  }

  async findAll({ page, page_size, filters = {}, sort_by }: IFindAll) {
    const orders = await this.prisma.order.findMany({
      skip: (page - 1) * page_size,
      take: page_size,
      where: {
        ...filters,
      },
      orderBy: (() => {
        switch (sort_by) {
          case 'created_asc':
            return [{ created_at: 'asc' }];
          case 'created_desc':
            return [{ created_at: 'desc' }];
          case 'name_asc':
            return [{ user: { name: 'asc' } }];
          case 'name_desc':
            return [{ user: { name: 'desc' } }];
          case 'recently_updated':
            return [{ updated_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
      include: {
        pricing: true,
        payment: true,
        order_items: true,
        shipment_details: true,
        address: true,
        invoice: {
          select: {
            id: true,
            status: true,
            invoice_number: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone_number: true,
          },
        },
      },
    });
    return orders;
  }

  async getOrderForPublicTrack(order_id: string) {
    return await this.prisma.order.findFirst({
      where: {
        id: order_id,
        status: { not: 'initiated' },
      },
      select: {
        id: true,
        status: true,
        created_at: true,
        confirmed_at: true,
        picked_at: true,
        delivered_at: true,
        shipment_details: true,
        user: { select: { name: true } },
        address: {
          select: {
            address: true,
            city: true,
            state: true,
            zip_code: true,
          },
        },
      },
    });
  }

  /**
   * Normalize order-item prescriptions (string or object) and hydrate photo
   * RX file ids to File records (mirrors cart.service findAllItems).
   */
  async hydrateOrderItemPrescriptions<
    T extends { prescription?: unknown },
  >(orderItems: T[]): Promise<T[]> {
    return Promise.all(
      orderItems.map(async (item) => {
        const raw = item.prescription;
        if (raw == null) return item;

        let parsed: Record<string, unknown> | null = null;
        try {
          if (typeof raw === 'string') {
            parsed = JSON.parse(raw) as Record<string, unknown>;
          } else if (typeof raw === 'object') {
            parsed = raw as Record<string, unknown>;
          }
        } catch {
          return item;
        }
        if (!parsed) return item;

        if (parsed.type !== 'photo') {
          return { ...item, prescription: parsed };
        }

        const image = parsed.image;
        if (
          image &&
          typeof image === 'object' &&
          typeof (image as { url?: unknown }).url === 'string' &&
          (image as { url: string }).url
        ) {
          return { ...item, prescription: parsed };
        }

        const imageId =
          typeof image === 'string' && image.trim()
            ? image.trim()
            : image &&
                typeof image === 'object' &&
                typeof (image as { id?: unknown }).id === 'string'
              ? (image as { id: string }).id
              : null;

        if (!imageId) {
          return { ...item, prescription: parsed };
        }

        const file = await this.prisma.file.findUnique({
          where: { id: imageId },
          select: this.prisma.getFileSelection(),
        });

        return {
          ...item,
          prescription: {
            ...parsed,
            ...(file ? { image: file } : {}),
          },
        };
      }),
    );
  }

  async upsertOrderShipmentDetails({
    order_id,
    waybill_number,
    tracking_url,
    delivery_partner = 'Delhivery',
    estimated_delivery,
  }: {
    order_id: string;
    waybill_number: string;
    tracking_url: string;
    delivery_partner?: string;
    estimated_delivery?: Date;
  }) {
    const estDelivery =
      estimated_delivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    return await this.prisma.orderShipmentDetails.upsert({
      where: { order_id },
      create: {
        order_id,
        waybill_number,
        tracking_url,
        delivery_partner,
        estimated_delivery: estDelivery,
      },
      update: {
        waybill_number,
        tracking_url,
        delivery_partner,
        estimated_delivery: estDelivery,
      },
    });
  }
}
