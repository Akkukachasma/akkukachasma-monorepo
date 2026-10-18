import { Injectable } from '@nestjs/common';
import {
  IWithTransactionClient,
  PrismaService,
} from '../../prisma/prisma.service';
import { CreateBannerImageDto } from './dto/create-banner-image.dto';
import { UpdateBannerImageDto } from './dto/update-banner.image.dto';
import { BannerOrderDto } from '../dto/update-banner.dto';

interface ICreate extends IWithTransactionClient {
  createBannerImageDto: Omit<CreateBannerImageDto, 'image'>;
  banner_id: string;
}

interface IUpdate extends IWithTransactionClient {
  banner_image_id: string;
  updateBannerImageDto: Omit<UpdateBannerImageDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  banner_image_id: string;
}

@Injectable()
export class BannerImageService {
  constructor(private readonly prisma: PrismaService) {}

  async updateOrder(orders: BannerOrderDto[]) {
    if (!orders.length) return [];
    return await this.prisma.$transaction(
      async (prisma) => {
        const updatePromises = orders.map(({ id, order }) =>
          prisma.bannerImage.update({
            where: { id },
            data: { order },
          }),
        );
        return Promise.all(updatePromises);
      },
      { maxWait: 40000, timeout: 60000 },
    );
  }

  async doesExist(id: string) {
    return await this.prisma.bannerImage.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async findByBannerId(banner_id: string) {
    return await this.prisma.bannerImage.findMany({
      where: { banner_id },
      orderBy: { order: 'asc' },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({
    createBannerImageDto,
    banner_id,
    prisma = this.prisma,
  }: ICreate) {
    const maxOrderBannerImage = await prisma.bannerImage.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (maxOrderBannerImage?.order ?? 0) + 1;

    return await prisma.bannerImage.create({
      data: {
        ...createBannerImageDto,
        order: nextOrder,
        banner: {
          connect: { id: banner_id },
        },
      },
    });
  }

  async update({
    banner_image_id,
    updateBannerImageDto,
    prisma = this.prisma,
  }: IUpdate) {
    return await prisma.bannerImage.update({
      where: {
        id: banner_image_id,
      },
      data: updateBannerImageDto,
    });
  }

  async delete({ banner_image_id, prisma = this.prisma }: IDelete) {
    return await prisma.bannerImage.delete({
      where: { id: banner_image_id },
    });
  }
}
