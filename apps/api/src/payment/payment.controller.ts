import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MakePaymentDto, VerifyPaymentDto } from './dto/payment.dto';
import { OrderService } from '../order/order.service';
import { CartService } from '../cart/cart.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiResponse, PrismaService } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { ConfigService } from '@nestjs/config';
import { PaymentGatewayDataDto } from './dto/payment-response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus, PaymentMode, PaymentStatus } from '@prisma/client';
import { isActiveOrderLine } from '../order/order-item-active';
import { ICalculation } from '../cart/type';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceService } from '../invoice/invoice.service';
import { DelhiveryService } from '../delhivery/delhivery.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { CompanyInfoService } from '../setting/company-info/company-info.service';

@Controller('payment')
@ApiTags('Payment APIs')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly inventoryService: InventoryService,
    private readonly invoiceService: InvoiceService,
    private readonly delhiveryService: DelhiveryService,
    private readonly activityLogger: ActivityLoggerService,
    private readonly notificationDispatch: NotificationsDispatchService,
    private readonly companyInfoService: CompanyInfoService,
  ) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ summary: 'Initiate payment for an order' })
  async makePayment(
    @Body() makePaymentDto: MakePaymentDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse<PaymentGatewayDataDto>> {
    let order = await this.orderService.getPaybleOrder({
      order_id: makePaymentDto.order_id,
      user_id: tenant.id,
    });

    await this.delhiveryService.assertPincodeDeliverable(order.address.zip_code, {
      requireCod: order.payment?.mode === PaymentMode.cod,
      allowUnverified: true,
      acknowledgeUnverified: !!makePaymentDto.acknowledge_unverified_pincode,
    });

    if (
      !order.order_id &&
      order.payment.mode !== PaymentMode.cod &&
      order.payment.status !== 'completed'
    ) {
      order = await this.prisma.$transaction(
        async (prisma) => {
          const rzpOrder = await this.paymentService.createOrder(
            order.pricing.total,
          );

          const updatedOrder = await this.orderService.updateOrder({
            order_id: order.id,
            data: {
              order_id: rzpOrder.id,
              notes: makePaymentDto.notes,
            },
            prisma,
          });
          return updatedOrder;
        },
        {
          maxWait: 40000,
          timeout: 60000,
        },
      );
    } else if (
      order.payment.mode === PaymentMode.cod &&
      order.payment.status !== 'completed'
    ) {
      const codEnabled = await this.companyInfoService.isCodEnabled();
      if (!codEnabled) {
        throw new BadRequestException(
          'Cash on Delivery is currently unavailable. Please choose online payment.',
        );
      }
      // COD: decrement stock before confirming (rollback prior decrements on failure)
      const decremented: Array<{ productColorId: string; quantity: number }> =
        [];
      try {
        for (const item of order.order_items.filter(isActiveOrderLine)) {
          const pc = item.product_color as { id?: string };
          const productColorId = pc?.id;
          const quantity = item.quantity ?? 1;

          if (!productColorId) continue;

          const { success } = await this.inventoryService.decrementStock(
            productColorId,
            quantity,
          );

          if (!success) {
            throw new BadRequestException(
              'Item went out of stock. Please remove it and try again.',
            );
          }
          decremented.push({ productColorId, quantity });
        }
      } catch (err) {
        for (const d of decremented) {
          try {
            await this.inventoryService.restoreStock(
              d.productColorId,
              d.quantity,
            );
          } catch (restoreErr: any) {
            this.logger.error(
              `COD stock restore failed for ${d.productColorId}: ${restoreErr?.message}`,
            );
          }
        }
        throw err;
      }

      order = await this.orderService.updateOrder({
        order_id: order.id,
        data: {
          confirmed_at: new Date(),
          status: OrderStatus.confirmed,
          notes: makePaymentDto.notes,
        },
      });

      // Empty cart for COD — confirm coupon lock (do not restore quantity)
      const appliedCouponCod = order.pricing
        ?.applied_coupon as unknown as ICalculation['applied_coupon'];
      if (appliedCouponCod?.coupon) {
        await this.prisma.couponRedemption.create({
          data: {
            coupon: { connect: { id: appliedCouponCod.coupon.id } },
            redeemed_at: new Date(),
            user: { connect: { id: tenant.id } },
          },
        });
      }

      const cart = await this.prisma.cart.findUnique({
        where: { user_id: tenant.id },
      });
      if (cart) {
        await this.cartService.removeCouponFromCart({
          cart_id: cart.id,
          confirm: true,
        });
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            checkout_initiated: false,
            items: { deleteMany: {} },
          },
        });
      }

      this.activityLogger.logInfo(
        'Payment: COD order confirmed',
        `Order ${order.id} confirmed`,
        { source: 'payment', order_id: order.id, user_id: tenant.id },
        tenant.id,
      );

      try {
        await this.notificationDispatch.notifyCustomerOrderConfirmed(order);
        await this.notificationDispatch.notifyAdminsNewOrder(order);
      } catch (e: any) {
        this.logger.warn(`Order confirmation notifications failed: ${e?.message}`);
      }

      // Create invoice for COD
      try {
        await this.invoiceService.createInvoiceFromOrder(order.id, tenant.id);
        await this.invoiceService.syncFromOrderLifecycle(order.id);
      } catch {
        // Idempotent - invoice creation logs to activity on failure
      }
    }

    return {
      success: true,
      data: {
        order_id:
          order.payment.mode === PaymentMode.cod ? order.id : order.order_id,
        amount: Math.round(Number(order.pricing.total) * 100), // Amount in paise
        currency: 'INR',
        name: 'Akku Ka Chasma',
        description: `Order #${order.id}`,
        mode: order.payment.mode,
        key: this.configService.get<string>('RAZORPAY_KEY'),
        prefill: {
          name: order.user.name,
          email: order.user.email,
          contact: order.user.phone_number,
        },
        theme: {
          color: '#3399cc',
        },
      },
      message: 'Payment initiated. Opening Razorpay gateway.',
    };
  }

  @Post('verify')
  @Roles('customer')
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_id,
      } = verifyPaymentDto;

      const order = await this.orderService.fetchOrderById(order_id, tenant.id);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.order_id &&
        order.order_id !== razorpay_order_id
      ) {
        throw new BadRequestException('Payment does not match this order');
      }

      const isValidPayment = await this.paymentService.verifyPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      );

      if (!isValidPayment) {
        this.activityLogger.logError(
          'Payment: verification failed',
          `Signature mismatch for order ${order_id}`,
          {
            source: 'payment',
            order_id,
            razorpay_order_id,
            razorpay_payment_id,
            user_id: tenant.id,
          },
          tenant.id,
        );
        // Must throw: frontend treats any HTTP 200 as checkout success.
        throw new BadRequestException('Payment verification failed');
      }

      if (order.status !== 'initiated') {
        return {
          data: order,
          success: true,
          message: 'Payment verified successfully',
        };
      }

      const isValid = await this.prisma.$transaction(
        async (prisma) => {
          // 1. Decrement stock first - if any fails, refund and abort
          for (const item of order.order_items.filter(isActiveOrderLine)) {
            const pc = item.product_color as { id?: string };
            const productColorId = pc?.id;
            const quantity = item.quantity ?? 1;

            if (!productColorId) continue;

            const { success } = await this.inventoryService.decrementStock(
              productColorId,
              quantity,
              prisma,
            );

            if (!success) {
              await this.paymentService.refundPayment(razorpay_payment_id);
              throw new BadRequestException(
                'Item went out of stock. Payment has been refunded. Please try again.',
              );
            }
          }

          // 2. Update order status
          await this.orderService.updateOrder({
            order_id,
            data: {
              status: OrderStatus.confirmed,
              confirmed_at: new Date(),
            },
            prisma,
          });

          // 3. Update payment status
          await prisma.orderPayment.update({
            where: { order_id },
            data: {
              paid_at: new Date(),
              status: PaymentStatus.completed,
              provider: 'razorpay',
              transaction_id: razorpay_payment_id,
              signature: razorpay_signature,
            },
          });

          // 4. Coupon redemption
          const appliedCoupon = order.pricing
            ?.applied_coupon as unknown as ICalculation['applied_coupon'];

          if (appliedCoupon?.coupon) {
            await prisma.couponRedemption.create({
              data: {
                coupon: {
                  connect: { id: appliedCoupon.coupon.id },
                },
                redeemed_at: new Date(),
                user: {
                  connect: { id: tenant.id },
                },
              },
            });
          }

          // 5. Empty cart — confirm coupon lock (do not restore quantity)
          const cart = await prisma.cart.findUnique({
            where: { user_id: tenant.id },
          });
          if (cart) {
            await this.cartService.removeCouponFromCart({
              cart_id: cart.id,
              confirm: true,
              prisma,
            });
            await prisma.cart.update({
              where: { id: cart.id },
              data: {
                checkout_initiated: false,
                items: { deleteMany: {} },
              },
            });
          }

          return true;
        },
        {
          maxWait: 40000,
          timeout: 60000,
        },
      );

      // Invoice must run after the transaction commits: InvoiceService uses the root
      // Prisma client, so reads inside $transaction would not see payment as completed
      // and sync on the tx client could miss the invoice row — leaving status stuck unpaid.
      if (isValid) {
        try {
          await this.invoiceService.createInvoiceFromOrder(order_id, tenant.id);
          await this.invoiceService.syncFromOrderLifecycle(order_id);
        } catch {
          // Idempotent - invoice creation logs to activity on failure
        }
      }

      this.activityLogger.logSuccess(
        'Order: payment completed',
        `Order ${order_id} paid via Razorpay`,
        {
          source: 'order',
          order_id,
          razorpay_payment_id,
          user_id: tenant.id,
        },
        tenant.id,
      );

      if (isValid) {
        try {
          const full = await this.orderService.fetchOrderById(order_id, tenant.id);
          await this.notificationDispatch.notifyCustomerOrderConfirmed(full);
          await this.notificationDispatch.notifyAdminsNewOrder(full);
        } catch (e: any) {
          this.logger.warn(`Order confirmation notifications failed: ${e?.message}`);
        }
      }

      return {
        data: order,
        success: isValid,
        message: 'Payment verified successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        (error as Error)?.message ||
          'Something went wrong while verifying the payment.',
      );
    }
  }

  @Get(':id/details')
  @Roles('customer')
  @ApiOperation({ summary: 'Get payment details for an order' })
  async fetchPaymentDetails(
    @Tenant() tenant: ITenant,
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    const order = await this.orderService.fetchOrderById(params.id, tenant.id);
    if (!order) throw new NotFoundException('Order not found');

    if (!order.pricing) throw new NotFoundException('Invalid request');
    if (!order.payment) throw new NotFoundException('Invalid request');

    if (!order.pricing.total) throw new NotFoundException('Invalid request');

    const payment = {
      mode: order.payment.mode,
      payment_status: order.payment.status,
      order_status: order.status,
      order_id:
        order.payment.mode === PaymentMode.cod ? order.id : order.order_id,
      amount: Number(order.pricing.total?.toFixed(2)),
      currency: 'INR',
      transaction_id:
        order.payment.mode === PaymentMode.cod
          ? order.payment.id
          : order.payment.transaction_id,
      email: order.user.email,
      phone_number: order.user.phone_number,
    };

    return { success: true, data: payment };
  }
}
