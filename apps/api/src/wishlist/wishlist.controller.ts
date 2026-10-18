import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../prisma/prisma.service';
import { Cacheable } from '../cache/cache.decorator';
import { InvalidateCache } from '../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_WISHLIST_MUTATION } from '../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_WISHLIST_MUTATION)
@Controller('wishlist')
@ApiTags('Wishlist Management')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @Roles('customer')
  @ApiOperation({
    description:
      "Add a product to the user's wishlist. Idempotent if already wishlisted.",
  })
  async create(
    @Body() dto: CreateWishlistDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.wishlistService.create(dto, tenant.id);
    return {
      message: 'Product added to wishlist successfully.',
      success: true,
    };
  }

  @Get()
  @Roles('customer')
  @Cacheable({ ttl: 60, scope: 'user' })
  @ApiOperation({
    description: "Fetch the current user's wishlist with product card payload.",
  })
  async findAll(@Tenant() tenant: ITenant): Promise<ApiResponse> {
    const data = await this.wishlistService.findAll(tenant.id);
    return {
      message: 'Wishlist items fetched successfully.',
      success: true,
      data,
    };
  }

  @Delete('clear')
  @Roles('customer')
  @ApiOperation({ description: 'Remove every item from the wishlist.' })
  async clear(@Tenant() tenant: ITenant): Promise<ApiResponse> {
    await this.wishlistService.clear(tenant.id);
    return {
      message: 'Wishlist cleared successfully.',
      success: true,
    };
  }

  @Delete('product-color/:productColorId')
  @Roles('customer')
  @ApiOperation({
    description:
      'Remove a wishlist entry by ProductColor (variant) ID — matches listing/PDP hearts.',
  })
  async removeByProductColor(
    @Param('productColorId') productColorId: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.wishlistService.removeByProductColorId(
      productColorId,
      tenant.id,
    );
    return {
      message: 'Product removed from wishlist successfully.',
      success: true,
    };
  }

  @Delete(':id')
  @Roles('customer')
  @ApiOperation({
    description: 'Remove a wishlist row by its own ID.',
  })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    await this.wishlistService.remove(id, tenant.id);
    return {
      message: 'Product removed from wishlist successfully.',
      success: true,
    };
  }
}
