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
import { PowerTypeService } from './power-type.service';
import { CreatePowerTypeDto } from './dto/create-power-type.dto';
import { UpdatePowerTypeDto } from './dto/update-power-type.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { GetPowerTypeDto } from './dto/get-power-type.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_POWER_TYPE_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_POWER_TYPE_MUTATION)
@ApiTags('Power Types')
@Controller('power-types')
export class PowerTypeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly powerTypeService: PowerTypeService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create power type.',
  })
  async create(
    @Body() createPowerTypeDto: CreatePowerTypeDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prisma.$transaction(async (prisma) => {
      const pt = await this.powerTypeService.create({
        user_id: tenant.id,
        createPowerTypeDto,
        prisma,
      });

      if (createPowerTypeDto.image) {
        await this.fileService.update({
          file_id: createPowerTypeDto.image,
          data: { is_temp: false },
          prisma,
        });
      }

      return pt;
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Power type',
        entityType: 'PowerType',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @ApiOperation({
    description: 'This api is used to fetch all the power types.',
  })
  async findAll(@Query() query: GetPowerTypeDto): Promise<PaginatedResponse> {
    const filters: Prisma.PowerTypeWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
    };
    const data = await this.powerTypeService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.powerTypeService.count({ filters });
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
      'Use this api to update the details of a power type. Accepts power type id in params.',
  })
  async updatePowerTypeDetails(
    @Body() updatePowerTypeDto: UpdatePowerTypeDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.powerTypeService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Power type does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && updatePowerTypeDto.image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }

        const { image, ...rest } = updatePowerTypeDto;

        const updatedPowerType = await this.powerTypeService.update({
          power_type_id: params.id,
          updatePowerTypeDto: rest,
          prisma,
        });
        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              power_type: {
                connect: { id: updatedPowerType.id },
              },
            },
            prisma,
          });
        }
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Power type',
        entityType: 'PowerType',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a power type record. Accepts the power type id in params.',
  })
  async deletePowerType(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.powerTypeService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Power type does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.image) await this.bucketService.remove(exists.image.key);
        await this.powerTypeService.delete({
          power_type_id: params.id,
          prisma,
        });
      },
      {
        maxWait: 40000,
        timeout: 60000,
      },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Power type',
        entityType: 'PowerType',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
