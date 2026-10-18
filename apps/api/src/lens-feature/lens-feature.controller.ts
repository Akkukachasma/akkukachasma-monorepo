import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LensFeatureService } from './lens-feature.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { CreateLensFeatureDto } from './dto/create-lens-feature.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { PowerTypeService } from '../power-type/power-type.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { GetLensFeatureDto } from './dto/get-lens-feature.dto';
import { Prisma } from '@prisma/client';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { UpdateLensFeatureDto } from './dto/update-lens-feature.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_LENS_FEATURE_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_LENS_FEATURE_MUTATION)
@ApiTags('Lens Features')
@Controller('lens-features')
export class LensFeatureController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lensFeatureService: LensFeatureService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly powerTypeService: PowerTypeService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create lens feature.',
  })
  async create(
    @Body() createLensFeatureDto: CreateLensFeatureDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const powerType = await this.powerTypeService.doesExist(
      createLensFeatureDto.power_type_id,
    );
    if (!powerType) throw new NotFoundException('Power type does not exists.');

    const { image, ...rest } = createLensFeatureDto;

    const data = await this.prisma.$transaction(async (prisma) => {
      const lens_feature = await this.lensFeatureService.create({
        user_id: tenant.id,
        createLensFeatureDto: rest,
        prisma,
      });

      if (image) {
        await this.fileService.update({
          file_id: image,
          data: {
            is_temp: false,
            lens_feature: {
              connect: { id: lens_feature.id },
            },
          },
          prisma,
        });
      }
      return lens_feature;
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Lens feature',
        entityType: 'LensFeature',
        entityId: data?.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @ApiOperation({
    description: 'This api is used to fetch all the lens features.',
  })
  async findAll(@Query() query: GetLensFeatureDto): Promise<PaginatedResponse> {
    const filters: Prisma.LensFeatureWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
      ...(query.power_type_id && { power_type_id: query.power_type_id }),
    };
    const data = await this.lensFeatureService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.lensFeatureService.count({ filters });
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
      'Use this api to update a lens features. Accepts lens feature id in params.',
  })
  async updateLensFeature(
    @Body() updateLensFeatureDto: UpdateLensFeatureDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.lensFeatureService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Lens feature does not exists.');
    }
    const { image, ...rest } = updateLensFeatureDto;

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }

        await this.lensFeatureService.update({
          lens_feature_id: params.id,
          updateLensFeatureDto: rest,
          prisma,
        });

        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              lens_feature: {
                connect: { id: exists.id },
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
        entityLabel: 'Lens feature',
        entityType: 'LensFeature',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a lens feature record. Accepts the lens feature id in params.',
  })
  async deleteLensFeature(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.lensFeatureService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Lens feature does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.image) await this.bucketService.remove(exists.image.key);
        await this.lensFeatureService.delete({
          lens_feature_id: params.id,
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
        entityLabel: 'Lens feature',
        entityType: 'LensFeature',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
