import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HeroMediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { FileService } from '../file/file.service';
import { MediaStreamService } from '../media-stream/media-stream.service';
import { Request, Response } from 'express';
import {
  HeroActiveMetadataDto,
  HeroMediaFileDto,
  mimeToMediaKind,
} from './hero-media.types';

const LOG = 'HeroMedia';

const HERO_FILE_ORDER: Prisma.FileOrderByWithRelationInput[] = [
  { hero_media_sort_order: 'asc' },
  { created_at: 'asc' },
];

type FileRow = {
  id: string;
  key: string;
  type: string | null;
  url: string | null;
  hero_media_sort_order: number | null;
};

@Injectable()
export class HeroMediaService {
  private readonly logger = new Logger(LOG);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bucket: BucketService,
    private readonly fileService: FileService,
    private readonly mediaStream: MediaStreamService,
  ) {}

  private mapFileToDto(file: FileRow, cacheVersion: string): HeroMediaFileDto {
    const kind = mimeToMediaKind(file.type);
    const sortOrder = file.hero_media_sort_order ?? 0;
    const streamPath =
      kind === 'video'
        ? `/v1/hero-media/files/${file.id}/stream`
        : null;

    return {
      id: file.id,
      media_kind: kind,
      mime_type: file.type,
      url: kind === 'image' ? file.url : null,
      stream_path: streamPath,
      sort_order: sortOrder,
    };
  }

  private emptyActiveMetadata(): HeroActiveMetadataDto {
    return {
      has_media: false,
      hasVideo: false,
      type: null,
      cache_version: null,
      title: null,
      files: [],
      contentType: null,
    };
  }

  async getActiveMetadata(): Promise<HeroActiveMetadataDto> {
    const row = await this.prisma.heroMedia.findFirst({
      where: { is_active: true },
      include: {
        files: { orderBy: HERO_FILE_ORDER },
      },
    });

    if (!row?.files?.length) {
      return this.emptyActiveMetadata();
    }

    const cacheVersion = row.updated_at?.toISOString() ?? row.id;
    const files = row.files.map((f) => this.mapFileToDto(f, cacheVersion));
    const firstVideo = files.find((f) => f.media_kind === 'video');

    return {
      has_media: true,
      hasVideo: Boolean(firstVideo),
      type: row.type,
      cache_version: cacheVersion,
      title: row.title ?? null,
      files,
      streamPath: firstVideo?.stream_path ?? undefined,
      contentType: firstVideo?.mime_type ?? null,
    };
  }

  /** Legacy endpoint — streams the first video file on the active hero. */
  async pipeActiveVideoToResponse(req: Request, res: Response): Promise<void> {
    const hero = await this.prisma.heroMedia.findFirst({
      where: { is_active: true },
      include: { files: { orderBy: HERO_FILE_ORDER } },
    });

    const firstVideo = hero?.files?.find(
      (f) => mimeToMediaKind(f.type) === 'video',
    );

    if (!firstVideo) {
      this.logger.warn(
        JSON.stringify({ msg: 'stream_no_active_hero_video', path: req.path }),
      );
      res.status(404).json({
        success: false,
        message: 'No active hero video configured.',
        type: 'hero_media',
        code: 'HERO_VIDEO_NOT_FOUND',
      });
      return;
    }

    await this.pipeFileToResponse(req, res, firstVideo.id);
  }

  async pipeFileToResponse(
    req: Request,
    res: Response,
    fileId: string,
  ): Promise<void> {
    const file = await this.resolveStreamableHeroFile(fileId);
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'Hero media file not found.',
        type: 'hero_media',
        code: 'HERO_FILE_NOT_FOUND',
      });
      return;
    }

    if (mimeToMediaKind(file.type) !== 'video') {
      res.status(400).json({
        success: false,
        message: 'Streaming is only supported for video files.',
        type: 'hero_media',
        code: 'HERO_STREAM_NOT_VIDEO',
      });
      return;
    }

    await this.mediaStream.pipeObjectToResponse({
      req,
      res,
      storageKey: file.key,
      fileId: file.id,
      contentType: file.type,
      logContext: 'hero_media',
      errorType: 'hero_media',
      notFoundCode: 'HERO_FILE_NOT_FOUND',
      notFoundMessage: 'Hero media file not found.',
    });
  }

  private async resolveStreamableHeroFile(fileId: string) {
    const active = await this.prisma.heroMedia.findFirst({
      where: { is_active: true },
      select: { id: true },
    });
    if (!active) return null;

    return this.prisma.file.findFirst({
      where: { id: fileId, hero_media_id: active.id },
    });
  }

  async activateFromCompletedUpload(params: {
    file_ids: string[];
    type?: HeroMediaType;
    title?: string;
    replace_all?: boolean;
    deleteReplacedObject: boolean;
    actorUserId?: string;
  }) {
    const newFileIds = [...new Set(params.file_ids.filter(Boolean))];

    const previous = await this.prisma.heroMedia.findFirst({
      where: { is_active: true },
      include: { files: { orderBy: HERO_FILE_ORDER } },
    });

    const existingIds =
      previous?.files?.map((f) => f.id).filter(Boolean) ?? [];

    let mergedIds: string[];
    if (params.replace_all || existingIds.length === 0) {
      mergedIds = newFileIds;
    } else {
      const existingSet = new Set(existingIds);
      const idsToAdd = newFileIds.filter((id) => !existingSet.has(id));
      mergedIds = [...existingIds, ...idsToAdd];
    }

    if (mergedIds.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'At least one file is required.',
        type: 'validation_error',
        code: 'HERO_FILES_REQUIRED',
      });
    }

    const uniqueIds = mergedIds;

    const type = params.type ?? previous?.type ?? HeroMediaType.BANNER;
    if (type === HeroMediaType.BANNER && uniqueIds.length > 1) {
      this.logger.warn(
        JSON.stringify({
          msg: 'hero_banner_multiple_files',
          count: uniqueIds.length,
          note: 'only_first_file_rendered_on_storefront',
        }),
      );
    }

    const files = await Promise.all(
      uniqueIds.map((id) => this.fileService.getFileById(id)),
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        throw new NotFoundException({
          success: false,
          message: `File not found: ${uniqueIds[i]}`,
          type: 'validation_error',
          code: 'HERO_FILE_NOT_FOUND',
        });
      }
      const kind = mimeToMediaKind(file.type);
      if (kind === 'unknown') {
        throw new BadRequestException({
          success: false,
          message: 'Hero media must be an image or video file.',
          type: 'validation_error',
          code: 'HERO_INVALID_MIME',
        });
      }
    }

    const hero = await this.prisma.$transaction(async (tx) => {
      await tx.heroMedia.updateMany({
        where: { is_active: true },
        data: { is_active: false },
      });

      const created = await tx.heroMedia.create({
        data: {
          type,
          is_active: true,
          title: params.title ?? null,
        },
      });

      for (let index = 0; index < uniqueIds.length; index++) {
        const fileId = uniqueIds[index];
        await tx.file.update({
          where: { id: fileId },
          data: {
            hero_media_id: created.id,
            hero_media_sort_order: index,
            is_temp: false,
          },
        });
      }

      return created;
    });

    if (params.deleteReplacedObject && previous?.files?.length) {
      const keepIds = new Set(uniqueIds);
      const removed = previous.files.filter((f) => !keepIds.has(f.id));
      if (removed.length > 0) {
        await this.deleteHeroFilesFromStorage(removed);
      }
    }

    this.logger.log(
      JSON.stringify({
        msg: 'hero_active_changed',
        heroId: hero.id,
        type,
        fileIds: uniqueIds,
        newFileIds,
        mergedFromActive: !params.replace_all && existingIds.length > 0,
        previousHeroId: previous?.id ?? null,
        actorUserId: params.actorUserId ?? null,
      }),
    );

    const active = await this.prisma.heroMedia.findFirst({
      where: { id: hero.id },
      include: { files: { orderBy: HERO_FILE_ORDER } },
    });

    return { success: true, data: active };
  }

  async listAll() {
    return this.prisma.heroMedia.findMany({
      orderBy: { created_at: 'desc' },
      include: { files: { orderBy: HERO_FILE_ORDER } },
    });
  }

  async removeHeroEntry(id: string) {
    const row = await this.prisma.heroMedia.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!row) {
      throw new NotFoundException({
        success: false,
        message: 'Hero media entry not found.',
        type: 'validation_error',
        code: 'HERO_MEDIA_NOT_FOUND',
      });
    }

    await this.prisma.heroMedia.delete({ where: { id } });
    await this.deleteHeroFilesFromStorage(row.files);

    this.logger.log(JSON.stringify({ msg: 'hero_entry_deleted', id }));
    return { success: true };
  }

  private async deleteHeroFilesFromStorage(
    files: { id: string; key: string }[],
  ) {
    for (const file of files) {
      try {
        await this.bucket.remove(file.key);
      } catch (e: unknown) {
        this.logger.warn(
          JSON.stringify({
            msg: 'hero_delete_bucket_failed',
            fileId: file.id,
            error: String((e as Error)?.message ?? e),
          }),
        );
      }
      await this.prisma.file
        .delete({ where: { id: file.id } })
        .catch(() => undefined);
    }
  }
}
