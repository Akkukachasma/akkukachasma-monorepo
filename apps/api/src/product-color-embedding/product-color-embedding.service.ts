import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { MediaStreamService } from '../media-stream/media-stream.service';
import { ProductColorEmbeddingConfigService } from './product-color-embedding.config';
import { parseEmbedCode } from './embed-code.util';
import { CreateProductColorEmbeddingDto } from './dto/create-product-color-embedding.dto';
import { UpdateProductColorEmbeddingDto } from './dto/update-product-color-embedding.dto';
import { ReorderProductColorEmbeddingsDto } from './dto/reorder-product-color-embeddings.dto';

const LOG = 'ProductColorEmbedding';
const VIDEO_MIME_PREFIX = 'video/';

type EmbeddingWithVideo = Prisma.ProductColorEmbeddingGetPayload<{
  include: { video: true };
}>;

@Injectable()
export class ProductColorEmbeddingService {
  private readonly logger = new Logger(LOG);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly bucket: BucketService,
    private readonly mediaStream: MediaStreamService,
    private readonly config: ProductColorEmbeddingConfigService,
  ) {}

  serialize(row: EmbeddingWithVideo) {
    const hasVideo = Boolean(row.fileId && row.video);
    const hasEmbed = Boolean(row.embed_url?.trim());
    const parsed = hasEmbed ? parseEmbedCode(row.embed_url!) : null;

    return {
      id: row.id,
      product_color_id: row.product_color_id,
      sort_order: row.sort_order,
      kind: hasVideo ? ('video' as const) : ('embed' as const),
      embed_code: row.embed_url,
      embed_provider: parsed?.provider ?? null,
      iframe_src: parsed?.iframeSrc ?? null,
      file_id: row.fileId,
      content_type: row.video?.type ?? null,
      cache_version: row.updated_at?.toISOString() ?? row.id,
      stream_path: hasVideo
        ? `/v1/product-color-embeddings/${row.id}/stream`
        : null,
    };
  }

  private assertXorContent(embed_code?: string | null, file_id?: string | null) {
    const hasEmbed = Boolean(embed_code?.trim());
    const hasFile = Boolean(file_id?.trim());
    if (hasEmbed === hasFile) {
      throw new BadRequestException({
        success: false,
        message:
          'Provide exactly one of embed_code or file_id (video upload), not both or neither.',
        type: 'validation_error',
        code: 'EMBEDDING_INVALID_CONTENT',
      });
    }
  }

  private async assertProductColorExists(product_color_id: string) {
    const pc = await this.prisma.productColor.findUnique({
      where: { id: product_color_id },
      select: { id: true },
    });
    if (!pc) {
      throw new NotFoundException({
        success: false,
        message: 'Product color not found.',
        type: 'validation_error',
        code: 'PRODUCT_COLOR_NOT_FOUND',
      });
    }
  }

  private async assertUnderLimit(product_color_id: string) {
    const count = await this.prisma.productColorEmbedding.count({
      where: { product_color_id },
    });
    if (count >= this.config.maxPerProductColor) {
      throw new BadRequestException({
        success: false,
        message: 'Maximum embedding limit reached for this product color.',
        type: 'validation_error',
        code: 'MAX_EMBEDDINGS_LIMIT_REACHED',
      });
    }
  }

  private async nextSortOrder(product_color_id: string) {
    const max = await this.prisma.productColorEmbedding.aggregate({
      where: { product_color_id },
      _max: { sort_order: true },
    });
    return (max._max.sort_order ?? -1) + 1;
  }

  private async validateVideoFile(file_id: string) {
    const file = await this.fileService.getFileById(file_id);
    if (!file) {
      throw new NotFoundException({
        success: false,
        message: 'Uploaded file not found.',
        type: 'validation_error',
        code: 'EMBEDDING_FILE_NOT_FOUND',
      });
    }
    const mime = (file.type ?? '').toLowerCase();
    if (!mime.startsWith(VIDEO_MIME_PREFIX)) {
      throw new BadRequestException({
        success: false,
        message: 'Embedding video must be a video/* file.',
        type: 'validation_error',
        code: 'EMBEDDING_INVALID_MIME',
      });
    }
    const linked = await this.prisma.productColorEmbedding.findFirst({
      where: { fileId: file_id },
      select: { id: true },
    });
    if (linked) {
      throw new BadRequestException({
        success: false,
        message: 'File is already linked to another embedding.',
        type: 'validation_error',
        code: 'EMBEDDING_FILE_IN_USE',
      });
    }
    return file;
  }

  async listByProductColor(product_color_id: string) {
    await this.assertProductColorExists(product_color_id);
    const rows = await this.prisma.productColorEmbedding.findMany({
      where: { product_color_id },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      include: { video: true },
    });
    return rows.map((r) => this.serialize(r));
  }

  async create(dto: CreateProductColorEmbeddingDto, actorUserId?: string) {
    this.assertXorContent(dto.embed_code, dto.file_id);
    await this.assertProductColorExists(dto.product_color_id);
    await this.assertUnderLimit(dto.product_color_id);

    let embedCode: string | null = null;
    if (dto.embed_code?.trim()) {
      const parsed = parseEmbedCode(dto.embed_code);
      if (!parsed) {
        this.logger.warn(
          JSON.stringify({
            msg: 'invalid_embed_code',
            product_color_id: dto.product_color_id,
          }),
        );
        throw new BadRequestException({
          success: false,
          message:
            'Invalid or unsupported embed code. Paste an iframe snippet or supported provider embed HTML.',
          type: 'validation_error',
          code: 'EMBEDDING_INVALID_CODE',
        });
      }
      embedCode = parsed.storedCode;
    }

    let fileId: string | null = null;
    if (dto.file_id) {
      await this.validateVideoFile(dto.file_id);
      fileId = dto.file_id;
    }

    const sort_order = await this.nextSortOrder(dto.product_color_id);

    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.productColorEmbedding.create({
        data: {
          product_color_id: dto.product_color_id,
          embed_url: embedCode,
          fileId,
          sort_order,
        },
        include: { video: true },
      });

      if (fileId) {
        await tx.file.update({
          where: { id: fileId },
          data: { is_temp: false },
        });
        const withVideo = await tx.productColorEmbedding.findUnique({
          where: { id: created.id },
          include: { video: true },
        });
        return withVideo!;
      }

      return created;
    });

    this.logger.log(
      JSON.stringify({
        msg: 'embedding_created',
        embedding_id: row.id,
        product_color_id: dto.product_color_id,
        kind: fileId ? 'video' : 'embed',
        actorUserId: actorUserId ?? null,
      }),
    );

    return this.serialize(row);
  }

  async update(
    id: string,
    dto: UpdateProductColorEmbeddingDto,
    actorUserId?: string,
  ) {
    const existing = await this.prisma.productColorEmbedding.findUnique({
      where: { id },
      include: { video: true },
    });
    if (!existing) {
      throw new NotFoundException({
        success: false,
        message: 'Embedding not found.',
        type: 'validation_error',
        code: 'EMBEDDING_NOT_FOUND',
      });
    }

    if (dto.file_id) {
      await this.validateVideoFile(dto.file_id);
      if (existing.fileId && existing.fileId !== dto.file_id && existing.video) {
        await this.removeFileRecord(existing.fileId, existing.video.key);
      }
      const row = await this.prisma.$transaction(async (tx) => {
        await tx.productColorEmbedding.update({
          where: { id },
          data: {
            fileId: dto.file_id,
            embed_url: null,
            ...(dto.sort_order !== undefined
              ? { sort_order: dto.sort_order }
              : {}),
          },
        });
        await tx.file.update({
          where: { id: dto.file_id! },
          data: { is_temp: false },
        });
        return tx.productColorEmbedding.findUnique({
          where: { id },
          include: { video: true },
        });
      });
      this.logger.log(
        JSON.stringify({
          msg: 'embedding_updated',
          embedding_id: id,
          action: 'video_replaced',
          actorUserId: actorUserId ?? null,
        }),
      );
      return this.serialize(row!);
    }

    if (dto.embed_code !== undefined) {
      if (dto.embed_code === null || dto.embed_code === '') {
        throw new BadRequestException({
          success: false,
          message: 'embed_code cannot be cleared without providing file_id.',
          type: 'validation_error',
          code: 'EMBEDDING_INVALID_CONTENT',
        });
      }
      const parsed = parseEmbedCode(dto.embed_code);
      if (!parsed) {
        this.logger.warn(
          JSON.stringify({
            msg: 'invalid_embed_code',
            embedding_id: id,
          }),
        );
        throw new BadRequestException({
          success: false,
          message:
            'Invalid or unsupported embed code. Paste an iframe snippet or supported provider embed HTML.',
          type: 'validation_error',
          code: 'EMBEDDING_INVALID_CODE',
        });
      }
      if (existing.fileId && existing.video) {
        await this.removeFileRecord(existing.fileId, existing.video.key);
      }
      const row = await this.prisma.productColorEmbedding.update({
        where: { id },
        data: {
          embed_url: parsed.storedCode,
          fileId: null,
          ...(dto.sort_order !== undefined
            ? { sort_order: dto.sort_order }
            : {}),
        },
        include: { video: true },
      });
      return this.serialize(row);
    }

    if (dto.sort_order !== undefined) {
      const row = await this.prisma.productColorEmbedding.update({
        where: { id },
        data: { sort_order: dto.sort_order },
        include: { video: true },
      });
      return this.serialize(row);
    }

    return this.serialize(existing);
  }

  async reorder(dto: ReorderProductColorEmbeddingsDto) {
    await this.assertProductColorExists(dto.product_color_id);
    const ids = dto.items.map((i) => i.id);
    const rows = await this.prisma.productColorEmbedding.findMany({
      where: { id: { in: ids }, product_color_id: dto.product_color_id },
    });
    if (rows.length !== ids.length) {
      throw new BadRequestException({
        success: false,
        message: 'One or more embeddings do not belong to this product color.',
        type: 'validation_error',
        code: 'EMBEDDING_REORDER_INVALID',
      });
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.productColorEmbedding.update({
          where: { id: item.id },
          data: { sort_order: item.sort_order },
        }),
      ),
    );

    return this.listByProductColor(dto.product_color_id);
  }

  async remove(id: string, actorUserId?: string) {
    const row = await this.prisma.productColorEmbedding.findUnique({
      where: { id },
      include: { video: true },
    });
    if (!row) {
      throw new NotFoundException({
        success: false,
        message: 'Embedding not found.',
        type: 'validation_error',
        code: 'EMBEDDING_NOT_FOUND',
      });
    }

    await this.prisma.productColorEmbedding.delete({ where: { id } });

    if (row.fileId && row.video) {
      await this.removeFileRecord(row.fileId, row.video.key);
    }

    this.logger.log(
      JSON.stringify({
        msg: 'embedding_deleted',
        embedding_id: id,
        product_color_id: row.product_color_id,
        actorUserId: actorUserId ?? null,
      }),
    );

    return { success: true };
  }

  private async removeFileRecord(fileId: string, key: string) {
    try {
      await this.bucket.remove(key);
    } catch (e: unknown) {
      this.logger.warn(
        JSON.stringify({
          msg: 'embedding_file_bucket_delete_failed',
          fileId,
          error: String((e as Error)?.message ?? e),
        }),
      );
    }
    await this.prisma.file.delete({ where: { id: fileId } }).catch(() => undefined);
  }

  async pipeVideoStream(id: string, req: Request, res: Response) {
    const row = await this.prisma.productColorEmbedding.findUnique({
      where: { id },
      include: { video: true },
    });
    if (!row?.fileId || !row.video) {
      res.status(404).json({
        success: false,
        message: 'Embedding video not found.',
        type: 'product_color_embedding',
        code: 'EMBEDDING_VIDEO_NOT_FOUND',
      });
      return;
    }

    await this.mediaStream.pipeObjectToResponse({
      req,
      res,
      storageKey: row.video.key,
      fileId: row.fileId,
      contentType: row.video.type,
      logContext: `embedding:${id}`,
      errorType: 'product_color_embedding',
      notFoundCode: 'EMBEDDING_VIDEO_NOT_FOUND',
      notFoundMessage: 'Embedding video not found.',
    });
  }
}
