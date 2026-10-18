import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationAudience } from '@prisma/client';
import { Tenant, ITenant } from '../auth/decorators/tenant.decorator';
import { NotificationsService } from './notifications.service';

/**
 * Storefront / customer notifications only (audience = customer).
 * Never returns manage/admin workspace notifications.
 */
@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List current user customer notifications' })
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
      audience: NotificationAudience.customer,
      unreadOnly: unreadOnly === 'true' || unreadOnly === '1',
      take: Number.isFinite(parsedTake) ? parsedTake : undefined,
      skip: Number.isFinite(parsedSkip) ? parsedSkip : undefined,
    });
    return { success: true, data: result.items, meta: { total: result.total } };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread customer notification count' })
  async unreadCount(@Tenant() tenant: ITenant) {
    const count = await this.notifications.unreadCount(
      tenant.id,
      NotificationAudience.customer,
    );
    return { success: true, data: { count } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one customer notification read' })
  async markRead(@Tenant() tenant: ITenant, @Param('id') id: string) {
    const item = await this.notifications.markRead(
      tenant.id,
      NotificationAudience.customer,
      id,
    );
    return { success: true, data: item };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all customer notifications read' })
  async markAllRead(@Tenant() tenant: ITenant) {
    await this.notifications.markAllRead(tenant.id, NotificationAudience.customer);
    return { success: true, data: { ok: true } };
  }
}
