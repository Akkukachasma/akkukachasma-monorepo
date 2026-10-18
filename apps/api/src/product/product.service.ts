import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { computeDiscountPercent } from '../../lib/utils';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { Prisma, Product, ProductColor } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { IProductColor } from '../wishlist/types';
interface IExist {
  id?: string;
  slug?: string;
}
interface IisDuplicateSlug {
  id: string;
  slug: string;
}
interface ICreate {
  user_id: string;
  createProductDto: CreateProductDto;
}
interface IFindAll extends PaginateQueryDto {
  user_id?: string;
  filters?: Prisma.ProductWhereInput;
  sort_by?: string;
}
interface ICount extends IWithTransactionClient {
  filters?: Prisma.ProductWhereInput;
  user_id?: string;
}

interface IUpdate {
  id: string;
  updateProductDto: UpdateProductDto;
  product: Product;
}

interface IRemove extends IWithTransactionClient {
  product_id: string;
}

interface IFetchAvailableFilters extends IWithTransactionClient {
  filters?: Prisma.ProductColorWhereInput;
}

interface IFetchWithFilters extends Omit<IFindAll, 'filters'> {
  filters?: Prisma.ProductColorWhereInput;
  popular?: boolean;
}

interface IFindSeparatedPublicList {
  where: Prisma.ProductColorWhereInput;
  page: number;
  page_size: number;
  popular?: boolean;
  sort_by?: string;
}

interface IFindAllAdminProductColors extends PaginateQueryDto {
  search?: string;
  stock_scope?: 'all' | 'out_of_stock';
  sort_by?: string;
}

