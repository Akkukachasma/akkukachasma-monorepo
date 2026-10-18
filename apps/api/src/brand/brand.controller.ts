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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse, PaginatedResponse } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { GetBrandDto } from './dto/get-brandl.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { generateSlug } from '../../lib/utils';
import { Roles } from '../auth/decorators/roles.decorator';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_BRAND_MUTATION } from '../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@InvalidateCache(INVALIDATE_ON_BRAND_MUTATION)
@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create brand.',
  })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    createBrandDto.slug =
      createBrandDto.slug || generateSlug(createBrandDto.title);
    const duplicate = await this.brandService.isDuplicateSlug({
      slug: createBrandDto.slug,
    });
    if (duplicate) {
      throw new ConflictException('Slug already exists');
    }
    const data = await this.brandService.create({
      user_id: tenant.id,
      createBrandDto,
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Brand',
        entityType: 'Brand',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    description: 'This api is used to fetch all the brand.',
  })
  async findAll(@Query() query: GetBrandDto): Promise<PaginatedResponse> {
    const filters: Prisma.BrandWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
    };
    const data = await this.brandService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.brandService.count({ filters });
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
      'Use this api to update the details of a brand. Accepts brand id in params.',
  })
  async updateBrand(
    @Body() updateBrandDto: UpdateBrandDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    if (updateBrandDto.title || updateBrandDto.slug) {
      updateBrandDto.slug =
        updateBrandDto.slug || generateSlug(updateBrandDto.title);
      const duplicate = await this.brandService.isDuplicateSlug({
        slug: updateBrandDto.slug,
        brand_id: params.id,
      });
      if (duplicate) {
        throw new ConflictException('Slug already exists');
      }
    }

    await this.brandService.update({
      brand_id: params.id,
      updateBrandDto,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Brand',
        entityType: 'Brand',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a brand record. Accepts the brand id in params.',
  })
  async deleteBrand(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.brandService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Brand does not exists.');
    }
    await this.brandService.delete({
      brand_id: params.id,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Brand',
        entityType: 'Brand',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
