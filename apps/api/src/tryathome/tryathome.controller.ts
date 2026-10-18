import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TryAtHomeService } from './tryathome.service';
import { CreatePurposeDto } from './dto/create-purpose.dto';
import { UpdatePurposeDto } from './dto/update-purpose.dto';
import { CreateTryAtHomeDto } from './dto/create-tryathome.dto';
import { GetTryAtHomeDto } from './dto/get-tryathome.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { ApiResponse, PaginatedResponse, PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PincodeService } from '../address/pincode.service';
import { AddressService } from '../address/address.service';
import * as dayjs from 'dayjs';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@ApiTags('Try At Home')
@Controller('tryathome')
export class TryAtHomeController {
  constructor(
    private readonly service: TryAtHomeService,
    private readonly pincodeService: PincodeService,
    private readonly addressService: AddressService,
    private readonly prisma: PrismaService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post('purposes')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new try at home purpose (Admin only)' })
  async createPurpose(
    @Body() dto: CreatePurposeDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.service.createPurpose(dto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Try-at-home purpose',
        entityType: 'TryAtHomePurpose',
        entityId: data?.id,
        summary: dto.label,
      })
      .catch(() => {});
    return {
      success: true,
      data,
      message: 'Try at home purpose created.',
    };
  }

  @Get('purposes')
  @PublicApi()
  @ApiOperation({ summary: 'List all try at home purposes' })
  async listPurposes(): Promise<ApiResponse> {
    const data = await this.service.listPurposes();
    return {
      success: true,
      data,
    };
  }

  @Put('purposes/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a try at home purpose (Admin only)' })
  @ApiParam({ name: 'id', description: 'Purpose ID' })
  async updatePurpose(
    @Param('id') id: string,
    @Body() dto: UpdatePurposeDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.service.updatePurpose(id, dto);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Try-at-home purpose',
        entityType: 'TryAtHomePurpose',
        entityId: id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Updated successfully.',
    };
  }

  @Delete('purposes/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove a try at home purpose (Admin only)' })
  @ApiParam({ name: 'id', description: 'Purpose ID' })
  async removePurpose(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.service.removePurpose(id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Try-at-home purpose',
        entityType: 'TryAtHomePurpose',
        entityId: id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Removed successfully.',
    };
  }

  @Get('requests')
  @Roles('admin')
  @ApiOperation({ summary: 'List all try at home requests with filters (Admin only)' })
  @ApiQuery({ type: GetTryAtHomeDto })
  async listRequests(@Query() query: GetTryAtHomeDto): Promise<PaginatedResponse> {
    const filters: Prisma.TryAtHomeWhereInput = {
      ...(query.search_term && {
        OR: [
          {
            name: {
              contains: query.search_term,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query.search_term,
              mode: 'insensitive',
            },
          },
          {
            phone_number: {
              contains: query.search_term,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(query.purpose_id && {
        purpose_id: query.purpose_id,
      }),
      ...(query.start_date || query.end_date
        ? {
            created_at: {
              ...(query.start_date && {
                gte: dayjs(query.start_date).startOf('day').toDate(),
              }),
              ...(query.end_date && {
                lte: dayjs(query.end_date).endOf('day').toDate(),
              }),
            },
          }
        : {}),
    };

    const data = await this.service.listRequests({
      filters,
      page: query.page,
      page_size: query.page_size,
      sort_by: query.sort_by,
    });
    const total = await this.service.count(filters);
    return {
      success: true,
      data,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Delete('requests/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove a try at home request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  async removeRequest(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.service.removeRequest(id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Try-at-home request',
        entityType: 'TryAtHome',
        entityId: id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Request removed successfully.',
    };
  }

  @Post('requests')
  @PublicApi()
  @ApiOperation({ summary: 'Create a new try at home request (Public)' })
  async createRequest(@Body() dto: CreateTryAtHomeDto): Promise<ApiResponse> {
    const created = await this.prisma.$transaction(async (prisma) => {
      const address = await this.addressService.createAddressFromPincode({
        pincode: dto.zip_code,
        address: dto.address,
        prisma,
      });
      const request = await this.service.createRequest({
        address_id: address.id,
        data: dto,
        prisma,
      });
      return request;
    });

    return {
      success: true,
      message: 'Your request has been sent',
      data: created,
    };
  }
}
