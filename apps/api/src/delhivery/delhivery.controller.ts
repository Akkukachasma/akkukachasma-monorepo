import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DelhiveryService, DelhiveryTrackResponse } from './delhivery.service';
import { ApiResponse as ApiResponseType } from '../prisma/prisma.service';

@Controller('delhivery')
@ApiTags('Delhivery')
export class DelhiveryController {
  constructor(private readonly delhiveryService: DelhiveryService) {}

  @Get('track/:waybillNumber')
  @ApiOperation({ description: 'Track package by waybill number (internal use)' })
  async trackByWaybill(
    @Param('waybillNumber') waybillNumber: string,
  ): Promise<ApiResponseType & { data?: DelhiveryTrackResponse }> {
    const result = await this.delhiveryService.trackPackage(waybillNumber);

    return {
      success: true,
      data: result ?? undefined,
      message: result ? 'Tracking data retrieved' : 'No tracking data available',
    };
  }
}
