import { Injectable } from '@nestjs/common';
import { CreatePowerTypeDto } from './dto/create-power-type.dto';
import { UpdatePowerTypeDto } from './dto/update-power-type.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface ICreate extends IWithTransactionClient {
  createPowerTypeDto: CreatePowerTypeDto;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.PowerTypeWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  power_type_id: string;
  updatePowerTypeDto: Omit<UpdatePowerTypeDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  power_type_id: string;
}

interface ICount {
  filters?: Prisma.PowerTypeWhereInput;
}

@Injectable()
export class PowerTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async doesExist(id: string) {
    return await this.prisma.powerType.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({ createPowerTypeDto, user_id, prisma = this.prisma }: ICreate) {
    const { image, ...rest } = createPowerTypeDto;
    return await prisma.powerType.create({
      data: {
        ...rest,
        user: {
          connect: { id: user_id },
        },
        ...(image && {
          image: {
            connect: { id: image },
          },
        }),
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const powerTypes = await this.prisma.powerType.findMany({
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
        _count: { select: { lens_features: true } },
        image: { select: this.prisma.getFileSelection() },
      },
    });
    return powerTypes;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.powerType.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({
    power_type_id,
    updatePowerTypeDto,
    prisma = this.prisma,
  }: IUpdate) {
    return prisma.powerType.update({
      where: {
        id: power_type_id,
      },
      data: updatePowerTypeDto,
    });
  }

  async delete({ power_type_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.powerType.delete({ where: { id: power_type_id } });
  }
}
