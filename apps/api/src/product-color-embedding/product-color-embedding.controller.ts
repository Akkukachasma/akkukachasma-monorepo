import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { ProductColorEmbeddingService } from './product-color-embedding.service';
import { CreateProductColorEmbeddingDto } from './dto/create-product-color-embedding.dto';
import { UpdateProductColorEmbeddingDto } from './dto/update-product-color-embedding.dto';
import { ReorderProductColorEmbeddingsDto } from './dto/reorder-product-color-embeddings.dto';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

@ApiTags('Product color embeddings')
@Controller('product-color-embeddings')
export class ProductColorEmbeddingController {
  constructor(
    private readonly embeddings: ProductColorEmbeddingService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Get('by-product-color/:id')
  @PublicApi()
  @ApiOperation({ summary: 'List embeddings for a product color (public)' })
  async listByProductColor(
    @Param() params: RequiredIdDto,
  ): Promise<ApiReturnType> {
    const data = await this.embeddings.listByProductColor(params.id);
    return { success: true, data, message: 'Product color embeddings' };
  }

  @Get(':id/stream')
  @PublicApi()
  @ApiOperation({ summary: 'Stream embedding video (HTTP Range / seeking)' })
  async stream(
    @Param() params: RequiredIdDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.embeddings.pipeVideoStream(params.id, req, res);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.PRODUCT_EMBEDDING_MANAGE)
  @ApiOperation({
    summary: 'Create embedding (embed code or file_id from stream upload)',
  })
  async create(
    @Body() dto: CreateProductColorEmbeddingDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiReturnType> {
    const data = await this.embeddings.create(dto, tenant.id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Product color embedding',
        entityType: 'ProductColorEmbedding',
        entityId: data.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Embedding created' };
  }

  @Patch('reorder')
  @RequirePermissions(PERMISSIONS.PRODUCT_EMBEDDING_MANAGE)
  @ApiOperation({ summary: 'Reorder embeddings for a product color' })
  async reorder(
    @Body() dto: ReorderProductColorEmbeddingsDto,
  ): Promise<ApiReturnType> {
    const data = await this.embeddings.reorder(dto);
    return { success: true, data, message: 'Embeddings reordered' };
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PRODUCT_EMBEDDING_MANAGE)
  @ApiOperation({ summary: 'Update embedding' })
  async update(
    @Param() params: RequiredIdDto,
    @Body() dto: UpdateProductColorEmbeddingDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiReturnType> {
    const data = await this.embeddings.update(params.id, dto, tenant.id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Product color embedding',
        entityType: 'ProductColorEmbedding',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Embedding updated' };
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.PRODUCT_EMBEDDING_MANAGE)
  @ApiOperation({ summary: 'Delete embedding' })
  async remove(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiReturnType> {
    const data = await this.embeddings.remove(params.id, tenant.id);
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'deleted',
        entityLabel: 'Product color embedding',
        entityType: 'ProductColorEmbedding',
        entityId: params.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Embedding deleted' };
  }
}
