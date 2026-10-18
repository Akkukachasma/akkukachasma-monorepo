import {
  BadRequestException,
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
import { LensDetailService } from './lens-detail.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLensDetailDto } from './dto/create-lens-detail.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { LensFeatureService } from '../lens-feature/lens-feature.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { GetLensDetailDto } from './dto/get-lens-detail.dto';
import { Prisma } from '@prisma/client';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { UpdateLensDetailDto } from './dto/update-lens-detail.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_LENS_DETAIL_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_LENS_DETAIL_MUTATION)
@ApiTags('Lens Details')
@Controller('lens-details')
export class LensDetailController {
  constructor(
    private readonly lensDetailService: LensDetailService,
    private readonly fileService: FileService,
    private readonly lensFeatureService: LensFeatureService,
    private readonly bucketService: BucketService,
    private readonly prisma: PrismaService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    description: 'This api is used to create lens detail.',
  })
  async create(
    @Body() createLensDetailDto: CreateLensDetailDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const lensFeature = await this.lensFeatureService.doesExist(
      createLensDetailDto.lens_feature_id,
    );

    if (!lensFeature)
      throw new NotFoundException('Lens feature does not exists.');

    const duplicate = await this.lensDetailService.findByLensId({
      lens_id: createLensDetailDto.lens_id,
    });

    if (duplicate) {
      throw new BadRequestException(
        'Lens detail already exists for same lense id.',
      );
    }
    const { image, ...rest } = createLensDetailDto;
    const data = await this.prisma.$transaction(async (prisma) => {
      const lensDetail = await this.lensDetailService.create({
        user_id: tenant.id,
        createLensDetailDto: rest,
        prisma,
      });
      if (image) {
        await this.fileService.update({
          file_id: image,
          data: {
            is_temp: false,
            lens_detail: {
              connect: {
                id: lensDetail.id,
              },
            },
          },
          prisma,
        });
      }
      return lensDetail;
    });

    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Lens detail',
        entityType: 'LensDetail',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @PublicApi()
  @ApiOperation({
    description: 'This api is used to fetch all the lens details.',
  })
  async findAll(@Query() query: GetLensDetailDto): Promise<PaginatedResponse> {
    const term = query.search_term?.trim();
    const filters: Prisma.LensDetailWhereInput = {
      ...(term && {
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { lens_id: { contains: term, mode: 'insensitive' } },
          ...(/^[a-f\d]{24}$/i.test(term) ? [{ id: term }] : []),
        ],
      }),
      ...(query.lens_feature_id && { lens_feature_id: query.lens_feature_id }),
    };
    const data = await this.lensDetailService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.lensDetailService.count({ filters });
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
      'Use this api to update a lens details. Accepts lens details id in params.',
  })
  async updateLensDetail(
    @Body() updateLensDetailDto: UpdateLensDetailDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.lensDetailService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Lens detail does not exists.');
    }

    if (updateLensDetailDto.lens_id) {
      const duplicate = await this.lensDetailService.findByLensId({
        lens_id: updateLensDetailDto.lens_id,
        lens_detail_id: params.id,
      });
      if (duplicate.id !== params.id) {
        throw new BadRequestException(
          'A lens detail already exists with same lens id.',
        );
      }
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && updateLensDetailDto.image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }
        const { image, ...rest } = updateLensDetailDto;
        const updatedLensDetail = await this.lensDetailService.update({
          lens_detail_id: params.id,
          updateLensDetailDto: rest,
          prisma,
        });
        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              lens_detail: {
                connect: { id: updatedLensDetail.id },
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
        entityLabel: 'Lens detail',
        entityType: 'LensDetail',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use this api endpoint to delete a lens detail record. Accepts the lens detail id in params.',
  })
  async deleteLensDetail(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.lensDetailService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Lens detail does not exists.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.image) await this.bucketService.remove(exists.image.key);
        await this.lensDetailService.delete({
          lens_detail_id: params.id,
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
        entityLabel: 'Lens detail',
        entityType: 'LensDetail',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
