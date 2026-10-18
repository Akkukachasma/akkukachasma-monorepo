// src/article/article.controller.ts
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
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BucketService } from '../bucket/bucket.service';
import { GetArticleDto } from './dto/get-article.dto';
import { ParamSlugDto, RequiredIdDto } from '../prisma/dto/common.dto';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { Article, Prisma } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { ProductService } from '../product/product.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { IProductColor } from '../wishlist/types';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_ARTICLE_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_ARTICLE_MUTATION)
@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly articleService: ArticleService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
    private readonly productService: ProductService,
    private readonly wishlistService: WishlistService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @ApiOperation({
    description: 'Create a new article',
  })
  @Roles('admin')
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prisma.$transaction(
      async (prisma) => {
        const article = await this.articleService.create({
          createArticleDto,
          prisma,
        });
        if (createArticleDto.thumbnail) {
          await this.fileService.update({
            file_id: createArticleDto.thumbnail,
            data: {
              is_temp: false,
            },
            prisma,
          });
        }
        return article;
      },
      { maxWait: 40000, timeout: 60000 },
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Article',
        entityType: 'Article',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({
    description: 'Get all articles',
  })
  async findAll(@Query() query: GetArticleDto): Promise<PaginatedResponse> {
    const filters: Prisma.ArticleWhereInput = {
      title: { contains: query.search_term, mode: 'insensitive' },
      ...(query.status && { status: query.status }),
    };
    const data = await this.articleService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.articleService.count({ filters });
    return {
      success: true,
      total,
      page: query.page,
      page_size: query.page_size,
      data,
    };
  }

  @Get('published')
  @PublicApi()
  @ApiOperation({
    description: 'Fetch all published posts. Sending status makes no change.',
  })
  async findAllPublishedPosts(
    @Query() query: GetArticleDto,
  ): Promise<PaginatedResponse> {
    const filters: Prisma.ArticleWhereInput = {
      status: 'PUBLISHED',
    };
    const data = await this.articleService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
    });
    const total = await this.articleService.count({ filters });
    return {
      success: true,
      data,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Get('popular')
  @PublicApi()
  async findPopularArticles(): Promise<ApiResponse<Article[]>> {
    const data = await this.articleService.findPopularArticles();
    return { success: true, data };
  }

  @PublicApi()
  @Patch('published/:slug/views')
  @ApiOperation({
    summary: 'Increment view count for a published article (public)',
  })
  async incrementArticleViews(
    @Param() params: ParamSlugDto,
  ): Promise<ApiResponse> {
    await this.articleService.incrementViewsBySlug(params.slug);
    return { success: true, message: 'View recorded.' };
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({
    description: 'Get article by id',
  })
  async findOne(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const data = await this.articleService.findOne(params.id);
    if (!data) throw new NotFoundException('Article not found');
    return { success: true, data };
  }

  @Get('published/:slug')
  @PublicApi()
  @ApiOperation({
    description: 'Get article by slug',
  })
  async findOneBySlug(
    @Param() params: ParamSlugDto,
    @Tenant() tenant?: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.articleService.findOneBySlug(params.slug);

    if (!data) throw new NotFoundException('Article not found');
    const select = this.productService.getPublicSeparatedProductColorSelect();

    const [shapeProducts, categoryProducts] = await Promise.all([
      this.prisma.productColor.findMany({
        take: 5,
        orderBy: [
          {
            popularity: {
              score: 'desc',
            },
          },
        ],
        where: {
          product: {
            shape: {
              id: {
                in: data?.shapes?.map((shape) => shape.id) || [],
              },
            },
          },
        },
        select,
      }),
      this.prisma.productColor.findMany({
        take: 5,
        orderBy: [
          {
            popularity: {
              score: 'desc',
            },
          },
        ],
        where: {
          product: {
            category: {
              id: {
                in: data?.categories?.map((category) => category.id) || [],
              },
            },
          },
        },
        select,
      }),
    ]);

    const merged = [...shapeProducts, ...categoryProducts];
    const byId = new Map(
      merged.map((row) => [row.id, row as unknown as IProductColor]),
    );
    const uniqueRelated = [...byId.values()];
    const related_products = await this.wishlistService.flagProductColors(
      uniqueRelated,
      tenant?.id ?? '',
    );

    return {
      success: true,
      data: {
        ...data,
        related_products,
      },
    };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    description: 'Update article by id',
  })
  async update(
    @Param() params: RequiredIdDto,
    @Body() updateArticleDto: UpdateArticleDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.articleService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Article does not exist.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists?.thumbnail && updateArticleDto.thumbnail) {
          await this.bucketService.remove(exists.thumbnail.key);
          await this.fileService.removeFileById({
            file_id: exists.thumbnail.id,
            prisma,
          });
        }
        const { thumbnail, ...rest } = updateArticleDto;
        const updatedArticle = await this.articleService.update({
          article_id: params.id,
          updateArticleDto: rest,
          prisma,
        });
        if (thumbnail) {
          await this.fileService.update({
            file_id: thumbnail,
            data: {
              is_temp: false,
              article: {
                connect: { id: updatedArticle.id },
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
        entityLabel: 'Article',
        entityType: 'Article',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Updated successfully.' };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    description: 'Delete article by id',
  })
  async remove(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const exists = await this.articleService.doesExist(params.id);

    if (!exists) {
      throw new NotFoundException('Article does not exist.');
    }

    await this.prisma.$transaction(
      async (prisma) => {
        if (exists.thumbnail)
          await this.bucketService.remove(exists.thumbnail.key);
        await this.articleService.delete({
          article_id: params.id,
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
        entityLabel: 'Article',
        entityType: 'Article',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, message: 'Deleted successfully.' };
  }
}
