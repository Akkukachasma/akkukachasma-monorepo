import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { ApiResponse } from '../prisma/prisma.service';
import { ITenant, Tenant } from '../auth/decorators/tenant.decorator';
import { CreatePrescriptionDto } from './dto/create.dto';
import { UpdatePrescriptionDto } from './dto/update.dto';
import { RequiredIdDto } from '../prisma/dto/common.dto';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get()
  @ApiOperation({ description: 'List saved prescriptions for the logged-in user' })
  async list(@Tenant() tenant: ITenant): Promise<ApiResponse> {
    const data = await this.prescriptionService.findAllForUser(tenant.id);
    return {
      success: true,
      data,
      message: 'Prescriptions retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ description: 'Get one prescription by id' })
  async getOne(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prescriptionService.findOneForUser(
      params.id,
      tenant.id,
    );
    return {
      success: true,
      data,
      message: 'Prescription retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ description: 'Create a saved prescription' })
  async create(
    @Body() dto: CreatePrescriptionDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prescriptionService.createForUser(tenant.id, dto);
    return {
      success: true,
      data,
      message: 'Prescription created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ description: 'Update a saved prescription' })
  async update(
    @Param() params: RequiredIdDto,
    @Body() dto: UpdatePrescriptionDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prescriptionService.updateForUser(
      params.id,
      tenant.id,
      dto,
    );
    return {
      success: true,
      data,
      message: 'Prescription updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete a saved prescription' })
  async remove(
    @Param() params: RequiredIdDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const data = await this.prescriptionService.removeForUser(
      params.id,
      tenant.id,
    );
    return {
      success: true,
      data,
      message: 'Prescription deleted successfully',
    };
  }
}
