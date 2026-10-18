import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { CreateLensDetailDto } from './dto/create-lens-detail.dto';
import { UpdateLensDetailDto } from './dto/update-lens-detail.dto';

interface ICreate extends IWithTransactionClient {
  createLensDetailDto: Omit<CreateLensDetailDto, 'image'>;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.LensDetailWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  lens_detail_id: string;
  updateLensDetailDto: Omit<UpdateLensDetailDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  lens_detail_id: string;
}

interface ICount {
  filters?: Prisma.LensDetailWhereInput;
}
interface IFindByLensId extends IWithTransactionClient {
  lens_id: string;
  lens_detail_id?: string;
}

@Injectable()
export class LensDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLensId({ lens_id, prisma, lens_detail_id }: IFindByLensId) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.lensDetail.findUnique({
      where: { lens_id, ...(lens_detail_id && { id: lens_detail_id }) },
    });
  }

  async doesExist(id: string) {
    return await this.prisma.lensDetail.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({
    createLensDetailDto,
    user_id,
    prisma = this.prisma,
  }: ICreate) {
    const { lens_feature_id, ...rest } = createLensDetailDto;
    return await prisma.lensDetail.create({
      data: {
        ...rest,
        user: {
          connect: { id: user_id },
        },
        lens_feature: { connect: { id: lens_feature_id } },
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const lensDetails = await this.prisma.lensDetail.findMany({
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
        lens_feature: {
          select: {
            title: true,
          },
        },
        image: { select: this.prisma.getFileSelection() },
      },
    });
    return lensDetails;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.lensDetail.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({ lens_detail_id, updateLensDetailDto, prisma }: IUpdate) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.lensDetail.update({
      where: {
        id: lens_detail_id,
      },
      data: updateLensDetailDto
    });
  }

  async delete({ lens_detail_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.lensDetail.delete({
      where: { id: lens_detail_id },
    });
  }
}
