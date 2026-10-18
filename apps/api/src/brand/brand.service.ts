import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

interface ICreate {
  createBrandDto: CreateBrandDto;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.BrandWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  brand_id: string;
  updateBrandDto: UpdateBrandDto;
}

interface IDelete extends IWithTransactionClient {
  brand_id: string;
}

interface ICount {
  filters?: Prisma.BrandWhereInput;
}

interface IsDuplicateSlug {
  slug: string;
  brand_id?: string;
}

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async isDuplicateSlug({ slug, brand_id }: IsDuplicateSlug) {
    return await this.prisma.brand.count({
      where: {
        slug,
        ...(brand_id && { id: { not: brand_id } }),
      },
    });
  }

  async doesExist(id: string) {
    return await this.prisma.brand.findUnique({
      where: { id },
    });
  }

  async create({ createBrandDto, user_id }: ICreate) {
    return await this.prisma.brand.create({
      data: {
        ...createBrandDto,
        user: {
          connect: { id: user_id },
        },
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const brands = await this.prisma.brand.findMany({
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
            return [{ title: 'asc' }];
          case 'name_desc':
            return [{ title: 'desc' }];
          case 'recently_updated':
            return [{ updated_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
    });
    return brands;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.brand.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({ brand_id, updateBrandDto, prisma }: IUpdate) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.brand.update({
      where: {
        id: brand_id,
      },
      data: updateBrandDto,
    });
  }

  async delete({ brand_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.brand.delete({
      where: { id: brand_id },
    });
  }
}
