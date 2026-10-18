import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  PriceAdjustmentDirection,
  PriceAdjustmentMode,
  PriceAdjustmentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { computeDiscountPercent } from '../../lib/utils';
import { CreatePriceAdjustmentDto } from './dto/create-price-adjustment.dto';
import { applyPriceAdjustment } from './product-price-adjustment.math';

const UPDATE_BATCH_SIZE = 75;
const IN_PROGRESS_STATUSES: PriceAdjustmentStatus[] = [
  PriceAdjustmentStatus.pending,
  PriceAdjustmentStatus.processing,
];

type ItemRow = {
  product_id: string;
  old_listing_price: number;
  new_listing_price: number;
  old_price: number;
  new_price: number;
  clamped: boolean;
};

@Injectable()
export class ProductPriceAdjustmentService {
  private readonly logger = new Logger(ProductPriceAdjustmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async createAdjustment(adminUserId: string, dto: CreatePriceAdjustmentDto) {
    const inProgress = await this.prisma.productPriceAdjustment.findFirst({
      where: { status: { in: IN_PROGRESS_STATUSES } },
      select: { id: true, status: true },
    });
    if (inProgress) {
      throw new ConflictException(
        'A price adjustment is already in progress. Wait for it to finish before starting another.',
      );
    }

    const productsTotal = await this.prisma.product.count();
    if (productsTotal === 0) {
      throw new BadRequestException('No products to adjust');
    }

    const adjustment = await this.prisma.productPriceAdjustment.create({
      data: {
        direction: dto.direction,
        mode: dto.mode,
        value: dto.value,
        notes: dto.notes?.trim() || null,
        created_by_id: adminUserId,
        status: PriceAdjustmentStatus.pending,
        products_total: productsTotal,
        products_updated: 0,
        products_clamped: 0,
        products_skipped: 0,
      },
    });

    setImmediate(() => {
      void this.runAdjustmentJob(adjustment.id, adminUserId, dto);
    });

    this.logger.log(
      `Price adjustment ${adjustment.id} queued (pending) for ${productsTotal} product(s)`,
    );

    return {
      adjustment_id: adjustment.id,
      status: PriceAdjustmentStatus.pending as PriceAdjustmentStatus,
      products_total: productsTotal,
      products_updated: 0,
      products_clamped: 0,
      products_skipped: 0,
      direction: dto.direction as PriceAdjustmentDirection,
      mode: dto.mode as PriceAdjustmentMode,
      value: dto.value,
    };
  }

  private async runAdjustmentJob(
    adjustmentId: string,
    adminUserId: string,
    dto: CreatePriceAdjustmentDto,
  ) {
    try {
      await this.prisma.productPriceAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: PriceAdjustmentStatus.processing,
          started_at: new Date(),
        },
      });

      const products = await this.prisma.product.findMany({
        select: {
          id: true,
          listing_price: true,
          price: true,
        },
      });

      const itemRows: ItemRow[] = [];
      let productsUpdated = 0;
      let productsClamped = 0;
      let productsSkipped = 0;

      for (const product of products) {
        const next = applyPriceAdjustment(
          {
            listing_price: product.listing_price,
            price: product.price,
          },
          {
            direction: dto.direction,
            mode: dto.mode,
            value: dto.value,
          },
        );

        const unchanged =
          next.listing_price === round2(product.listing_price) &&
          next.price === round2(product.price);

        if (unchanged) {
          productsSkipped += 1;
          continue;
        }

        if (next.clamped) productsClamped += 1;
        productsUpdated += 1;
        itemRows.push({
          product_id: product.id,
          old_listing_price: product.listing_price,
          new_listing_price: next.listing_price,
          old_price: product.price,
          new_price: next.price,
          clamped: next.clamped,
        });
      }

      for (let i = 0; i < itemRows.length; i += UPDATE_BATCH_SIZE) {
        const chunk = itemRows.slice(i, i + UPDATE_BATCH_SIZE);

        await Promise.all(
          chunk.map((row) =>
            this.prisma.product.update({
              where: { id: row.product_id },
              data: {
                listing_price: row.new_listing_price,
                price: row.new_price,
                discount_percent: computeDiscountPercent(
                  row.new_price,
                  row.new_listing_price,
                ),
              },
            }),
          ),
        );

        await this.prisma.productPriceAdjustmentItem.createMany({
          data: chunk.map((row) => ({
            adjustment_id: adjustmentId,
            product_id: row.product_id,
            old_listing_price: row.old_listing_price,
            new_listing_price: row.new_listing_price,
            old_price: row.old_price,
            new_price: row.new_price,
            clamped: row.clamped,
          })),
        });
      }

      await this.prisma.productPriceAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: PriceAdjustmentStatus.completed,
          completed_at: new Date(),
          products_total: products.length,
          products_updated: productsUpdated,
          products_clamped: productsClamped,
          products_skipped: productsSkipped,
          error_message: null,
        },
      });

      this.activityLogger.logSuccess(
        'Product: bulk price adjustment',
        `${dto.direction} ${dto.mode} ${dto.value} — updated ${productsUpdated}, clamped ${productsClamped}, skipped ${productsSkipped}`,
        {
          source: 'product_price_adjustment',
          adjustment_id: adjustmentId,
          direction: dto.direction,
          mode: dto.mode,
          value: dto.value,
          products_total: products.length,
          products_updated: productsUpdated,
          products_clamped: productsClamped,
          products_skipped: productsSkipped,
        },
        adminUserId,
      );

      this.logger.log(
        `Price adjustment ${adjustmentId}: updated=${productsUpdated} clamped=${productsClamped} skipped=${productsSkipped}`,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.slice(0, 500)
          : 'Unknown error during price adjustment';

      this.logger.error(
        `Price adjustment ${adjustmentId} failed: ${message}`,
        err instanceof Error ? err.stack : undefined,
      );

      try {
        await this.prisma.productPriceAdjustment.update({
          where: { id: adjustmentId },
          data: {
            status: PriceAdjustmentStatus.failed,
            completed_at: new Date(),
            error_message: message,
          },
        });
      } catch (updateErr: unknown) {
        this.logger.error(
          `Failed to mark price adjustment ${adjustmentId} as failed`,
          updateErr instanceof Error ? updateErr.stack : undefined,
        );
      }

      this.activityLogger.logError(
        'Product: bulk price adjustment',
        message,
        {
          source: 'product_price_adjustment',
          adjustment_id: adjustmentId,
        },
        adminUserId,
      );
    }
  }

  async listAdjustments(page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [total, rows] = await Promise.all([
      this.prisma.productPriceAdjustment.count(),
      this.prisma.productPriceAdjustment.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take,
        include: {
          created_by: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: rows,
      total,
      page: Math.max(page, 1),
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    };
  }
}

function round2(n: number): number {
  return Math.round(Number(n) * 100) / 100;
}
