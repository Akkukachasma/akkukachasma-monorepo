import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductColorService } from './product-color.service';
import { ApiResponse, PrismaService } from '../../prisma/prisma.service';
import { AddColorDto } from './dto/add-color.dto';
import { RequiredIdDto } from '../dto/common.dto';
import { SaveImagesDto } from './dto/save-images.dto';
import { FileService } from '../../file/file.service';
import { BucketService } from '../../bucket/bucket.service';
import { UpdateProductColorDto } from './dto/update.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { InvalidateCache } from '../../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_PRODUCT_MUTATION } from '../../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_PRODUCT_MUTATION)
@Controller('products')
@ApiTags('Product Color')
export class ProductColorController {
  constructor(
    private readonly productColorService: ProductColorService,
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly bucketService: BucketService,
  ) {}

  @Post(':id/colors')
  @Roles('admin')
  @ApiOperation({
    description: 'Use to add new product color. Accepts product id in params.',
  })
  async addProductColor(
    @Body() addColorDto: AddColorDto,
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    await this.productColorService.addProductColor(params.id, addColorDto);
    return { success: true, message: 'Product color added successfully' };
  }

  @Post('colors/:id')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use to save changes in product color. Accepts product_color_id in params.',
  })
  async updateProductColors(
    @Body() updateProductColorDto: UpdateProductColorDto,
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    const duplicate = await this.productColorService.isDuplicateModelNumber({
      product_color_id: params.id,
      model_number: updateProductColorDto.model_number,
    });

    if (duplicate) {
      throw new BadRequestException('Duplicate model number');
    }

    const updated = await this.productColorService.updateProductColor({
      data: updateProductColorDto,
      product_color_id: params.id,
    });
    return { success: true, message: 'Updated product color', data: updated };
  }

  @Post('colors/:id/images')
  @Roles('admin')
  @ApiOperation({
    description:
      'Use to save changes in product color images. Accepts product_color_id in params. Already saved images will be ignored.',
  })
  async saveImages(
    @Body() saveImagesDto: SaveImagesDto,
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    const validFiles =
      await this.productColorService.getProductColorFilesToSave(
        saveImagesDto.file_ids,
      );

    if (validFiles.length === 0) {
      return {
        success: false,
        message: 'No valid files provided',
      };
    }

    const existingProductColorFiles =
      await this.productColorService.getProductColorImages(params.id);

    // if existing images includes enough extras don't let them add new ones...
    const existingExtras = existingProductColorFiles.filter(
      (file) => file.fieldname === 'extras',
    );

    const newExtras = validFiles.filter((file) => file.fieldname === 'extras');

    if (newExtras.length > 0 && existingExtras.length >= 4) {
      return {
        success: false,
        message: 'Cannot add more than 4 extra images for a color.',
      };
    } else if (newExtras.length > 4 - existingExtras.length) {
      throw new BadRequestException({
        success: false,
        message: `Cannot add more than ${4 - existingExtras.length} extra images as there are already ${existingExtras.length} existing ones.`,
      });
    }

    const existingThumbnail = existingProductColorFiles.find(
      (file) => file.fieldname === 'thumbnail',
    );
    const newThumbnail = validFiles.find(
      (file) => file.fieldname === 'thumbnail',
    );

    await this.prisma.$transaction(
      async (prisma) => {
        if (newThumbnail && !existingThumbnail) {
          await this.fileService.update({
            file_id: newThumbnail.id,
            data: {
              is_temp: false,
              product_color: {
                connect: { id: params.id },
              },
            },
            prisma,
          });
        } else if (newThumbnail && existingThumbnail) {
          await this.fileService.removeFileById({
            file_id: existingThumbnail.id,
            prisma,
          });
          await this.bucketService.remove(existingThumbnail.key);
          await this.fileService.update({
            file_id: newThumbnail.id,
            data: {
              is_temp: false,
              product_color: {
                connect: { id: params.id },
              },
            },
            prisma,
          });
        }

        // handle extras
        if (newExtras.length > 0) {
          const updateExtrasPromises = newExtras.map(async (file) => {
            await this.fileService.update({
              file_id: file.id,
              data: {
                is_temp: false,
                product_color: {
                  connect: { id: params.id },
                },
              },
              prisma,
            });
          });
          await Promise.all(updateExtrasPromises);
        }
      },
      { maxWait: 40000, timeout: 60000 },
    );

    return {
      success: true,
      message: 'Saved successfully.',
    };
  }

  @Get('colors/:id/images')
  @Roles('admin')
  async getImages(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const images = await this.productColorService.getProductColorImages(
      params.id,
    );
    return {
      success: true,
      data: {
        thumbnail:
          images.find((image) => image.fieldname === 'thumbnail') || null,
        extras: images.filter((image) => image.fieldname === 'extras'),
      },
    };
  }

  @Delete('colors/:id')
  @Roles('admin')
  async removeProductColor(
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    const removed = await this.prisma.$transaction(
      async (prisma) => {
        const removedProductColor = await this.productColorService.remove({
          product_color_id: params.id,
          prisma,
        });
        if (removedProductColor.images) {
          await Promise.all(
            removedProductColor.images.map((image) =>
              this.bucketService.remove(image.key),
            ),
          );
        }
        return removedProductColor;
      },
      { maxWait: 40000, timeout: 60000 },
    );
    return {
      success: true,
      data: removed,
      message: 'Product color removed successfully.',
    };
  }
}
