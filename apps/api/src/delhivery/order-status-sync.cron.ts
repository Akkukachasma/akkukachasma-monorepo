import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatusSyncService } from './order-status-sync.service';

@Injectable()
export class OrderStatusSyncCron {
  private readonly logger = new Logger(OrderStatusSyncCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderStatusSyncService: OrderStatusSyncService,
  ) {}

  @Cron('0 */20 * * * *')
  async syncOpenShipments() {
    const openOrders = await this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.confirmed, OrderStatus.picked],
        },
        shipment_details: {
          is: {
            waybill_number: {
              not: null,
            },
          },
        },
      },
      select: {
        id: true,
        status: true,
        shipment_details: {
          select: {
            waybill_number: true,
          },
        },
      },
      take: 200,
      orderBy: {
        updated_at: 'asc',
      },
    });

    for (const order of openOrders) {
      try {
        await this.orderStatusSyncService.syncOrderFromDelhiveryIfNeeded(
          order.id,
          order,
        );
      } catch (error: any) {
        this.logger.warn(
          `Delhivery poll sync failed for order ${order.id}: ${error?.message || 'unknown error'}`,
        );
      }
    }
  }
}
