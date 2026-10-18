import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from '../prisma/prisma.service';
import { Prisma, ActivityType } from '@prisma/client';
import { ActivityService } from './activity.service';
import { GetActivitiesDto } from './dto/get-activities.dto';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/constants';

@ApiTags('Activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ACTIVITIES_LIST)
  @ApiOperation({ summary: 'Get all activities with filters' })
  async getAllActivities(
    @Query() query: GetActivitiesDto,
  ): Promise<PaginatedResponse> {
    const filters: Prisma.ActivityWhereInput = {};

    if (query.start_date || query.end_date) {
      filters.created_at = {};
      if (query.start_date) {
        filters.created_at.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        filters.created_at.lte = new Date(query.end_date);
      }
    }

    if (query.type) {
      filters.type = query.type as ActivityType;
    }

    if (query.search_term) {
      const term = query.search_term.trim();
      filters.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const data = await this.activityService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
      sort_by: query.sort_by ?? 'created_desc',
    });

    const total = await this.activityService.count({ filters });

    return {
      success: true,
      data,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }
}
