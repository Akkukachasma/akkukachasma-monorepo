import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { GetInquiryDto } from './dto/get-inquiry.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  PrismaService,
} from '../prisma/prisma.service';
import { RequiredIdDto } from '../prisma/dto/common.dto';
import { Prisma } from '@prisma/client';
import { PublicApi } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Inquiries')
@Controller('inquiries')
export class InquiryController {
  constructor(
    private readonly inquiryService: InquiryService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @PublicApi()
  @ApiOperation({ summary: 'Create a new inquiry' })
  async createInquiry(
    @Body() createInquiryDto: CreateInquiryDto,
  ): Promise<ApiResponse> {
    const inquiry = await this.inquiryService.create({
      createInquiryDto,
    });

    return {
      success: true,
      data: inquiry,
      message: 'Inquiry created successfully',
    };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all inquiries with advanced filters' })
  async getAllInquiries(
    @Query() query: GetInquiryDto,
  ): Promise<PaginatedResponse> {
    const filters: Prisma.InquiryWhereInput = {};

    // Search term filter
    if (query.search_term) {
      filters.OR = [
        {
          first_name: {
            contains: query.search_term,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
            contains: query.search_term,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.search_term,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Source filter
    if (query.source) {
      filters.source = query.source;
    }

    // Email filter
    if (query.email) {
      filters.email = {
        contains: query.email,
        mode: 'insensitive',
      };
    }

    // Phone filter
    if (query.phone) {
      filters.phone = {
        contains: query.phone,
        mode: 'insensitive',
      };
    }

    // Date range filters
    if (query.start_date || query.end_date) {
      filters.created_at = {};
      
      if (query.start_date) {
        filters.created_at.gte = new Date(query.start_date);
      }
      
      if (query.end_date) {
        filters.created_at.lte = new Date(query.end_date);
      }
    }

    const data = await this.inquiryService.findAll({
      page: query.page,
      page_size: query.page_size,
      filters,
      sort_by: query.sort_by,
    });

    const total = await this.inquiryService.count({ filters });

    return {
      success: true,
      data,
      total,
      page: query.page,
      page_size: query.page_size,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an inquiry by ID' })
  async deleteInquiry(@Param() params: RequiredIdDto): Promise<ApiResponse> {
    const inquiry = await this.inquiryService.doesExist(params.id);
    
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    await this.inquiryService.delete({
      inquiry_id: params.id,
    });

    return {
      success: true,
      message: 'Inquiry deleted successfully',
    };
  }
} 