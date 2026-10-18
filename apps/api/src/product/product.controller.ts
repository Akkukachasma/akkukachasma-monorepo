import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { BucketService } from '../bucket/bucket.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { GetProductsDto } from './dto/get-product.dto';
import { GetSearchProductsDto } from './dto/get-search-products.dto';
import { GetSearchSuggestionsDto } from './dto/get-search-suggestions.dto';
import { Prisma } from '@prisma/client';
import { GroupedFilters } from '../category/category.controller';
import { RequiredIdDto } from './dto/common.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PublicApi } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { WishlistService } from '../wishlist/wishlist.service';
import { PopularityService } from '../popularity/popularity.service';
import { RecordProductViewsDto } from './dto/record-product-views.dto';
import { ProductColorEmbeddingService } from '../product-color-embedding/product-color-embedding.service';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_PRODUCT_MUTATION } from '../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { ProductPriceAdjustmentService } from './product-price-adjustment.service';
import { CreatePriceAdjustmentDto } from './dto/create-price-adjustment.dto';

@InvalidateCache(INVALIDATE_ON_PRODUCT_MUTATION)
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService,
    private readonly bucketService: BucketService,
    private readonly wishlistService: WishlistService,
    private readonly popularityService: PopularityService,
    private readonly productColorEmbeddings: ProductColorEmbeddingService,
    private readonly notificationsDispatch: NotificationsDispatchService,
    private readonly productPriceAdjustmentService: ProductPriceAdjustmentService,
  ) {}

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('shape-starters')
  @ApiOperation({
    description: 'Use to fetch all shapes with their minimum priced products.',
  })
  async fetchShapeStarters(): Promise<ApiResponse> {
    let shapes = await this.prisma.shape.findMany({
      select: {
        title: true,
        slug: true,
        products: {
          take: 1,
          skip: 0,
          orderBy: { price: 'asc' },
          select: {
            price: true,
            listing_price: true,
            discount_percent: true,
            product_colors: {
              take: 1,
              skip: 0,
              orderBy: { created_at: 'asc' },
              select: {
                images: {
                  where: { fieldname: 'thumbnail' },
                  select: this.prisma.getFileSelection(),
                },
              },
            },
          },
        },
      },
    });
    shapes = shapes.filter((shape) => shape.products.length);
    return { success: true, data: shapes };
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('latest')
  @ApiOperation({
    description: 'Use to fetch all products uploaded within last 7 days.',
  })
  async fetchLatestProducts(
    @Query() query: GetProductsDto,
    @Tenant() tenant?: ITenant,
  ): Promise<PaginatedResponse> {
    const productWhere: Prisma.ProductWhereInput = {
      ...(query.search && this.productService.getSearchFilters(query.search)),
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    };
    const where: Prisma.ProductColorWhereInput = { product: productWhere };

    const { data, total } = await this.productService.findSeparatedPublicList({
      where,
      page: query.page,
      page_size: query.page_size,
      sort_by: query.sort_by,
    });
    const flaggedProducts = await this.wishlistService.flagProductColors(
      data,
      tenant?.id,
    );
    return {
      success: true,
      data: flaggedProducts,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('featured')
  @ApiOperation({
    description: 'Use to fetch all featured products.',
  })
  async fetchFeaturedProducts(
    @Query() query: GetProductsDto,
    @Tenant() tenant?: ITenant,
  ): Promise<PaginatedResponse> {
    const productWhere: Prisma.ProductWhereInput = {
      ...(query.search && this.productService.getSearchFilters(query.search)),
      is_featured: true,
    };
    const where: Prisma.ProductColorWhereInput = { product: productWhere };

    const { data, total } = await this.productService.findSeparatedPublicList({
      where,
      page: query.page,
      page_size: query.page_size,
      sort_by: query.sort_by,
    });
    const flaggedProducts = await this.wishlistService.flagProductColors(
      data,
      tenant?.id,
    );
    return {
      success: true,
      data: flaggedProducts,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('search-suggestions')
  @ApiOperation({
    description: 'Fetch product search suggestions for autocomplete.',
  })
  async fetchSearchSuggestions(
    @Query() query: GetSearchSuggestionsDto,
  ): Promise<ApiResponse> {
    const data = await this.productService.searchSuggestions(
      query.q || '',
      query.limit || 10,
    );
    return { success: true, data };
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('search')
  @ApiOperation({
    description: 'Search products with optional filters (category, shape, gender).',
  })
  async searchProducts(
    @Query() query: GetSearchProductsDto,
    @Tenant() tenant?: ITenant,
  ): Promise<PaginatedResponse & { filters: GroupedFilters }> {
    const andConditions: Prisma.ProductWhereInput[] = [];
    if (query.category_slug) {
      andConditions.push({ category: { slug: query.category_slug } });
    }
    if (query.shape_slug) {
      andConditions.push({ shape: { slug: query.shape_slug } });
    }
    if (query.gender?.length) {
      andConditions.push({ gender: { in: query.gender as any } });
    }

    const baseFilter: Prisma.ProductColorWhereInput = {
      product:
      andConditions.length > 0 ? { AND: andConditions } : ({} as Prisma.ProductWhereInput),
    };

    const filtersToApply = this.mergeSearchFilters(baseFilter, query);

    const [products, total, filters] =
      await this.productService.fetchWithFilters({
        filters: filtersToApply,
        page: query.page,
        page_size: query.page_size,
        sort_by: query.sort_by,
      });

    const flaggedProducts = await this.wishlistService.flagProductColors(
      products,
      tenant?.id,
    );

    return {
      success: true,
      data: flaggedProducts,
      page: query.page,
      page_size: query.page_size,
      total,
      filters,
    };
  }

  private mergeSearchFilters(
    base: Prisma.ProductColorWhereInput,
    query: GetSearchProductsDto,
  ): Prisma.ProductColorWhereInput {
    const baseProduct = typeof base.product === 'object' ? base.product : {};
    const productWhere: Prisma.ProductWhereInput = {
      ...baseProduct,
      ...(query.search &&
        this.productService.getSearchFilters(query.search)),
    };

    if (query.shape_ids?.length) {
      productWhere.shape_id = { in: query.shape_ids };
    }
    if (query.frame_material_ids?.length) {
      productWhere.frame_material_id = { in: query.frame_material_ids };
    }
    if (query.gender?.length) {
      productWhere.gender = { in: query.gender as any };
    }
    if (query.frame_size?.length) {
      productWhere.frame_size = { hasSome: query.frame_size as any };
    }
    if (query.frame_style?.length) {
      productWhere.frame_style = { in: query.frame_style as any };
    }
    if (query.frame_width?.length) {
      productWhere.frame_width = { in: query.frame_width };
    }
    if (query.lens_width?.length) {
      productWhere.lens_width = { in: query.lens_width };
    }

    const result: Prisma.ProductColorWhereInput = {
      ...base,
      product: productWhere,
    };
    if (query.color_ids?.length) {
      result.colors = {
        some: { id: { in: query.color_ids } },
      };
    }
    return result;
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get('popular')
  @ApiOperation({
    description: 'Use to fetch all popular products.',
  })
  async fetchPopularProducts(
    @Query() query: GetProductsDto,
    @Tenant() tenant?: ITenant,
  ): Promise<PaginatedResponse> {
    const productWhere: Prisma.ProductWhereInput = {
      ...(query.search && this.productService.getSearchFilters(query.search)),
    };
    const where: Prisma.ProductColorWhereInput = { product: productWhere };

    const { data, total } = await this.productService.findSeparatedPublicList({
      where,
      page: query.page,
      page_size: query.page_size,
      popular: true,
      sort_by: query.sort_by,
    });
    const flaggedProducts = await this.wishlistService.flagProductColors(
      data,
      tenant?.id,
    );
    return {
      success: true,
      data: flaggedProducts,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  // Fetch all products (admin list: ProductColor rows with nested product)
  @Get()
  @Roles('admin')
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({
    description:
      'Admin: paginated ProductColor rows with full nested product (search, stock_scope)',
  })
  async fetchAllProducts(
    @Query() query: GetProductsDto,
  ): Promise<PaginatedResponse> {
    const search = (query.search ?? query.search_term)?.trim();
    const stock_scope = query.stock_scope ?? 'all';

    const data = await this.productService.findAllAdminProductColors({
      page: query.page,
      page_size: query.page_size,
      search,
      stock_scope,
      sort_by: query.sort_by,
    });
    const total = await this.productService.countAdminProductColors({
      search,
      stock_scope,
    });

    return {
      success: true,
      data,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get(':slug/details')
  @ApiOperation({
    description: 'Fetch product details by slug. It is a public API endpoint.',
  })
  async fetchProductBySlug(
    @Param('slug') slug: string,
    @Query('model_number') model_number?: string,
    @Tenant() tenant?: ITenant, // mark as optional
  ): Promise<ApiResponse> {
    const product = await this.productService.findBySlug(slug);

    let is_wishlisted = false;

    if (tenant && product?.id) {
      const pcs = product.product_colors ?? [];
      const byRoute =
        model_number != null && String(model_number).length > 0
          ? pcs.find(
              (pc) => String(pc.model_number) === String(model_number),
            )
          : undefined;
      const selectedPc = byRoute ?? pcs[0];
      if (selectedPc?.id) {
        const existing = await this.prisma.wishlist.findUnique({
          where: {
            user_id_product_color_id: {
              user_id: tenant.id,
              product_color_id: selectedPc.id,
            },
          },
        });
        is_wishlisted = Boolean(existing);
      }
    }

    const product_colors = (product.product_colors ?? []).map((pc) => ({
      ...pc,
      embeddings: (pc.embeddings ?? []).map((emb) =>
        this.productColorEmbeddings.serialize(emb),
      ),
    }));

    return {
      success: true,
      data: product
        ? {
            ...this.productService.enrichPublicProduct(product),
            product_colors,
            is_wishlisted,
          }
        : null,
    };
  }

  @PublicApi()
  @Patch(':slug/views')
  @ApiOperation({
    description:
      'Increment view count for a product variant. Optional body: product_color_id or model_number; defaults to first variant by created_at.',
  })
  async updateProductViews(
    @Param('slug') slug: string,
    @Body() body?: RecordProductViewsDto,
  ): Promise<ApiResponse> {
    const product = await this.productService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const product_color_id = await this.productService.resolveProductColorIdForView(
      product.id,
      body ?? {},
    );
    await this.popularityService.recordView(product_color_id);
    return { success: true, message: 'Product views updated successfully.' };
  }

  @Post('price-adjustments')
  @Roles('admin')
  @ApiOperation({
    description:
      'Queue a bulk increase/decrease of listing_price and price for all frame products (not lenses). Runs in the background; poll GET price-adjustments for status.',
  })
  async createPriceAdjustment(
    @Body() dto: CreatePriceAdjustmentDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const result = await this.productPriceAdjustmentService.createAdjustment(
      tenant.id,
      dto,
    );
    return {
      success: true,
      data: result,
      message: 'Price adjustment started. Products will update in the background.',
    };
  }

  @Get('price-adjustments')
  @Roles('admin')
  @ApiOperation({
    description: 'List bulk product price adjustments newest first (audit).',
  })
  async listPriceAdjustments(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<ApiResponse> {
    const data = await this.productPriceAdjustmentService.listAdjustments(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
    return { success: true, data };
  }

  // Fetch single product
  @Get(':id')
  @Roles('admin')
  @Cacheable({ ttl: 60, scope: 'user' })
  async fetchProduct(
    @Param() requiredIdDto: RequiredIdDto,
  ): Promise<ApiResponse> {
    const product = await this.productService.findOne({
      id: requiredIdDto.id,
    });
    return { success: true, data: product };
  }

  @Post()
  @Roles('admin')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exist = await this.productService.exist({
      slug: createProductDto.slug,
    });
    if (exist) {
      throw new BadRequestException('A product with same slug exists');
    }

    const product = await this.productService.create({
      user_id: tenant.id,
      createProductDto,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Product',
        entityType: 'Product',
        entityId: product?.id,
      })
      .catch(() => {});
    return { success: true, message: 'Product created successfully.' };
  }

  // Update product
  @Put(':id')
  @Roles('admin')
  async updateProduct(
    @Param() requiredIdDto: RequiredIdDto,
    @Body() updateProductDto: UpdateProductDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exist = await this.productService.exist({
      id: requiredIdDto.id,
    });
    if (!exist) {
      throw new BadRequestException('A product with same model number exists');
    }

    if (updateProductDto.slug) {
      const duplicateSlug = await this.productService.isDuplicateSlug({
        id: requiredIdDto.id,
        slug: updateProductDto.slug,
      });

      if (duplicateSlug) {
        throw new BadRequestException('A product with same slug exists');
      }
    }

    await this.productService.update({
      id: requiredIdDto.id,
      updateProductDto,
      product: exist,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Product',
        entityType: 'Product',
        entityId: requiredIdDto.id,
      })
      .catch(() => {});
    return { success: true, message: 'Product updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  async deleteProduct(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const files = await this.productService.findAllFiles(params.id);
    await this.prisma.$transaction(async (prisma) => {
      await this.productService.remove({
        product_id: params.id,
        prisma,
      });
      if (files.length > 0) {
        const deleteFilePromises = files.map((file) =>
          this.bucketService.remove(file.key),
        );
        await Promise.all(deleteFilePromises);
      }
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Product',
        entityType: 'Product',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Product deleted successfully.' };
  }
}
