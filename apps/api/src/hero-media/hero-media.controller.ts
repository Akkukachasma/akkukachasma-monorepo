import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicApi } from '../auth/decorators/public.decorator';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PERMISSIONS } from '../rbac/constants';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { ApiResponse as ApiReturnType } from '../prisma/prisma.service';
import { HeroMediaService } from './hero-media.service';
import { ActivateHeroMediaDto } from './dto/activate-hero-media.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_HERO_MEDIA_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_HERO_MEDIA_MUTATION)
@ApiTags('Hero media')
@Controller('hero-media')
export class HeroMediaController {
  constructor(private readonly heroMedia: HeroMediaService) {}

  @Get('active')
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  @ApiOperation({
    summary:
      'Public metadata for homepage hero (type, files, stream paths, cache busting)',
  })
  async getActive(): Promise<ApiReturnType> {
    const data = await this.heroMedia.getActiveMetadata();
    return {
      success: true,
      data,
      message: 'Active hero media metadata',
    };
  }

  @Get('stream')
  @PublicApi()
  @ApiOperation({
    summary:
      'Stream first video on active hero (legacy; prefer /files/:fileId/stream)',
  })
  async streamVideo(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.heroMedia.pipeActiveVideoToResponse(req, res);
  }

  @Get('files/:fileId/stream')
  @PublicApi()
  @ApiOperation({
    summary: 'Stream a hero video file by id (HTTP Range / seeking)',
  })
  async streamFile(
    @Param() params: RequiredIdDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.heroMedia.pipeFileToResponse(req, res, params.id);
  }

  @Post('activate')
  @RequirePermissions(PERMISSIONS.HERO_MEDIA_MANAGE)
  @ApiOperation({
    summary:
      'Activate hero media from completed chunked uploads (banner or slider)',
  })
  async activate(
    @Body() dto: ActivateHeroMediaDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiReturnType> {
    const newFileIds =
      dto.file_ids?.length ? dto.file_ids : dto.file_id ? [dto.file_id] : [];

    const deletePrev = dto.delete_previous_file !== false;
    const data = await this.heroMedia.activateFromCompletedUpload({
      file_ids: newFileIds,
      type: dto.type,
      title: dto.title,
      replace_all: dto.replace_all === true,
      deleteReplacedObject: deletePrev,
      actorUserId: tenant.id,
    });
    return {
      success: true,
      data: data.data,
      message: 'Hero media activated',
    };
  }

  @Get('admin/list')
  @RequirePermissions(PERMISSIONS.HERO_MEDIA_VIEW)
  @ApiOperation({ summary: 'List hero media history (newest first)' })
  async adminList(): Promise<ApiReturnType> {
    const data = await this.heroMedia.listAll();
    return { success: true, data, message: 'Hero media list' };
  }

  @Delete('admin/:id')
  @RequirePermissions(PERMISSIONS.HERO_MEDIA_MANAGE)
  @ApiOperation({
    summary: 'Remove a hero media entry and its files from storage',
  })
  async adminRemove(@Param() params: RequiredIdDto): Promise<ApiReturnType> {
    const data = await this.heroMedia.removeHeroEntry(params.id);
    return { success: data.success, message: 'Hero media removed' };
  }
}
