import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BucketService } from '../../bucket/bucket.service';
import { FileService } from '../../file/file.service';
import { ApiResponse, PrismaService } from '../../prisma/prisma.service';
import { CreateBannerImageDto } from './dto/create-banner-image.dto';
import { BannerImageService } from './banner-image.service';
import { RequiredIdDto } from '../../prisma/dto/common.dto';
import { UpdateBannerImageDto } from './dto/update-banner.image.dto';
import { UpdateBannerOrderDto } from '../dto/update-banner.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ITenant, Tenant } from '../../auth/decorators/tenant.decorator';
import { InvalidateCache } from '../../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_BANNER_MUTATION } from '../../cache/cache-invalidation.presets';
import { NotificationsDispatchService } from '../../notifications/notifications-dispatch.service';

@ApiTags('Banner Management > Banner Image')
@InvalidateCache(INVALIDATE_ON_BANNER_MUTATION)
@Controller('banners')
export class BannerImageController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly bannerImageService: BannerImageService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Get(':id/banner-images')
  @Roles('admin')
  async getBannerImages(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const data = await this.bannerImageService.findByBannerId(params.id);
    return { success: true, data, message: 'Banner images fetched successfully' };
  }

  @Patch('banner-images/reorder')
  async updateOrders(
    @Body() updateBannerDto: UpdateBannerOrderDto, // we know for sure, that it will work as there is no change in dto...
  ): Promise<ApiResponse> {
    const data = await this.bannerImageService.updateOrder(
      updateBannerDto.new_orders,
    );
    return { success: true, data, message: 'Order updated successfully' };
  }

  @Post(':id/banner-image')
  @ApiOperation({
    description:
      'Use to create a banner image for a banner. Expects banner id in params',
  })
  async createBannerImage(
    @Body() createBannerImageDto: CreateBannerImageDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const { image, ...rest } = createBannerImageDto;
    const created = await this.prisma.$transaction(async (prisma) => {
      const bannerImage = await this.bannerImageService.create({
        banner_id: params.id,
        createBannerImageDto: rest,
        prisma,
      });
      if (image) {
        await this.fileService.update({
          file_id: image,
          data: {
            is_temp: false,
            banner_image: {
              connect: { id: bannerImage.id },
            },
          },
          prisma,
        });
      }
      return bannerImage;
    });
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Banner image',
        entityType: 'BannerImage',
        entityId: created?.id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Banner image created successfully',
      data: created,
    };
  }

  @Put('banner-images/:id')
  @ApiOperation({
    description:
      'Use to update a banner image for a banner. Expects banner image id in params',
  })
  async updateBannerImage(
    @Body() updateBannerImageDto: UpdateBannerImageDto,
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.bannerImageService.doesExist(params.id);
    if (!exists) {
      throw new NotFoundException('Banner image does not exists.');
    }
    const { image, ...rest } = updateBannerImageDto;
    const updated = await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image && updateBannerImageDto.image) {
          await this.bucketService.remove(exists.image.key);
          await this.fileService.removeFileById({
            file_id: exists.image.id,
            prisma,
          });
        }
        const updatedBannerImage = await this.bannerImageService.update({
          banner_image_id: params.id,
          updateBannerImageDto: rest,
          prisma,
        });

        if (image) {
          await this.fileService.update({
            file_id: image,
            data: {
              is_temp: false,
              banner_image: {
                connect: { id: updatedBannerImage.id },
              },
            },
            prisma,
          });
        }
      },
      { maxWait: 40000, timeout: 60000 },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Banner image',
        entityType: 'BannerImage',
        entityId: params.id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Banner image updated successfully',
      data: updated,
    };
  }

  @Delete('banner-images/:id')
  @ApiOperation({
    description:
      'Use to remove a banner image. Expects banner image id in params',
  })
  async deleteBannerImage(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.bannerImageService.doesExist(params.id);
    if (!exists) {
      throw new NotFoundException('Banner image does not exists.');
    }
    const removed = await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.image) {
          await this.bucketService.remove(exists.image.key);
        }
        const deleted = await this.bannerImageService.delete({
          banner_image_id: params.id,
          prisma,
        });
        return deleted;
      },
      { maxWait: 40000, timeout: 60000 },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Banner image',
        entityType: 'BannerImage',
        entityId: params.id,
      })
      .catch(() => {});
    return {
      success: true,
      message: 'Banner image removed successfully',
      data: removed,
    };
  }
}
