import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationAudience } from '@prisma/client';
import { Tenant, ITenant } from '../auth/decorators/tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';

/**
 * Manage workspace notifications (audience = admin) for the current admin user.
 */
@Controller('manage/notifications')
@ApiTags('Manage Notifications')
@Roles('admin')
export class ManageNotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List admin workspace notifications for current user' })
  async list(
    @Tenant() tenant: ITenant,
    @Query('unread_only') unreadOnly?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedTake = take ? parseInt(take, 10) : undefined;
    const parsedSkip = skip ? parseInt(skip, 10) : undefined;
    const result = await this.notifications.listForUser({
      userId: tenant.id,
      audience: NotificationAudience.admin,
      unreadOnly: unreadOnly === 'true' || unreadOnly === '1',
      take: Number.isFinite(parsedTake) ? parsedTake : undefined,
      skip: Number.isFinite(parsedSkip) ? parsedSkip : undefined,
    });
    return { success: true, data: result.items, meta: { total: result.total } };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread admin notification count' })
  async unreadCount(@Tenant() tenant: ITenant) {
    const count = await this.notifications.unreadCount(
      tenant.id,
      NotificationAudience.admin,
    );
    return { success: true, data: { count } };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all admin notifications read' })
  async markAllRead(@Tenant() tenant: ITenant) {
    await this.notifications.markAllRead(tenant.id, NotificationAudience.admin);
    return { success: true, data: { ok: true } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one admin notification read' })
  async markRead(@Tenant() tenant: ITenant, @Param('id') id: string) {
    const item = await this.notifications.markRead(
      tenant.id,
      NotificationAudience.admin,
      id,
    );
    return { success: true, data: item };
  }
}
