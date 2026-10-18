import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiResponse as ApiReturnType } from '../../prisma/prisma.service';
import { StreamInitDto } from '../dto/stream-init.dto';
import { StreamCompleteDto } from '../dto/stream-complete.dto';
import { UploadIdRouteParamDto } from '../dto/upload-id-route-param.dto';
import { FileStreamUploadService } from './file-stream-upload.service';
import {
  BusboyChunkInterceptor,
  LargeUploadStagePayload,
} from './busboy-chunk.interceptor';
import type { User } from '@prisma/client';
import { streamProblem } from './stream-upload.exceptions';

type ReqWithUser = Request & {
  user: User & { permissions?: unknown; roles?: unknown };
};

@ApiTags('File stream uploads')
@Controller('files/stream')
export class FileStreamUploadController {
  constructor(private readonly streamUploads: FileStreamUploadService) {}

  @Post('init')
  @ApiOperation({
    summary: 'Start large resumable upload session',
    description:
      'Returns uploadId used for chunked uploads; requires authentication.',
  })
  async init(
    @Req() req: ReqWithUser,
    @Body() dto: StreamInitDto,
  ): Promise<ApiReturnType> {
    const data = await this.streamUploads.initSession(req.user.id, dto);
    return {
      success: true,
      data,
      message: 'Stream upload session initialized',
    };
  }

  @Post('chunk')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['uploadId', 'chunkIndex', 'chunk'],
      properties: {
        uploadId: { type: 'string', example: '64c0ffffffffffffffffffff' },
        chunkIndex: { type: 'integer', minimum: 0 },
        chunk: { type: 'string', format: 'binary', description: 'Chunk bytes' },
      },
    },
  })
  @UseInterceptors(BusboyChunkInterceptor)
  @ApiOperation({ summary: 'Upload one chunk (streamed to temp disk)' })
  async uploadChunk(@Req() req: ReqWithUser): Promise<ApiReturnType> {
    const stage = (req as unknown as ReqWithUser & {
      largeUploadStage?: LargeUploadStagePayload;
    }).largeUploadStage;

    if (!stage) {
      throw streamProblem('STREAM_INVALID_MULTIPART');
    }

    const data = await this.streamUploads.acceptStagedChunk(req.user.id, stage);

    return {
      success: true,
      data,
      message: 'Chunk stored',
    };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Finalize upload (merge streams to S3, create File)' })
  async complete(
    @Req() req: ReqWithUser,
    @Body() body: StreamCompleteDto,
  ): Promise<ApiReturnType> {
    const resp = await this.streamUploads.complete(req.user.id, body.uploadId);
    return {
      success: resp.success,
      data: resp.data,
      message: 'Upload completed',
    };
  }

  @Delete(':uploadId')
  @ApiOperation({ summary: 'Cancel stream upload (removes staged chunks)' })
  async cancel(
    @Req() req: ReqWithUser,
    @Param() params: UploadIdRouteParamDto,
  ): Promise<ApiReturnType> {
    const data = await this.streamUploads.cancel(req.user.id, params.uploadId);
    return { success: true, data, message: 'Upload cancelled' };
  }

  @Get(':uploadId/status')
  @ApiOperation({ summary: 'Resume / progress information' })
  async status(
    @Req() req: ReqWithUser,
    @Param() params: UploadIdRouteParamDto,
  ): Promise<ApiReturnType> {
    const data = await this.streamUploads.getStatus(
      req.user.id,
      params.uploadId,
    );
    return { success: true, data };
  }
}
