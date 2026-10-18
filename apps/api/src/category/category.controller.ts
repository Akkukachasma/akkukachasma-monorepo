import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  NotFoundException,
  ConflictException,
  Patch,
  ParseArrayPipe,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { GetCategoryDto } from './dto/get-category.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { generateSlug } from '../../lib/utils';
import { GetCategoryProductsDto } from './dto/get-category-products.dto';
import { ProductService } from '../product/product.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { WishlistService } from '../wishlist/wishlist.service';
import { ReorderCategoryDto } from './dto/reorder-category.dto';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_CATEGORY_MUTATION } from '../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

/** Matches DistinctFilters from ProductService */
export type GroupedFilters = import('../product/product.service').DistinctFilters;

@InvalidateCache(INVALIDATE_ON_CATEGORY_MUTATION)
@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly productService: ProductService,
    private readonly wishlistService: WishlistService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  private mergeProductFilters(
    base: Prisma.ProductColorWhereInput,
    query: GetCategoryProductsDto,
  ): Prisma.ProductColorWhereInput {
    const productWhere: Prisma.ProductWhereInput = {
      ...(typeof base.product === 'object' ? base.product : {}),
    };

    // Shape
    if (query.shape_ids?.length) {
      productWhere.shape_id = { in: query.shape_ids };
    }

    // Frame material
    if (query.frame_material_ids?.length) {
      productWhere.frame_material_id = { in: query.frame_material_ids };
    }

    // Gender
    if (query.gender?.length) {
      productWhere.gender = { in: query.gender as any };
    }

    // Frame size (array field, use hasSome)
    if (query.frame_size?.length) {
      productWhere.frame_size = { hasSome: query.frame_size as any };
    }

    // Frame style
    if (query.frame_style?.length) {
      productWhere.frame_style = { in: query.frame_style as any };
    }

    // Frame width
    if (query.frame_width?.length) {
      productWhere.frame_width = { in: query.frame_width };
    }

    // Lens width
    if (query.lens_width?.length) {
      productWhere.lens_width = { in: query.lens_width };
    }

    const result: Prisma.ProductColorWhereInput = {
      ...base,
      product: productWhere,
    };

    // Color filter: ProductColor has colors relation
    if (query.color_ids?.length) {
      result.colors = {
        some: { id: { in: query.color_ids } },
      };
    }

    return result;
  }

  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @Get(':slug/products')
  async fetchProductsByCategory(
    @Query() query: GetCategoryProductsDto,
    @Param('slug') slug: string,
    @Tenant() tenant?: ITenant,
  ): Promise<PaginatedResponse & { filters: GroupedFilters }> {
    const baseFilter: Prisma.ProductColorWhereInput = {
      product: {
        category: {
          slug,
        },
      },
    };

    // Merge user-selected filters into base filter
    const filtersToApply = this.mergeProductFilters(baseFilter, query);

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
      total: total,
      filters: filters,
    };
  }

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create category.',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    createCategoryDto.slug =
      createCategoryDto.slug || generateSlug(createCategoryDto.title);
    const duplicate = await this.categoryService.isDuplicateSlug({
      slug: createCategoryDto.slug,
    });
    if (duplicate) {
      throw new ConflictException('Slug already exists');
    }
    const { image, ...rest } = createCategoryDto;
    const data = await this.prisma.$transaction(
      async (prisma) => {
        const category = await this.categoryService.create({
          user_id: tenant.id,
          createCategoryDto: rest,
          prisma,
        });
        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              category: {
                connect: {
                  id: category.id,
                },
              },
            },
            prisma,
          });
        }
        return category;
      },
      { maxWait: 40000, timeout: 50000 },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Category',
        entityType: 'Category',
        entityId: data?.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    description: 'This api is used to fetch all the categories.',
  })
  async findAll(@Query() query: GetCategoryDto): Promise<PaginatedResponse> {
    const filters: Prisma.CategoryWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
    };
    const data = await this.categoryService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.categoryService.count({ filters });
    return {
      success: true,
      total,
      page: query.page,
      page_size: query.page_size,
      data,
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api to update the details of a category. Accepts category id in params.',
  })
  async updateCategoryDetails(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.categoryService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Category does not exists.');
    }

    if (updateCategoryDto.title || updateCategoryDto.slug) {
      updateCategoryDto.slug =
        updateCategoryDto.slug || generateSlug(updateCategoryDto.title);
      const duplicate = await this.categoryService.isDuplicateSlug({
        slug: updateCategoryDto.slug,
        category_id: params.id,
      });
      if (duplicate) {
        throw new ConflictException('Slug already exists');
      }
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && updateCategoryDto.image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }
        const { image, ...rest } = updateCategoryDto;
        const updatedCategory = await this.categoryService.update({
          category_id: params.id,
          updateCategoryDto: rest,
          prisma,
        });

        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              category: {
                connect: { id: updatedCategory.id },
              },
            },
            prisma,
          });
        }
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Category',
        entityType: 'Category',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Get(':slug')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    description: 'This api is used to fetch a single category.',
  })
  async fetchSingleCategoryDetails(
    @Param() params: {slug: string},
  ): Promise<ApiResponse> {
    const category = await this.categoryService.findOneBySlug(params.slug);

    if (!category) {
      throw new NotFoundException('Category does not exists.');
    }

    return { success: true, data: category };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a category record. Accepts the category id in params.',
  })
  async deleteCategory(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.categoryService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Category does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.image) await this.bucketService.remove(exists.image.key);
        await this.categoryService.delete({
          category_id: params.id,
          prisma,
        });
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Category',
        entityType: 'Category',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }

  @Patch('reorder')
  @Roles('admin')
  @ApiOperation({ description: 'Update category ordering.' })
  async reorderCategories(
    @Body(new ParseArrayPipe({ items: ReorderCategoryDto }))
    payload: ReorderCategoryDto[],
  ): Promise<ApiResponse> {
    if (!payload.length) {
      throw new BadRequestException('Reorder payload cannot be empty.');
    }
    const idSet = new Set(payload.map((p) => p.id));
    const orderSet = new Set(payload.map((p) => p.order));
    if (idSet.size !== payload.length) {
      throw new BadRequestException('Duplicate category ids in payload.');
    }
    if (orderSet.size !== payload.length) {
      throw new BadRequestException('Duplicate order values in payload.');
    }

    await this.categoryService.reorder({
      updates: payload.map((p) => ({ id: p.id, order: p.order })),
    });
    return { success: true, message: 'Reordered successfully.' };
  }
}
