import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { PrismaService } from '../prisma/prisma.service';
import { IProductColor } from './types';
import { Prisma } from '@prisma/client';
import { PopularityService } from '../popularity/popularity.service';

/** Product payload aligned with listing APIs (see ProductService.fetchWithFilters). */
const productSelectForWishlistCard = {
  price: true,
  discount_percent: true,
  listing_price: true,
  model_name: true,
  is_featured: true,
  frame_size: true,
  frame_width: true,
  lens_width: true,
  id: true,
  slug: true,
  stock_quantity: true,
  category: {
    select: {
      id: true,
      title: true,
    },
  },
  frame_material: {
    select: {
      id: true,
      title: true,
    },
  },
  shape: {
    select: {
      id: true,
      title: true,
    },
  },
  power_types: {
    select: {
      id: true,
      title: true,
    },
  },
} satisfies Prisma.ProductSelect;

export type WishlistListItem = {
  wishlist_id: string;
  wishlisted_at: Date | null;
  item: Record<string, unknown>;
};

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly popularityService: PopularityService,
  ) {}

  async create(createDto: CreateWishlistDto, user_id: string) {
    const pc = await this.prisma.productColor.findUnique({
      where: { id: createDto.product_color_id },
      select: { id: true },
    });
    if (!pc) {
      throw new NotFoundException('Product color not found');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        user_id_product_color_id: {
          user_id,
          product_color_id: createDto.product_color_id,
        },
      },
    });
    if (existing) {
      return existing;
    }

    try {
      const created = await this.prisma.wishlist.create({
        data: {
          product_color_id: createDto.product_color_id,
          user_id,
        },
      });
      await this.popularityService.recordWishlistAdd(createDto.product_color_id);
      return created;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return this.prisma.wishlist.findUniqueOrThrow({
          where: {
            user_id_product_color_id: {
              user_id,
              product_color_id: createDto.product_color_id,
            },
          },
        });
      }
      throw e;
    }
  }

  async findAll(user_id: string): Promise<WishlistListItem[]> {
    const rows = await this.prisma.wishlist.findMany({
      where: { user_id },
      orderBy: { wishlisted_at: 'desc' },
      include: {
        product_color: {
          select: {
            id: true,
            model_number: true,
            stock_quantity: true,
            created_at: true,
            updated_at: true,
            color_ids: true,
            colors: true,
            images: { select: this.prisma.getFileSelection() },
            popularity: {
              select: {
                score: true,
              },
            },
            product: {
              select: productSelectForWishlistCard,
            },
          },
        },
      },
    });

    const out: WishlistListItem[] = [];
    for (const row of rows) {
      const pc = row.product_color;
      const product = pc.product;
      out.push({
        wishlist_id: row.id,
        wishlisted_at: row.wishlisted_at,
        item: {
          id: pc.id,
          model_number: pc.model_number,
          stock_quantity: pc.stock_quantity,
          color_ids: pc.colors.map((c) => c.id),
          product_id: product.id,
          product,
          colors: pc.colors,
          images: pc.images,
          created_at: pc.created_at,
          updated_at: pc.updated_at,
          popularity: pc.popularity,
        },
      });
    }
    return out;
  }

  async findOne(id: string, user_id: string) {
    const item = await this.prisma.wishlist.findFirst({
      where: { id, user_id },
      include: { product_color: true },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    return item;
  }

  async remove(id: string, user_id: string) {
    await this.findOne(id, user_id);
    return this.prisma.wishlist.delete({ where: { id } });
  }

  async removeByProductColorId(product_color_id: string, user_id: string) {
    const existing = await this.prisma.wishlist.findFirst({
      where: { user_id, product_color_id },
    });
    if (!existing) {
      throw new NotFoundException('Wishlist item not found');
    }
    return this.prisma.wishlist.delete({ where: { id: existing.id } });
  }

  async clear(user_id: string) {
    await this.prisma.wishlist.deleteMany({ where: { user_id } });
  }

  async flagProductColors(product_colors: IProductColor[], user_id: string) {
    if (!user_id)
      return product_colors.map((p) => ({ ...p, is_wishlisted: false }));

    const wishlistItems = await this.prisma.wishlist.findMany({
      where: { user_id },
      select: { product_color_id: true },
    });

    const wishlistSet = new Set(
      wishlistItems.map((w) => w.product_color_id),
    );

    return product_colors.map((product_color) => ({
      ...product_color,
      is_wishlisted: wishlistSet.has(product_color.id),
    }));
  }
}
