import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ColorService } from './color.service';
import { ApiResponse } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { PublicApi } from '../auth/decorators/public.decorator';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_COLOR_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_COLOR_MUTATION)
@Controller('colors')
@ApiTags('Colors')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post()
  @Roles('admin')
  async createColor(
    @Body() createColorDto: CreateColorDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const duplicate = await this.colorService.isDuplicate(createColorDto.color);

    if (duplicate) throw new BadRequestException('This color already exists.');

    await this.colorService.create(tenant.id, createColorDto);
    return { success: true, message: 'Color created successfully' };
  }

  @Get()
  @PublicApi()
  @Cacheable({ ttl: 60, scope: 'public' })
  async findColors(): Promise<ApiResponse & { total: number }> {
    const data = await this.colorService.findAll();
    const total = await this.colorService.count();
    return {
      success: true,
      message: 'Color created successfully',
      data: data,
      total,
    };
  }

  @Put(':id')
  @Roles('admin')
  async updateColor(
    @Param() params: RequiredIdDto,
    @Body() updateColorDto: UpdateColorDto,
  ): Promise<ApiResponse> {
    const exist = await this.colorService.doesExist(params.id);

    if (!exist) {
      throw new NotFoundException('Color does not exists.');
    }

    const duplicate = await this.colorService.isDuplicate(
      updateColorDto.color,
      params.id,
    );
    if (duplicate) throw new BadRequestException('This color already exists.');

    await this.colorService.update(params.id, updateColorDto);
    return { success: true, message: 'Color updated successfully' };
  }

  @Delete(':id')
  @Roles('admin')
  async deleteColor(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const exist = await this.colorService.doesExist(params.id);

    if (!exist) {
      throw new NotFoundException('Color does not exists.');
    }

    // prevent if the color has a record associated with it
    const hasRecord = await this.colorService.hasRecord(params.id);
    if (hasRecord) {
      throw new BadRequestException('Color has a record associated with it.');
    }

    await this.colorService.remove(params.id);
    return { success: true, message: 'Color deleted successfully' };
  }
}
