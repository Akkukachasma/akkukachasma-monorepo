import { Injectable } from '@nestjs/common';
import { CreateFrameMaterialDto } from './dto/create-frame-material.dto';
import { UpdateFrameMaterialDto } from './dto/update-frame-material.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface ICreate {
  createFrameMaterialDto: CreateFrameMaterialDto;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.FrameMaterialWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  frame_material_id: string;
  updateFrameMaterialDto: UpdateFrameMaterialDto;
}

interface IDelete extends IWithTransactionClient {
  frame_material_id: string;
}

interface ICount {
  filters?: Prisma.FrameMaterialWhereInput;
}

@Injectable()
export class FrameMaterialService {
  constructor(private readonly prisma: PrismaService) {}

  async doesExist(id: string) {
    return await this.prisma.frameMaterial.findUnique({
      where: { id },
    });
  }

  async create({ createFrameMaterialDto, user_id }: ICreate) {
    return await this.prisma.frameMaterial.create({
      data: {
        ...createFrameMaterialDto,
        user: {
          connect: { id: user_id },
        },
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const frameMaterials = await this.prisma.frameMaterial.findMany({
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
    return frameMaterials;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.frameMaterial.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({ frame_material_id, updateFrameMaterialDto, prisma }: IUpdate) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.frameMaterial.update({
      where: {
        id: frame_material_id,
      },
      data: updateFrameMaterialDto,
    });
  }

  async delete({ frame_material_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.frameMaterial.delete({
      where: { id: frame_material_id },
    });
  }
}
