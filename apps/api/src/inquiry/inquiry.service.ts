import { Injectable } from '@nestjs/common';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface ICreate extends IWithTransactionClient {
  createInquiryDto: CreateInquiryDto;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.InquiryWhereInput;
  sort_by?: string;
}

interface IDelete extends IWithTransactionClient {
  inquiry_id: string;
}

interface ICount {
  filters?: Prisma.InquiryWhereInput;
}

@Injectable()
export class InquiryService {
  constructor(private readonly prisma: PrismaService) {}

  async doesExist(id: string) {
    return await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        address: true,
      },
    });
  }

  async create({ createInquiryDto, prisma = this.prisma }: ICreate) {
    return await prisma.inquiry.create({
      data: createInquiryDto,
      include: {
        address: true,
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const inquiries = await this.prisma.inquiry.findMany({
      skip: (page - 1) * page_size,
      take: page_size,
      where: {
        ...(filters && filters),
      },
      orderBy: (() => {
        switch (sort_by) {
          case 'created_asc':
            return [{ created_at: 'asc' }];
          case 'created_desc':
            return [{ created_at: 'desc' }];
          case 'name_asc':
            return [{ first_name: 'asc' }, { last_name: 'asc' }];
          case 'name_desc':
            return [{ first_name: 'desc' }, { last_name: 'desc' }];
          case 'recently_updated':
            return [{ updated_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
      include: {
        address: true,
      },
    });
    return inquiries;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.inquiry.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async delete({ inquiry_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.inquiry.delete({ 
      where: { id: inquiry_id },
      include: {
        address: true,
      },
    });
  }
} 