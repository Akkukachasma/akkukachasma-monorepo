import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { CreateLensFeatureDto } from './dto/create-lens-feature.dto';
import { UpdateLensFeatureDto } from './dto/update-lens-feature.dto';

interface ICreate extends IWithTransactionClient {
  createLensFeatureDto: CreateLensFeatureDto;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.LensFeatureWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  lens_feature_id: string;
  updateLensFeatureDto: Omit<UpdateLensFeatureDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  lens_feature_id: string;
}

interface ICount {
  filters?: Prisma.LensFeatureWhereInput;
}

@Injectable()
export class LensFeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async doesExist(id: string) {
    return await this.prisma.lensFeature.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({
    createLensFeatureDto,
    user_id,
    prisma = this.prisma,
  }: ICreate) {
    const { power_type_id, image, ...rest } = createLensFeatureDto;
    return await prisma.lensFeature.create({
      data: {
        ...rest,
        user: {
          connect: { id: user_id },
        },
        power_type: { connect: { id: power_type_id } },
        ...(image && {
          image: {
            update: { is_temp: false },
            connect: { id: image },
          },
        }),
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const lensFeatures = await this.prisma.lensFeature.findMany({
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
        _count: { select: { lens_details: true } },
        power_type: { select: { title: true } },
        image: { select: this.prisma.getFileSelection() },
      },
    });
    return lensFeatures;
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.lensFeature.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({
    lens_feature_id,
    updateLensFeatureDto,
    prisma = this.prisma,
  }: IUpdate) {
    return await prisma.lensFeature.update({
      where: {
        id: lens_feature_id,
      },
      data: updateLensFeatureDto,
    });
  }

  async delete({ lens_feature_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.lensFeature.delete({
      where: { id: lens_feature_id },
    });
  }
}
