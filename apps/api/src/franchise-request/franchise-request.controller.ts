import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FranchiseRequestService } from './franchise-request.service';
import { CreateFranchiseRequestDto } from './dto/create-franchise-request.dto';
import { GetFranchiseRequestDto } from './dto/get-franchise-request.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { ApiResponse, PaginatedResponse } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as dayjs from 'dayjs';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

function buildFranchiseRequestWhere(
  query: GetFranchiseRequestDto,
): Prisma.FranchiseRequestWhereInput {
  const and: Prisma.FranchiseRequestWhereInput[] = [];

  if (query.search_term?.trim()) {
    const term = query.search_term.trim();
    and.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone_number: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  if (query.email?.trim()) {
    and.push({
      email: { contains: query.email.trim(), mode: 'insensitive' },
    });
  }

  if (query.phone_number?.trim()) {
    and.push({
      phone_number: { contains: query.phone_number.trim(), mode: 'insensitive' },
    });
  }

  if (query.start_date || query.end_date) {
    and.push({
      created_at: {
        ...(query.start_date && {
          gte: dayjs(query.start_date).startOf('day').toDate(),
        }),
        ...(query.end_date && {
          lte: dayjs(query.end_date).endOf('day').toDate(),
        }),
      },
    });
  }

  if (query.status) {
    and.push({ status: query.status });
  }

  return and.length > 0 ? { AND: and } : {};
}

@ApiTags('Franchise Requests')
@Controller('franchise-requests')
export class FranchiseRequestController {
  constructor(
    private readonly service: FranchiseRequestService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @PublicApi()
  @ApiOperation({ summary: 'Create a new franchise request (public)' })
  async create(@Body() dto: CreateFranchiseRequestDto): Promise<ApiResponse> {
    const data = await this.service.create(dto);
    return {
      success: true,
      message: 'Franchise request created successfully',
      data,
    };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all franchise requests (admin only, with filters)' })
  async findAll(@Query() query: GetFranchiseRequestDto): Promise<PaginatedResponse> {
    const filters = buildFranchiseRequestWhere(query);

    const [data, total] = await Promise.all([
      this.service.findAll({
        page: query.page,
        page_size: query.page_size,
        filters,
        sort_by: query.sort_by,
      }),
      this.service.count(filters),
    ]);

    return {
      success: true,
      message: 'Franchise requests fetched successfully',
      data,
      page: query.page,
      page_size: query.page_size,
      total,
    };
  }

  @Patch(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve a pending franchise request (admin only)' })
  async approve(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.service.approve(id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Franchise request',
        entityType: 'FranchiseRequest',
        entityId: id,
        summary: 'Franchise request approved',
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Franchise request approved successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove a franchise request (admin only)' })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ) {
    const result = await this.service.remove(id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Franchise request',
        entityType: 'FranchiseRequest',
        entityId: id,
      })
      .catch(() => {});
    return result;
  }
}
