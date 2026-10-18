import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IWithTransactionClient, PrismaService } from '../prisma/prisma.service';

export interface DecrementResult {
  success: boolean;
}

/**
 * Inventory service for atomic stock operations.
 * Uses raw MongoDB for conditional decrement to prevent overselling.
 * Treats null stock_quantity as 0 (out of stock).
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically decrement stock only if available >= quantity.
   * Treats null stock_quantity as 0.
   * @returns success: true if decremented, false if insufficient stock
   */
  async decrementStock(
    product_color_id: string,
    quantity: number,
    prisma: IWithTransactionClient['prisma'] = this.prisma,
  ): Promise<DecrementResult> {
    try {
      const result = (await prisma.$runCommandRaw({
        update: 'ProductColor',
        updates: [
          {
            q: {
              _id: { $oid: product_color_id },
              $expr: {
                $gte: [
                  { $ifNull: ['$stock_quantity', 0] },
                  quantity,
                ],
              },
            },
            u: { $inc: { stock_quantity: -quantity } },
            multi: false,
          },
        ],
      })) as { n: number; nModified: number };

      const success = result.nModified === 1;

      if (!success) {
        this.logger.warn(
          `Stock decrement failed for product_color ${product_color_id}: insufficient stock`,
        );
      }

      return { success };
    } catch (error) {
      this.logger.error(
        `Stock decrement error for product_color ${product_color_id}:`,
        error,
      );
      return { success: false };
    }
  }

  /**
   * Restore stock (increment). Used when order is cancelled.
   * No condition; we are putting back what we took.
   */
  async restoreStock(
    product_color_id: string,
    quantity: number,
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    try {
      await prisma.$runCommandRaw({
        update: 'ProductColor',
        updates: [
          {
            q: { _id: { $oid: product_color_id } },
            u: { $inc: { stock_quantity: quantity } },
            multi: false,
          },
        ],
      });

      this.logger.log(
        `Stock restored: product_color ${product_color_id}, +${quantity}`,
      );
    } catch (error) {
      this.logger.error(
        `Stock restore error for product_color ${product_color_id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if product_color has sufficient stock.
   * Treats null as 0.
   */
  async hasSufficientStock(
    product_color_id: string,
    quantity: number,
    prisma: PrismaService = this.prisma,
  ): Promise<boolean> {
    const pc = await prisma.productColor.findUnique({
      where: { id: product_color_id },
      select: { stock_quantity: true },
    });

    if (!pc) return false;

    const available = pc.stock_quantity ?? 0;
    return available >= quantity;
  }
}
