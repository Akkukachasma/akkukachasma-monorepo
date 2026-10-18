// src/article/article.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Prisma } from '@prisma/client';
import { FileService } from '../file/file.service';
import { estimateArticleReadingTimeMinutes } from './article-reading-time.util';

interface IUpdateArticleDto extends IWithTransactionClient {
  article_id: string;
  updateArticleDto: Omit<UpdateArticleDto, 'thumbnail'>;
}
interface IDeleteArticleDto extends IWithTransactionClient {
  article_id: string;
}

interface ICreate extends IWithTransactionClient {
  createArticleDto: CreateArticleDto;
}

type ArticleWithContent = {
  content: string;
  reading_time: number | null;
};

@Injectable()
export class ArticleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private applyReadingTimeFallback<T extends ArticleWithContent>(article: T): T {
    if (article.reading_time != null) {
      return article;
    }
    return {
      ...article,
      reading_time: estimateArticleReadingTimeMinutes(article.content),
    };
  }

  async create({ createArticleDto, prisma = this.prisma }: ICreate) {
    const { thumbnail, ...rest } = createArticleDto;
    const reading_time = estimateArticleReadingTimeMinutes(rest.content);
    return prisma.article.create({
      data: {
        ...rest,
        slug: rest.slug,
        reading_time,
        ...(thumbnail && {
          thumbnail: {
            connect: { id: thumbnail },
          },
        }),
      },
      include: {
        thumbnail: true,
        shapes: true,
        categories: true,
      },
    });
  }

  async findAll({ page = 1, page_size = 10, filters = {} }) {
    const rows = await this.prisma.article.findMany({
      where: filters,
      skip: (page - 1) * page_size,
      orderBy: [{ created_at: 'desc' }, { updated_at: 'desc' }],
      take: page_size,
      include: {
        thumbnail: true,
        shapes: true,
        categories: true,
      },
    });
    return rows.map((row) => this.applyReadingTimeFallback(row));
  }

  async findPopularArticles() {
    const rows = await this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      take: 5,
      orderBy: {
        views: 'desc',
      },
      include: {
        thumbnail: { select: this.prisma.getFileSelection() },
      },
    });
    return rows.map((row) => this.applyReadingTimeFallback(row));
  }

  async findOne(id: string) {
    const row = await this.prisma.article.findUnique({
      where: { id },
      include: {
        thumbnail: true,
        shapes: true,
        categories: true,
      },
    });
    return row ? this.applyReadingTimeFallback(row) : null;
  }

  async findOneBySlug(slug: string) {
    const row = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        thumbnail: true,
        shapes: true,
        categories: true,
      },
    });
    return row ? this.applyReadingTimeFallback(row) : null;
  }

  async update({
    article_id,
    updateArticleDto,
    prisma = this.prisma,
  }: IUpdateArticleDto) {
    const data: Prisma.ArticleUpdateInput = {
      ...updateArticleDto,
      ...(updateArticleDto.title && {
        slug: updateArticleDto.slug,
      }),
    };
    if (updateArticleDto.content !== undefined) {
      data.reading_time = estimateArticleReadingTimeMinutes(
        updateArticleDto.content,
      );
    }
    return prisma.article.update({
      where: { id: article_id },
      data,
      include: {
        thumbnail: true,
        shapes: true,
        categories: true,
      },
    });
  }

  async delete({ article_id, prisma = this.prisma }: IDeleteArticleDto) {
    return prisma.article.delete({
      where: { id: article_id },
    });
  }

  async count({ filters = {} }: { filters?: Prisma.ArticleWhereInput }) {
    return await this.prisma.article.count({ where: filters });
  }

  async doesExist(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: { thumbnail: true },
    });
  }

  async incrementViewsBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });
  }
}
