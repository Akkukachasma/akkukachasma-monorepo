import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { BannerOrderDto, UpdateBannerDto } from './dto/update-banner.dto';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { Prisma } from '@prisma/client';

interface ICreate extends IWithTransactionClient {
  createBannerDto: Omit<CreateBannerDto, 'image'>;
}
interface IUpdate extends IWithTransactionClient {
  banner_id: string;
  updateBannerDto: Omit<UpdateBannerDto, 'image'>;
}
interface IDelete extends IWithTransactionClient {
  banner_id: string;
}
interface IFindAll extends PaginateQueryDto {
  filters: Prisma.BannerWhereInput;
}

@Injectable()
export class BannerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ filters, page, page_size }: IFindAll) {
    return await this.prisma.banner.findMany({
      skip: (page - 1) * page_size,
      take: page_size,
      where: {
        ...(filters && filters),
      },
      orderBy: { order: 'asc' },
      include: {
        banner_images: {
          orderBy: { order: 'asc' },
          include: {
            image: {
              select: this.prisma.getFileSelection(),
            },
          },
        },
      },
    });
  }

  async count(filters: Prisma.BannerWhereInput) {
    return await this.prisma.banner.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.banner.findUnique({
      where: { id },
      include: {
        banner_images: {
          orderBy: { order: 'asc' },
          include: { image: { select: this.prisma.getFileSelection() } },
        },
      },
    });
  }

  async create({ createBannerDto, prisma = this.prisma }: ICreate) {
    const { shape_ids, category_ids, ...rest } = createBannerDto;
    const maxOrderBanner = await prisma.banner.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrderBanner?.order ?? 0) + 1;
    return await prisma.banner.create({
      data: {
        ...rest,
        order: nextOrder,
        shapes: {
          connect: shape_ids.map((id) => ({ id })),
        },
        categories: {
          connect: category_ids.map((id) => ({ id })),
        },
      },
    });
  }

  async update({ banner_id, updateBannerDto, prisma = this.prisma }: IUpdate) {
    const { shape_ids, category_ids, ...rest } = updateBannerDto;
    return await prisma.banner.update({
      where: { id: banner_id },
      data: {
        ...rest,
        ...(Array.isArray(shape_ids) && {
          shapes: {
            set: [],
            connect: shape_ids.map((id) => ({ id })),
          },
        }),
        ...(Array.isArray(category_ids) && {
          categories: {
            set: [],
            connect: category_ids.map((id) => ({ id })),
          },
        }),
      },
    });
  }

  async updateOrder(orders: BannerOrderDto[]) {
    if (!orders.length) return [];
    return await this.prisma.$transaction(
      async (prisma) => {
        const updatePromises = orders.map(({ id, order }) =>
          prisma.banner.update({
            where: { id },
            data: { order },
          }),
        );
        return Promise.all(updatePromises);
      },
      { maxWait: 40000, timeout: 60000 },
    );
  }

  async delete({ banner_id, prisma = this.prisma }: IDelete) {
    return await prisma.banner.delete({
      where: { id: banner_id },
      include: {
        banner_images: {
          include: { image: { select: this.prisma.getFileSelection() } },
        },
      },
    });
  }
}