interface ICountAdminProductColors {
  search?: string;
  stock_scope?: 'all' | 'out_of_stock';
}
export type DistinctFilters = {
  frame_styles: string[];
  genders: string[];
  frame_sizes: string[];
  frame_widths: number[];
  lens_widths: number[];
  shapes: Array<{ id: string; title: string }>;
  frame_materials: Array<{ id: string; title: string }>;
  colors: Array<{ id: string; color: string; name?: string | null }>;
};
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }

  getSearchFilters(term: string): Prisma.ProductWhereInput {
    if (!term) return {};
    return {
      OR: [
        { model_name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { seo_title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { tags: { hasSome: term.toLowerCase().split(' ') } },
        ...(!isNaN(Number(term))
          ? [
            { price: { equals: Number(term) } },
            { model_number: { equals: Number(term) } },
          ]
          : []),
      ],
    };
  }

  /** Product-level ordering (admin); popularity sorts use `buildProductColorSort` on ProductColor. */
  buildSort(
    sort_by?: string,
  ):
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] {
    switch (sort_by) {
      case 'created_asc':
        return [{ created_at: 'asc' }];
      case 'created_desc':
        return [{ created_at: 'desc' }];
      case 'name_asc':
        return [{ model_name: 'asc' }];
      case 'name_desc':
        return [{ model_name: 'desc' }];
      case 'recently_updated':
        return [{ updated_at: 'desc' }];
      default:
        return [{ created_at: 'desc' }];
    }
  }

  private readonly GENDER_MATCHES: Array<{ value: string; label: string; keywords: string[] }> = [
    { value: 'MALE', label: 'Men', keywords: ['men', 'male', 'man'] },
    { value: 'FEMALE', label: 'Women', keywords: ['women', 'female', 'woman'] },
    { value: 'UNISEX', label: 'Unisex', keywords: ['unisex'] },
    { value: 'OTHER', label: 'Other', keywords: ['other'] },
  ];

  async searchSuggestions(q: string, limit: number = 14) {
    if (!q || q.trim().length < 2) return [];
    const term = q.trim().toLowerCase();
    const results: Array<
      | { type: 'category'; title: string; slug: string }
      | { type: 'shape'; title: string; slug: string }
      | { type: 'gender'; value: string; label: string }
      | {
        type: 'product';
        model_name: string;
        slug: string;
        model_number: string | null;
        image_url: string | null;
      }
    > = [];

    const [categories, shapes, products] = await Promise.all([
      this.prisma.category.findMany({
        where: { title: { contains: term, mode: 'insensitive' } },
        select: { title: true, slug: true },
        take: 3,
        orderBy: { title: 'asc' },
      }),
      this.prisma.shape.findMany({
        where: { title: { contains: term, mode: 'insensitive' } },
        select: { title: true, slug: true },
        take: 3,
        orderBy: { title: 'asc' },
      }),
      this.prisma.product.findMany({
        where: {
          OR: [
            { model_name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
            { product_colors: { some: { model_number: { contains: term, mode: 'insensitive' } } } }
          ],
        },
        select: {
          model_name: true,
          slug: true,
          product_colors: {
            take: 1,
            orderBy: { created_at: 'asc' },
            select: {
              model_number: true,
              images: {
                take: 1,
                select: { url: true },
              },
            },
          },
        },
        take: 6,
        orderBy: { model_name: 'asc' },
      }),
    ]);

    for (const c of categories) {
      results.push({ type: 'category', title: c.title, slug: c.slug });
    }
    for (const s of shapes) {
      results.push({ type: 'shape', title: s.title, slug: s.slug });
    }
    for (const { value, label, keywords } of this.GENDER_MATCHES) {
      if (
        keywords.some((k) => k.includes(term) || term.includes(k)) &&
        results.filter((r) => r.type === 'gender').length < 2
      ) {
        results.push({ type: 'gender', value, label });
      }
    }
    for (const p of products) {
      const pc = p.product_colors[0];
      results.push({
        type: 'product',
        model_name: p.model_name,
        slug: p.slug,
        model_number: pc?.model_number ?? null,
        image_url: pc?.images?.[0]?.url ?? null,
      });
    }

    return results.slice(0, limit);
  }

  /**
   * ProductColor listing order: optional popularity score first, then Product fields
   * (nested under `product`).
   */
  buildProductColorSort(
    popular: boolean = false,
    sort_by?: string,
  ): Prisma.ProductColorOrderByWithRelationInput[] {
    const popularity: Prisma.ProductColorOrderByWithRelationInput[] = popular
      ? [{ popularity: { score: 'desc' } }]
      : [];
    const productField = (
      field: Prisma.ProductOrderByWithRelationInput,
    ): Prisma.ProductColorOrderByWithRelationInput => ({ product: field });
    switch (sort_by) {
      case 'created_asc':
        return [...popularity, productField({ created_at: 'asc' })];
      case 'created_desc':
        return [...popularity, productField({ created_at: 'desc' })];
      case 'name_asc':
        return [...popularity, productField({ model_name: 'asc' })];
      case 'name_desc':
        return [...popularity, productField({ model_name: 'desc' })];
      case 'recently_updated':
        return [...popularity, productField({ updated_at: 'desc' })];
      default:
        return [...popularity, productField({ created_at: 'desc' })];
    }
  }

  /**
   * Storefront listing row (ProductColor + nested product subset).
   * Used by search and home list endpoints (ISeparatedProduct shape on the client).
   */
  enrichPublicProduct<T extends { price: number; listing_price: number; discount_percent?: number }>(
    product: T,
  ): T {
    return {
      ...product,
      discount_percent: computeDiscountPercent(
        product.price,
        product.listing_price,
      ),
    };
  }

  /** Recompute discount from price/MRP so stale DB values never show as 100% OFF. */
  private enrichPublicProductColorRow<T extends { product: { price: number; listing_price: number; discount_percent?: number } }>(
    row: T,
  ): T {
    return {
      ...row,
      product: this.enrichPublicProduct(row.product),
    };
  }

  getPublicSeparatedProductColorSelect(): Prisma.ProductColorSelect {
    return {
      id: true,
      created_at: true,
      updated_at: true,
      product_id: true,
      color_ids: true,
      model_number: true,
      stock_quantity: true,
      colors: true,
      images: { select: this.prisma.getFileSelection() },
      popularity: {
        select: {
          score: true,
        },
      },
      product: {
        select: {
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
        },
      },
    };
  }

  /** Shared admin/public list shape for Product (keeps findAll and admin ProductColor list in sync). */
  private getAdminProductListInclude(): Prisma.ProductInclude {
    return {
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
      product_colors: {
        select: {
          model_number: true,
          colors: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          images: {
            select: this.prisma.getFileSelection(),
          },
        },
      },
      power_types: {
        select: {
          id: true,
          title: true,
        },
      },
    };
  }

  private buildAdminProductColorWhere(params: {
    search?: string;
    stock_scope?: 'all' | 'out_of_stock';
  }): Prisma.ProductColorWhereInput {
    const and: Prisma.ProductColorWhereInput[] = [];
    const searchTerm = params.search?.trim();
    if (searchTerm) {
      const productSearch = this.getSearchFilters(searchTerm);
      const or: Prisma.ProductColorWhereInput[] = [
        {
          model_number: { contains: searchTerm, mode: 'insensitive' },
        },
      ];
      if (Object.keys(productSearch).length > 0) {
        or.push({ product: productSearch });
      }
      and.push({ OR: or });
    }
    if (params.stock_scope === 'out_of_stock') {
      and.push({
        OR: [{ stock_quantity: null }, { stock_quantity: { lte: 0 } }],
      });
    }
    if (and.length === 0) return {};
    return { AND: and };
  }

  async findAllAdminProductColors({
    page,
    page_size,
    search,
    stock_scope = 'all',
    sort_by,
  }: IFindAllAdminProductColors) {
    const where = this.buildAdminProductColorWhere({ search, stock_scope });
    return await this.prisma.productColor.findMany({
      where,
      skip: page_size * (page - 1),
      take: page_size,
      orderBy: this.buildProductColorSort(false, sort_by),
      include: {
        colors: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        images: {
          select: this.prisma.getFileSelection(),
        },
        product: {
          include: this.getAdminProductListInclude(),
        },
      },
    });
  }

  async countAdminProductColors({
    search,
    stock_scope = 'all',
  }: ICountAdminProductColors) {
    const where = this.buildAdminProductColorWhere({ search, stock_scope });
    return await this.prisma.productColor.count({ where });
  }

  async findAll({
    page,
    page_size,
    user_id,
    filters,
    sort_by,
  }: IFindAll) {
    return await this.prisma.product.findMany({
      where: { ...(user_id && { user_id }), ...(filters && filters) },
      skip: page_size * (page - 1),
      take: page_size,
      orderBy: this.buildSort(sort_by),
      include: this.getAdminProductListInclude(),
    });
  }

  async findBySlug(
    slug: string,
  ): Promise<
    Prisma.ProductGetPayload<{
      include: {
        frame_material: true;
        shape: true;
        product_colors: {
          include: {
            colors: true;
            images: true;
            popularity: true;
            embeddings: {
              include: { video: true };
            };
          };
        };
        power_types: {
          include: { image: true };
        };
        category: {
          select: { title: true; slug: true };
        };
      };
    }> | null
  > {
    return await this.prisma.product.findUnique({
      where: { slug },
      include: {
        frame_material: true,
        shape: true,
        product_colors: {
          include: {
            colors: true,
            images: true,
            popularity: true,
            embeddings: {
              orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
              include: { video: true },
            },
          },
        },
        power_types: {
          include: {
            image: { select: this.prisma.getFileSelection() },
          },
        },
        category: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Resolves which ProductColor should receive a view event for a product.
   * Prefers explicit ids; otherwise first variant by created_at (backward compatible).
   */
  async resolveProductColorIdForView(
    product_id: string,
    dto?: { product_color_id?: string; model_number?: string },
  ): Promise<string> {
    if (dto?.product_color_id) {
      const pc = await this.prisma.productColor.findFirst({
        where: { id: dto.product_color_id, product_id },
        select: { id: true },
      });
      if (!pc) {
        throw new BadRequestException(
          'product_color_id does not belong to this product',
        );
      }
      return pc.id;
    }
    if (dto?.model_number != null && String(dto.model_number).length > 0) {
      const pc = await this.prisma.productColor.findFirst({
        where: { product_id, model_number: String(dto.model_number) },
        select: { id: true },
      });
      if (!pc) {
        throw new BadRequestException(
          'model_number does not match a variant of this product',
        );
      }
      return pc.id;
    }
    const first = await this.prisma.productColor.findFirst({
      where: { product_id },
      orderBy: { created_at: 'asc' },
      select: { id: true },
    });
    if (!first) {
      throw new NotFoundException('No product variant found for this product');
    }
    return first.id;
  }

  async findOne({ id }: { id: string }) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        frame_material: true,
        shape: true,
        product_colors: {
          include: {
            colors: true,
            images: true,
          },
        },
        power_types: true,
      },
    });
  }

  async create({ createProductDto, user_id }: ICreate) {
    const {
      color_ids,
      power_type_ids,
      shape_id,
      category_id,
      frame_material_id,
      ...rest
    } = createProductDto;
    return await this.prisma.product.create({
      data: {
        ...rest,
        discount_percent: computeDiscountPercent(rest.price, rest.listing_price),
        user: { connect: { id: user_id } },
        category: { connect: { id: category_id } },
        frame_material: { connect: { id: frame_material_id } },
        shape: { connect: { id: shape_id } },
        product_colors: {
          createMany: {
            data: color_ids?.map((color_group) => ({
              color_ids: color_group.colors,
            })),
          },
        },
        power_types: { connect: power_type_ids?.map((pti) => ({ id: pti })) },
      },
    });
  }

  async count({ filters, user_id, prisma = this.prisma }: ICount) {
    return await prisma.product.count({
      where: { ...(user_id && { user_id }), ...(filters && filters) },
    });
  }

  async update({ id, updateProductDto, product }: IUpdate) {
    const {
      power_type_ids,
      shape_id,
      category_id,
      frame_material_id,
      ...rest
    } = updateProductDto;
    const price = rest.price ?? product.price;
    const listingPrice = rest.listing_price ?? product.listing_price;
    const discountPercent = computeDiscountPercent(price, listingPrice);

    return await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(power_type_ids && {
          power_types: {
            set: power_type_ids.map((pti) => ({ id: pti })),
          },
        }),
        ...(shape_id && { shape: { connect: { id: shape_id } } }),
        ...(category_id && { category: { connect: { id: category_id } } }),
        ...(frame_material_id && {
          frame_material: { connect: { id: frame_material_id } },
        }),
        discount_percent: discountPercent,
      },
    });
  }

  async isDuplicateModelNumber(model_number: number, id?: string) {
    return await this.prisma.product.findFirst({
      where: { model_number, ...(id && { id: { not: id } }) },
    });
  }

  async exist({ id, slug }: IExist) {
    return await this.prisma.product.findUnique({
      where: { ...(id && { id }), ...(slug && { slug }) },
    });
  }

  async isDuplicateSlug({ id, slug }: IisDuplicateSlug) {
    return await this.prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
  }

  async findAllFiles(product_id: string) {
    return await this.prisma.file.findMany({
      where: {
        product_color: {
          product_id,
        },
      },
    });
  }

  async remove({ product_id, prisma = this.prisma }: IRemove) {
    return await prisma.product.delete({
      where: { id: product_id },
    });
  }

  private async fetchAvailableFilters({
    filters,
    prisma = this.prisma,
  }: IFetchAvailableFilters) {
    // Exclude color filter when computing available colors - so selecting a color
    // does not shrink the color options; other filters (shape, frame_width, etc.)
    // still affect the color list.
    const { colors: _colorFilter, ...filtersExcludingColor } =
      filters || ({} as any);

    const productColors = await prisma.productColor.findMany({
      where: filters,
      select: {
        product: {
          select: {
            frame_style: true,
            gender: true,
            frame_size: true,
            frame_width: true,
            lens_width: true,
            shape: {
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
          },
        },
      },
    });
    const distinctColors = await prisma.color.findMany({
      where: {
        product_colors: {
          some: filtersExcludingColor,
        },
      },
      select: {
        id: true,
        color: true,
        name: true,
      },
    });

    const frame_styles = new Set<string>();
    const genders = new Set<string>();
    const frame_sizes = new Set<string>();
    const frame_widths = new Set<number>();
    const lens_widths = new Set<number>();
    const shapesMap = new Map<string, { id: string; title: string }>();
    const frameMaterialsMap = new Map<string, { id: string; title: string }>();
    const colorsMap = new Map<
      string,
      { id: string; color: string; name?: string | null }
    >();

    for (const productColor of productColors) {
      if (productColor.product.frame_style)
        frame_styles.add(productColor.product.frame_style);
      if (productColor.product.gender) genders.add(productColor.product.gender);
      if (productColor.product.frame_size)
        productColor.product.frame_size.forEach((size) =>
          frame_sizes.add(size),
        );
      if (productColor.product.frame_width != null)
        frame_widths.add(productColor.product.frame_width);
      if (productColor.product.lens_width != null)
        lens_widths.add(productColor.product.lens_width);
      if (productColor.product.shape)
        shapesMap.set(
          productColor.product.shape.id,
          productColor.product.shape,
        );
      if (productColor.product.frame_material)
        frameMaterialsMap.set(
          productColor.product.frame_material.id,
          productColor.product.frame_material,
        );

      // Extract nested color strings
      distinctColors.forEach((color) => {
        if (color) colorsMap.set(color.id, color);
      });
    }

    return {
      frame_styles: Array.from(frame_styles),
      genders: Array.from(genders),
      frame_sizes: Array.from(frame_sizes),
      frame_widths: Array.from(frame_widths).sort((a, b) => a - b),
      lens_widths: Array.from(lens_widths).sort((a, b) => a - b),
      shapes: Array.from(shapesMap.values()),
      frame_materials: Array.from(frameMaterialsMap.values()),
      colors: Array.from(colorsMap.values()),
    };
  }

  /** Paginated ProductColor rows for public home-style lists (popular / latest / featured). */
  async findSeparatedPublicList({
    where,
    page,
    page_size,
    popular = false,
    sort_by,
  }: IFindSeparatedPublicList): Promise<{
    data: IProductColor[];
    total: number;
  }> {
    const skip = page_size * (page - 1);
    const [data, total] = await Promise.all([
      this.prisma.productColor.findMany({
        where,
        skip,
        take: page_size,
        orderBy: this.buildProductColorSort(popular, sort_by),
        select: this.getPublicSeparatedProductColorSelect(),
      }),
      this.prisma.productColor.count({ where }),
    ]);
    return {
      data: (data as unknown as IProductColor[]).map((row) =>
        this.enrichPublicProductColorRow(row as any),
      ),
      total,
    };
  }

  private isTransientDbError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false;
    const code = (err as { code?: string }).code;
    if (code === 'P2010' || code === 'P1001' || code === 'P1002') return true;
    const message = String((err as { message?: string }).message ?? '');
    return (
      message.includes('TransientTransactionError') ||
      message.includes('Connection reset by peer') ||
      message.includes('I/O error')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchWithFilters({
    page,
    page_size,
    filters,
    popular,
    sort_by,
  }: IFetchWithFilters) {
    const skip = page_size * (page - 1);
    const runQueries = async () => {
      const [products, total, distinctFilters] = await Promise.all([
        this.prisma.productColor.findMany({
          where: filters,
          skip,
          take: page_size,
          orderBy: this.buildProductColorSort(popular, sort_by),
          select: this.getPublicSeparatedProductColorSelect(),
        }),
        this.prisma.productColor.count({
          where: filters,
        }),
        this.fetchAvailableFilters({ filters }),
      ]);
      return [products, total, distinctFilters] as const;
    };

    const maxAttempts = 3;
    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const [products, total, distinctFilters] = await runQueries();
        const enriched = (products as IProductColor[]).map((row) =>
          this.enrichPublicProductColorRow(row as any),
        );
        return [enriched, total, distinctFilters] as unknown as [
          IProductColor[],
          number,
          DistinctFilters,
        ];
      } catch (err) {
        lastError = err;
        if (!this.isTransientDbError(err) || attempt === maxAttempts - 1) {
          throw err;
        }
        await this.delay(150 * (attempt + 1));
      }
    }
    throw lastError;
  }
}
