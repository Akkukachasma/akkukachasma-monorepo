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
} from '@nestjs/common';
import { ShapeService } from './shape.service';
import { CreateShapeDto } from './dto/create-shape.dto';
import { UpdateShapeDto } from './dto/update-shape.dto';
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
import { GetShapeDto } from './dto/get-shape.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { generateSlug } from '../../lib/utils';
import { GetCategoryProductsDto } from '../category/dto/get-category-products.dto';
import { ProductService } from '../product/product.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { GroupedFilters } from '../category/category.controller';
import { WishlistService } from '../wishlist/wishlist.service';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_SHAPE_MUTATION } from '../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@InvalidateCache(INVALIDATE_ON_SHAPE_MUTATION)
@ApiTags('Shapes')
@Controller('shapes')
export class ShapeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shapeService: ShapeService,
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
  @Get(':slug/products')
  async fetchProductsByCategory(
    @Query() query: GetCategoryProductsDto,
    @Param('slug') slug: string,
    @Tenant() tenant?: ITenant, // optional access to tenant object
  ): Promise<PaginatedResponse & { filters: GroupedFilters }> {
    const baseFilter: Prisma.ProductColorWhereInput = {
      product: {
        shape: {
          slug,
        },
      },
    };

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
    description: 'This api is used to create shape.',
  })
  async create(
    @Body() createShapeDto: CreateShapeDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    createShapeDto.slug =
      createShapeDto.slug || generateSlug(createShapeDto.title);
    const duplicate = await this.shapeService.isDuplicateSlug({
      slug: createShapeDto.slug,
    });
    if (duplicate) {
      throw new ConflictException('Slug already exists');
    }
    const { image, ...rest } = createShapeDto;
    const data = await this.prisma.$transaction(async (prisma) => {
      const shape = await this.shapeService.create({
        user_id: tenant.id,
        createShapeDto: rest,
        prisma,
      });
      if (image) {
        await this.fileService.update({
          file_id: image,
          data: {
            is_temp: false,
            shape: {
              connect: { id: shape.id },
            },
          },
          prisma,
        });
      }
      return shape;
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Shape',
        entityType: 'Shape',
        entityId: data?.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    description: 'This api is used to fetch all the shape.',
  })
  async findAll(@Query() query: GetShapeDto): Promise<PaginatedResponse> {
    const filters: Prisma.ShapeWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
    };
    const data = await this.shapeService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.shapeService.count({ filters });
    return {
      success: true,
      total,
      page: query.page,
      page_size: query.page_size,
      data,
    };
  }


  @Get(':slug')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    description: 'This api is used to fetch a single shape.',
  })
  async fetchSingleShapeDetails(
    @Param() params: {slug: string},
  ): Promise<ApiResponse> {
    const shape = await this.shapeService.findOneBySlug(params.slug);
    if (!shape) {
      throw new NotFoundException('Shape does not exists.');
    }

    return { success: true, data: shape };
  }



  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api to update the details of a shape. Accepts shape id in params.',
  })
  async updateShapeDetails(
    @Body() updateShapeDto: UpdateShapeDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.shapeService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Shape does not exists.');
    }

    if (updateShapeDto.title || updateShapeDto.slug) {
      updateShapeDto.slug =
        updateShapeDto.slug || generateSlug(updateShapeDto.title);
      const duplicate = await this.shapeService.isDuplicateSlug({
        slug: updateShapeDto.slug,
        shape_id: params.id,
      });
      if (duplicate) {
        throw new ConflictException('Slug already exists');
      }
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && updateShapeDto.image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }
        const { image, ...rest } = updateShapeDto;
        const updatedShape = await this.shapeService.update({
          shape_id: params.id,
          updateShapeDto: rest,
          prisma,
        });
        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              shape: {
                connect: { id: updatedShape.id },
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
        entityLabel: 'Shape',
        entityType: 'Shape',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a shape record. Accepts the shape id in params.',
  })
  async deleteShape(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.shapeService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Shape does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.image) await this.bucketService.remove(exists.image.key);
        await this.shapeService.delete({
          shape_id: params.id,
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
        entityLabel: 'Shape',
        entityType: 'Shape',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
