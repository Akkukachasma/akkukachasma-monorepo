import { Injectable } from '@nestjs/common';
import { CreateShapeDto } from './dto/create-shape.dto';
import { UpdateShapeDto } from './dto/update-shape.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface ICreate extends IWithTransactionClient {
  createShapeDto: Omit<CreateShapeDto, 'image'>;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.ShapeWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  shape_id: string;
  updateShapeDto: Omit<UpdateShapeDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  shape_id: string;
}

interface ICount {
  filters?: Prisma.ShapeWhereInput;
}

interface IsDuplicateSlug {
  slug: string;
  shape_id?: string;
}

@Injectable()
export class ShapeService {
  constructor(private readonly prisma: PrismaService) {}

  async isDuplicateSlug({ slug, shape_id }: IsDuplicateSlug) {
    return await this.prisma.shape.count({
      where: {
        slug,
        ...(shape_id && { id: { not: shape_id } }),
      },
    });
  }

  async doesExist(id: string) {
    return await this.prisma.shape.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({ createShapeDto, user_id, prisma = this.prisma }: ICreate) {
    return await prisma.shape.create({
      data: {
        ...createShapeDto,
        keywords: createShapeDto.keywords ?? [],
        user: {
          connect: { id: user_id },
        },
      },
    });
  }

  async findOneBySlug(slug: string) {
    return await this.prisma.shape.findUnique({
      where: { slug },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const shapes = await this.prisma.shape.findMany({
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
      include: {
        image: { select: this.prisma.getFileSelection() },
      },
    });
    return shapes;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.shape.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({ shape_id, updateShapeDto, prisma = this.prisma }: IUpdate) {
    return await prisma.shape.update({
      where: {
        id: shape_id,
      },
      data: updateShapeDto,
    });
  }

  async delete({ shape_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.shape.delete({ where: { id: shape_id } });
  }
}
