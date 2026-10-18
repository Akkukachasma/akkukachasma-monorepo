import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompanyInfoService } from './company-info.service';
import { CreateCompanyInfoDto } from './dto/create-company-info.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ITenant, Tenant } from '../../auth/decorators/tenant.decorator';
import { ApiResponse, ApiResponse as PrismaApiResponse } from '../../prisma/prisma.service';
import { PublicApi } from '../../auth/decorators/public.decorator';
import { NotificationsDispatchService } from '../../notifications/notifications-dispatch.service';
import { InvalidateCache } from '../../cache/invalidate-cache.decorator';
import { INVALIDATE_ON_SETTING_MUTATION } from '../../cache/cache-invalidation.presets';

@InvalidateCache(INVALIDATE_ON_SETTING_MUTATION)
@ApiTags('Company Information')
@Controller('company-info')
export class CompanyInfoController {
  constructor(
    private readonly companyInfoService: CompanyInfoService,
    private readonly notificationsDispatch: NotificationsDispatchService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ description: 'Create company information' })
  async create(
    @Body() createCompanyInfoDto: CreateCompanyInfoDto,
    @Tenant() tenant: ITenant,
  ): Promise<PrismaApiResponse> {
    const data = await this.companyInfoService.create(
      createCompanyInfoDto,
      tenant.id,
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'created',
        entityLabel: 'Company info',
        entityType: 'CompanyInfo',
        entityId: data?.id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Created successfully.' };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ description: 'Get all company information records' })
  async findAll(): Promise<ApiResponse> {
    const data = await this.companyInfoService.findAll();
    if (data.length < 1) {
      return { success: false, data: null };
    }
    return { success: true, data: data[0] };
  }

  @Get('cod-enabled')
  @PublicApi()
  @ApiOperation({ description: 'Get COD acceptance toggle' })
  async getCodEnabled(): Promise<ApiResponse> {
    const cod_enabled = await this.companyInfoService.isCodEnabled();
    return { success: true, data: { cod_enabled } };
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ description: 'Update company information' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyInfoDto: UpdateCompanyInfoDto,
    @Tenant() tenant: ITenant,
  ): Promise<PrismaApiResponse> {
    const exists = await this.companyInfoService.findOne(id);
    if (!exists) {
      throw new Error('Company info does not exist.');
    }

    const data = await this.companyInfoService.update(
      id,
      updateCompanyInfoDto,
      tenant.id,
    );
    void this.notificationsDispatch
      .notifyResourceMutation({
        actorId: tenant.id,
        action: 'updated',
        entityLabel: 'Company info',
        entityType: 'CompanyInfo',
        entityId: id,
      })
      .catch(() => {});
    return { success: true, data, message: 'Updated successfully.' };
  }
}
