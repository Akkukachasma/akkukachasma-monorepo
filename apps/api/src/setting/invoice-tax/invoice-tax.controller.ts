import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { InvoiceTaxService } from './invoice-tax.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../prisma/prisma.service';
import { CreateInvoiceTaxDto } from './dto/create-tax.dto';
import { ITenant, Tenant } from '../../auth/decorators/tenant.decorator';
import { UpdateInvoiceTaxDto } from './dto/update-tax.dto';
import { RequiredIdDto } from '../../prisma/dto/common.dto';
import { Cacheable } from '../../cache/cache.decorator';
import { InvalidateCache } from '../../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_SETTING_MUTATION } from '../../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_SETTING_MUTATION)
@Controller('taxes')
@ApiTags('Invoice Tax Management')
export class InvoiceTaxController {
  constructor(private readonly invoiceTaxService: InvoiceTaxService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ description: 'Use this api to create a Tax type.' })
  async createTax(
    @Body() createInvoiceTaxDto: CreateInvoiceTaxDto,
    @Tenant() tenant: ITenant,
  ): Promise<ApiResponse> {
    const setting = await this.invoiceTaxService.ensureSetting(tenant.id);
    const duplicate = await this.invoiceTaxService.duplicateInvoiceTax(
      createInvoiceTaxDto.label,
    );
    if (duplicate) {
      throw new BadRequestException('Tax already exists');
    }
    const tax = await this.invoiceTaxService.createInvoiceTax(
      createInvoiceTaxDto,
      setting.id,
    );
    return { success: true, message: 'Tax created successfully', data: tax };
  }

  @Get()
  @Roles('admin')
  @Cacheable({ ttl: 600, scope: 'user' })
  @ApiOperation({ description: 'Use this api to create a Tax type.' })
  async fetchTax(): Promise<ApiResponse> {
    const data = await this.invoiceTaxService.findAll();
    return { success: true, data };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ description: 'Use this api to update a Tax type.' })
  async updateTax(
    @Body() updateInvoiceTaxDto: UpdateInvoiceTaxDto,
    @Param() params: RequiredIdDto,
  ): Promise<ApiResponse> {
    const duplicate = await this.invoiceTaxService.duplicateInvoiceTax(
      updateInvoiceTaxDto.label,
      params.id,
    );
    if (duplicate) {
      throw new BadRequestException('Tax already exists');
    }

    const tax = await this.invoiceTaxService.updateInvoiceTax(
      params.id,
      updateInvoiceTaxDto,
    );

    return { success: true, message: 'Tax updated successfully', data: tax };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ description: 'Use this api to delete a Tax type.' })
  async deleteTax(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const tax = await this.invoiceTaxService.deleteInvoiceTax(params.id);
    return { success: true, message: 'Tax deleted successfully', data: tax };
  }
}
