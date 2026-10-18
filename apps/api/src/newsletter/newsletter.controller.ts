import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse, PaginatedResponse } from '../prisma/prisma.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { GetNewslettersDto } from './dto/get-newsletters.dto';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@ApiTags('Newsletters')
@Controller('newsletters')
export class NewsletterController {
  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post('subscribe')
  @PublicApi()
  @ApiOperation({
    description:
      'Subscribe a WhatsApp number for updates. Stores normalized Indian format (91XXXXXXXXXX).',
  })
  async subscribe(
    @Body() dto: SubscribeNewsletterDto,
  ): Promise<ApiResponse> {
    const data = await this.newsletterService.subscribe(dto.number);
    return {
      success: true,
      data,
      message: 'You are subscribed. We will reach out on WhatsApp.',
    };
  }

  @Get()
  @Roles('admin', 'staff')
  @ApiOperation({ description: 'List newsletter / WhatsApp subscribers (admin).' })
  async findAll(@Query() query: GetNewslettersDto): Promise<PaginatedResponse> {
    const filters: Prisma.NewsletterWhereInput = {};
    if (query.search_term?.trim()) {
      const term = query.search_term.trim();
      const digitsOnly = term.replace(/\D/g, '');
      filters.number = {
        contains: digitsOnly.length >= 3 ? digitsOnly : term,
        mode: 'insensitive',
      };
    }

    const data = await this.newsletterService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
      sort_by: query.sort_by,
    });

    const total = await this.newsletterService.count(filters);

    return {
      success: true,
      total,
      page: query.page,
      page_size: query.page_size,
      data,
    };
  }

  @Delete(':id')
  @Roles('admin', 'staff')
  @ApiOperation({ description: 'Remove a subscriber by id.' })
  async remove(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.newsletterService.remove(params.id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Newsletter subscriber',
        entityType: 'Newsletter',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Subscriber removed successfully.' };
  }
}
