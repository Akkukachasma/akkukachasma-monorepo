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
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse, PaginatedResponse } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetCouponDto } from './dto/get-coupon.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_COUPON_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_COUPON_MUTATION)
@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create a coupon.',
  })
  async create(
    @Body() createCouponDto: CreateCouponDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const duplicate = await this.couponService.isDuplicate({
      name: createCouponDto.name,
    });

    if (duplicate) {
      throw new BadRequestException('A coupon with same name already exists.');
    }

    const data = await this.couponService.create(tenant.id, createCouponDto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Coupon',
        entityType: 'Coupon',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Coupon created successfully.' };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to fetch all the coupons.',
  })
  async findAll(@Query() query: GetCouponDto): Promise<PaginatedResponse> {
    const filters: Prisma.CouponWhereInput = {
      name: { contains: query.search_term, mode: 'insensitive' },
    };

    const data = await this.couponService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
      sort_by: query.sort_by,
    });

    const total = await this.couponService.count({ filters });

    return {
      success: true,
      total,
      page: query.page,
      page_size: query.page_size,
      data,
    };
  }

  @Get('/public')
  @PublicApi()
  async findAllOffers(
    @Query() query: GetCouponDto,
  ): Promise<PaginatedResponse> {
    const { data, total } = await this.couponService.getAvailableCoupons({
      page: query.page,
      page_size: query.page_size,
    });

    return {
      success: true,
      total,
      data,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api to update the details of a coupon. Accepts coupon id in params.',
  })
  async updateCoupon(
    @Body() updateCouponDto: UpdateCouponDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    // Check if coupon exists
    const exists = await this.couponService.doesExist(params.id);
    if (!exists) {
      throw new NotFoundException('Coupon does not exist.');
    }

    // Check for name duplication if name is being updated
    if (updateCouponDto.name) {
      const isDuplicate = await this.couponService.isDuplicate({
        coupon_id: params.id,
        name: updateCouponDto.name,
      });
      if (isDuplicate) {
        throw new BadRequestException('Coupon with this name already exists.');
      }
    }

    await this.couponService.update(params.id, updateCouponDto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Coupon',
        entityType: 'Coupon',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Coupon updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a coupon record. Accepts the coupon id in params.',
  })
  async deleteCoupon(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.couponService.doesExist(params.id);
    if (!exists) {
      throw new NotFoundException('Coupon does not exist.');
    }

    await this.couponService.remove(params.id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Coupon',
        entityType: 'Coupon',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Coupon deleted successfully.' };
  }
}
