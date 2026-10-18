import {
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
import { ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { UpdateBannerDto, UpdateBannerOrderDto } from './dto/update-banner.dto';
import { GetBannersDto } from './dto/get-banners.dto';
import { GetRelatedBannersDto } from './dto/get-related-banners.dto';
import { Prisma } from '@prisma/client';
import { PublicApi } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_BANNER_MUTATION } from '../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@ApiTags('Banner Management')
@InvalidateCache(INVALIDATE_ON_BANNER_MUTATION)
@Controller('banners')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly bucketService: BucketService,
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const banner = await this.bannerService.create({
      createBannerDto,
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Banner',
        entityType: 'Banner',
        entityId: banner.id,
      })
      .catch(() => {});
    return {
      success: true,
      data: banner,
      message: 'Banner created successfully',
    };
  }

  @Patch('reorder')
  @Roles('admin')
  async updateOrders(
    @Body() updateBannerDto: UpdateBannerOrderDto,
  ): Promise<ApiResponse> {
    const data = await this.bannerService.updateOrder(
      updateBannerDto.new_orders,
    );
    return { success: true, data, message: 'Order updated successfully' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  async findAll(@Query() query: GetBannersDto): Promise<PaginatedResponse> {
    const filters: Prisma.BannerWhereInput = {
      ...(query.search_term && {
        categories: {
          some: {
            title: {
              contains: query.search_term,
              mode: 'insensitive',
            },
          },
        },
      }),
    };

    const data = await this.bannerService.findAll({
      filters,
      page: query.page,
      page_size: query.page_size,
    });

    const total = await this.bannerService.count(filters);

    return {
      success: true,
      data,
      message: 'Banners fetched successfully',
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Get('home')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  async findHomePageBanners(): Promise<ApiResponse> {
    const filters: Prisma.BannerWhereInput = {
      show_on_home: true,
      is_active: true,
    };
    const data = await this.bannerService.findAll({
      filters,
      page: 1,
      page_size: 100,
    });

    return {
      success: true,
      data,
      message: 'Banners fetched successfully',
    };
  }

  @Get('related')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  async findRelatedBanners(
    @Query() query: GetRelatedBannersDto,
  ): Promise<ApiResponse> {
    const { category_id, shape_id } = query;
    if (!category_id && !shape_id) {
      return {
        success: true,
        data: [],
        message: 'Banners fetched successfully',
      };
    }
    const filters: Prisma.BannerWhereInput = {
      is_active: true,
      OR: [
        ...(category_id ? [{ category_ids: { has: category_id } }] : []),
        ...(shape_id ? [{ shape_ids: { has: shape_id } }] : []),
      ],
    };
    const data = await this.bannerService.findAll({
      filters,
      page: 1,
      page_size: 20,
    });
    return {
      success: true,
      data,
      message: 'Banners fetched successfully',
    };
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param() params: RequiredIdDto,
    @Body() updateBannerDto: UpdateBannerDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.bannerService.findOne(params.id);
    if (!exists) throw new NotFoundException('Banner not found');

    const updated = await this.bannerService.update({
      banner_id: params.id,
      updateBannerDto: updateBannerDto,
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Banner',
        entityType: 'Banner',
        entityId: params.id,
      })
      .catch(() => {});
    return {
      success: true,
      data: updated,
      message: 'Banner updated successfully',
    };
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const data = await this.bannerService.findOne(params.id);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('admin')
  async delete(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const deleted = await this.prisma.$transaction(
      async (prisma) => {
        const removed = await this.bannerService.delete({
          banner_id: params.id,
          prisma,
        });

        await Promise.all(
          removed.banner_images
            .filter((banner_image) => banner_image.image?.key)
            .map((banner_image) =>
              this.bucketService.remove(banner_image.image.key),
            ),
        );
      },
      { maxWait: 40000, timeout: 60000 },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Banner',
        entityType: 'Banner',
        entityId: params.id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Banner deleted successfully',
      data: deleted,
    };
  }
}
