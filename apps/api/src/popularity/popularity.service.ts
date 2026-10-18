import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computePopularityScore } from './popularity.constants';

type Db = PrismaService | Prisma.TransactionClient;

@Injectable()
export class PopularityService {
  constructor(private readonly prisma: PrismaService) {}

  private client(db?: Db): Db {
    return db ?? this.prisma;
  }

  private async assertProductColorExists(
    product_color_id: string,
    db: Db,
  ): Promise<void> {
    const pc = await db.productColor.findUnique({
      where: { id: product_color_id },
      select: { id: true },
    });
    if (!pc) {
      throw new NotFoundException('Product color not found');
    }
  }

  private async recalcScore(product_color_id: string, db: Db): Promise<void> {
    const row = await db.popularity.findUnique({
      where: { product_color_id },
    });
    if (!row) return;
    const score = computePopularityScore({
      views: row.views,
      times_liked: row.times_liked,
      times_added_to_cart: row.times_added_to_cart,
      times_shared: row.times_shared,
      times_purchased: row.times_purchased,
    });
    await db.popularity.update({
      where: { product_color_id },
      data: { score },
    });
  }

  async recordView(product_color_id: string, db?: Db): Promise<void> {
    const prisma = this.client(db);
    await this.assertProductColorExists(product_color_id, prisma);
    await prisma.popularity.upsert({
      where: { product_color_id },
      create: {
        product_color_id,
        views: 1,
        score: computePopularityScore({
          views: 1,
          times_liked: 0,
          times_added_to_cart: 0,
          times_shared: 0,
          times_purchased: 0,
        }),
      },
      update: { views: { increment: 1 } },
    });
    await this.recalcScore(product_color_id, prisma);
  }

  async recordWishlistAdd(product_color_id: string, db?: Db): Promise<void> {
    const prisma = this.client(db);
    await this.assertProductColorExists(product_color_id, prisma);
    await prisma.popularity.upsert({
      where: { product_color_id },
      create: {
        product_color_id,
        times_liked: 1,
        score: computePopularityScore({
          views: 0,
          times_liked: 1,
          times_added_to_cart: 0,
          times_shared: 0,
          times_purchased: 0,
        }),
      },
      update: { times_liked: { increment: 1 } },
    });
    await this.recalcScore(product_color_id, prisma);
  }

  async recordAddToCart(product_color_id: string, db?: Db): Promise<void> {
    const prisma = this.client(db);
    await this.assertProductColorExists(product_color_id, prisma);
    await prisma.popularity.upsert({
      where: { product_color_id },
      create: {
        product_color_id,
        times_added_to_cart: 1,
        score: computePopularityScore({
          views: 0,
          times_liked: 0,
          times_added_to_cart: 1,
          times_shared: 0,
          times_purchased: 0,
        }),
      },
      update: { times_added_to_cart: { increment: 1 } },
    });
    await this.recalcScore(product_color_id, prisma);
  }

  async recordShare(product_color_id: string, db?: Db): Promise<void> {
    const prisma = this.client(db);
    await this.assertProductColorExists(product_color_id, prisma);
    await prisma.popularity.upsert({
      where: { product_color_id },
      create: {
        product_color_id,
        times_shared: 1,
        score: computePopularityScore({
          views: 0,
          times_liked: 0,
          times_added_to_cart: 0,
          times_shared: 1,
          times_purchased: 0,
        }),
      },
      update: { times_shared: { increment: 1 } },
    });
    await this.recalcScore(product_color_id, prisma);
  }

  async recordPurchase(
    product_color_id: string,
    quantity: number,
    db?: Db,
  ): Promise<void> {
    if (quantity <= 0) return;
    const prisma = this.client(db);
    await this.assertProductColorExists(product_color_id, prisma);
    await prisma.popularity.upsert({
      where: { product_color_id },
      create: {
        product_color_id,
        times_purchased: quantity,
        score: computePopularityScore({
          views: 0,
          times_liked: 0,
          times_added_to_cart: 0,
          times_shared: 0,
          times_purchased: quantity,
        }),
      },
      update: { times_purchased: { increment: quantity } },
    });
    await this.recalcScore(product_color_id, prisma);
  }
}
