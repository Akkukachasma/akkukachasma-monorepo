import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductColorEmbeddingService } from './product-color-embedding.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { MediaStreamService } from '../media-stream/media-stream.service';
import { ProductColorEmbeddingConfigService } from './product-color-embedding.config';

describe('ProductColorEmbeddingService', () => {
  let service: ProductColorEmbeddingService;

  const prisma = {
    productColor: {
      findUnique: jest.fn(),
    },
    productColorEmbedding: {
      count: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    file: {
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const fileService = {
    getFileById: jest.fn(),
  };

  const bucket = {
    remove: jest.fn(),
  };

  const mediaStream = {
    pipeObjectToResponse: jest.fn(),
  };

  const config = {
    maxPerProductColor: 5,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => unknown) =>
      fn(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductColorEmbeddingService,
        { provide: PrismaService, useValue: prisma },
        { provide: FileService, useValue: fileService },
        { provide: BucketService, useValue: bucket },
        { provide: MediaStreamService, useValue: mediaStream },
        { provide: ProductColorEmbeddingConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(ProductColorEmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('serialize', () => {
    it('serializes video embedding with stream path', () => {
      const row = {
        id: 'emb1',
        product_color_id: 'pc1',
        sort_order: 0,
        embed_url: null,
        fileId: 'file1',
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        video: { id: 'file1', type: 'video/mp4', key: 'k' },
      };
      const out = service.serialize(row as never);
      expect(out).toMatchObject({
        kind: 'video',
        stream_path: '/v1/product-color-embeddings/emb1/stream',
        content_type: 'video/mp4',
      });
    });

    it('serializes embed with iframe_src', () => {
      const row = {
        id: 'emb2',
        product_color_id: 'pc1',
        sort_order: 1,
        embed_url: 'https://www.youtube.com/watch?v=abc',
        fileId: null,
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
        video: null,
      };
      const out = service.serialize(row as never);
      expect(out).toMatchObject({
        kind: 'embed',
        embed_provider: 'youtube',
        iframe_src: 'https://www.youtube.com/embed/abc',
        stream_path: null,
      });
    });
  });

  describe('create', () => {
    const productColorId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
      prisma.productColor.findUnique.mockResolvedValue({ id: productColorId });
      prisma.productColorEmbedding.count.mockResolvedValue(0);
      prisma.productColorEmbedding.aggregate.mockResolvedValue({
        _max: { sort_order: -1 },
      });
    });

    it('rejects when neither embed_code nor file_id provided', async () => {
      await expect(
        service.create({ product_color_id: productColorId }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when both embed_code and file_id provided', async () => {
      await expect(
        service.create({
          product_color_id: productColorId,
          embed_code: '<iframe src="https://www.youtube.com/embed/x"></iframe>',
          file_id: '507f1f77bcf86cd799439012',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects invalid embed code', async () => {
      await expect(
        service.create({
          product_color_id: productColorId,
          embed_code: 'not-valid-embed',
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'EMBEDDING_INVALID_CODE' }),
      });
    });

    it('rejects when max embeddings reached', async () => {
      prisma.productColorEmbedding.count.mockResolvedValue(5);
      await expect(
        service.create({
          product_color_id: productColorId,
          embed_code: '<iframe src="https://www.youtube.com/embed/x"></iframe>',
        }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          code: 'MAX_EMBEDDINGS_LIMIT_REACHED',
        }),
      });
    });

    it('creates embed from iframe code', async () => {
      prisma.productColorEmbedding.create.mockResolvedValue({
        id: 'new-emb',
        product_color_id: productColorId,
        sort_order: 0,
        embed_url: '<iframe src="https://www.youtube.com/embed/xyz"></iframe>',
        fileId: null,
        updated_at: new Date(),
        video: null,
      });

      const result = await service.create({
        product_color_id: productColorId,
        embed_code: '<iframe src="https://www.youtube.com/embed/xyz"></iframe>',
      });

      expect(result.kind).toBe('embed');
      expect(result.iframe_src).toContain('youtube.com/embed/xyz');
    });

    it('creates video embedding from file_id', async () => {
      fileService.getFileById.mockResolvedValue({
        id: 'file-vid',
        type: 'video/mp4',
        key: 'videos/x.mp4',
      });
      prisma.productColorEmbedding.findFirst.mockResolvedValue(null);
      prisma.productColorEmbedding.create.mockResolvedValue({
        id: 'vid-emb',
        product_color_id: productColorId,
        sort_order: 0,
        embed_url: null,
        fileId: 'file-vid',
        updated_at: new Date(),
        video: { id: 'file-vid', type: 'video/mp4', key: 'videos/x.mp4' },
      });
      prisma.productColorEmbedding.findUnique.mockResolvedValue({
        id: 'vid-emb',
        product_color_id: productColorId,
        sort_order: 0,
        embed_url: null,
        fileId: 'file-vid',
        updated_at: new Date(),
        video: { id: 'file-vid', type: 'video/mp4', key: 'videos/x.mp4' },
      });

      const result = await service.create({
        product_color_id: productColorId,
        file_id: 'file-vid',
      });

      expect(result.kind).toBe('video');
      expect(result.stream_path).toContain('/stream');
      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-vid' },
        data: { is_temp: false },
      });
    });

    it('throws when product color missing', async () => {
      prisma.productColor.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          product_color_id: productColorId,
          embed_code: '<iframe src="https://www.youtube.com/embed/x"></iframe>',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
