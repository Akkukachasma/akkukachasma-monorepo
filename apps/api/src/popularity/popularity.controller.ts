import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../prisma/prisma.service';
import { PublicApi } from '../auth/decorators/public.decorator';
import { PopularityService } from './popularity.service';
import { RecordShareDto } from './dto/record-share.dto';

@ApiTags('Popularity')
@Controller('popularity')
export class PopularityController {
  constructor(private readonly popularityService: PopularityService) {}

  @PublicApi()
  @Post('share')
  @ApiOperation({
    description: 'Record a share event for a product variant (ProductColor).',
  })
  async recordShare(@Body() body: RecordShareDto): Promise<ApiResponse> {
    await this.popularityService.recordShare(body.product_color_id);
    return { success: true, message: 'Share recorded successfully.' };
  }
}
