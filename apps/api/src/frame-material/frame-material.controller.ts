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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse, PaginatedResponse } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { CreateFrameMaterialDto } from './dto/create-frame-material.dto';
import { GetFrameMaterialDto } from './dto/get-frame-material.dto';
import { FrameMaterialService } from './frame-material.service';
import { UpdateFrameMaterialDto } from './dto/update-frame-material.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_FRAME_MATERIAL_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_FRAME_MATERIAL_MUTATION)
@ApiTags('Frame Materials')
@Controller('frame-materials')
export class FrameMaterialController {
  constructor(
    private readonly frameMaterialService: FrameMaterialService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create frame material.',
  })
  async create(
    @Body() createFrameMaterialDto: CreateFrameMaterialDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.frameMaterialService.create({
      user_id: tenant.id,
      createFrameMaterialDto,
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Frame material',
        entityType: 'FrameMaterial',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @ApiOperation({
    description: 'This api is used to fetch all the frame materials.',
  })
  async findAll(
    @Query() query: GetFrameMaterialDto,
  ): Promise<PaginatedResponse> {
    const filters: Prisma.FrameMaterialWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
    };
    const data = await this.frameMaterialService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.frameMaterialService.count({ filters });
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
      'Use this api to update the details of a frame material. Accepts frame material id in params.',
  })
  async updateFrameMaterial(
    @Body() updateFrameMaterialDto: UpdateFrameMaterialDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.frameMaterialService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Frame material does not exists.');
    }

    await this.frameMaterialService.update({
      frame_material_id: params.id,
      updateFrameMaterialDto,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Frame material',
        entityType: 'FrameMaterial',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a frame material record. Accepts the frame material id in params.',
  })
  async deleteFrameMaterial(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.frameMaterialService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Frame material does not exists.');
    }
    await this.frameMaterialService.delete({
      frame_material_id: params.id,
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Frame material',
        entityType: 'FrameMaterial',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
