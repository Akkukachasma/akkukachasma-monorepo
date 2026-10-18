import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay = require('razorpay');
import { ActivityLoggerService } from '../activity/activity-logger.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private readonly activityLogger: ActivityLoggerService,
  ) {
    this.initializeRazorpay();
  }

  private initializeRazorpay() {
    const keyId = this.configService.get<string>('RAZORPAY_KEY');
    const keySecret = this.configService.get<string>('RAZORPAY_SECRET');

    if (!keyId || !keySecret) {
      this.activityLogger.logError(
        'Payment: Razorpay keys not configured',
        'RAZORPAY_KEY or RAZORPAY_SECRET missing',
        { source: 'payment' },
      );
      throw new Error('Razorpay keys are not configured properly');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.logger.log('Razorpay initialized successfully');
  }

  getRazorpayInstance(): Razorpay {
    return this.razorpay;
  }

  async createOrder(amount: number, currency: string = 'INR', options?: any) {
    try {
      const integerAmount = Math.round(Number(amount) * 100); // Razorpay expects amount in paise
      const order = await this.razorpay.orders.create({
        amount: integerAmount,
        currency,
        ...options,
      });

      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error: any) {
      this.logger.error('Error creating order:', error);
      this.activityLogger.logError(
        'Payment: Razorpay createOrder failed',
        error?.message,
        { source: 'payment', amount, currency },
      );
      throw error;
    }
  }

  async verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ): Promise<boolean> {
    try {
      const keySecret = this.configService.get<string>('RAZORPAY_SECRET');

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        this.logger.log(
          `Payment verified successfully: ${razorpay_payment_id}`,
        );
      } else {
        this.logger.warn(`Payment verification failed: ${razorpay_payment_id}`);
        this.activityLogger.logError(
          'Payment: verification failed',
          `Signature mismatch for payment ${razorpay_payment_id}`,
          {
            source: 'payment',
            razorpay_order_id,
            razorpay_payment_id,
          },
        );
      }

      return isAuthentic;
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      return false;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      this.logger.error('Error fetching payment:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      this.logger.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Refund a payment. Used when stock decrement fails after payment capture.
   * @param paymentId Razorpay payment_id (transaction_id)
   * @param amount Optional amount in paise; full refund if omitted
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<{ id: string } | null> {
    try {
      const options = amount ? { amount } : {};
      const refund = await this.razorpay.payments.refund(paymentId, options);
      this.logger.log(`Refund initiated: payment ${paymentId}`);
      return refund as { id: string };
    } catch (error) {
      this.logger.error(`Refund failed for payment ${paymentId}:`, error);
      return null;
    }
  }
}
