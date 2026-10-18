import { Injectable } from '@nestjs/common';
import { AddColorDto } from './dto/add-color.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../../prisma/prisma.service';
import { UpdateProductColorDto } from './dto/update.dto';

interface IUpdateProductColor extends IWithTransactionClient {
  data: UpdateProductColorDto;
  product_color_id: string;
}
interface IisDuplicateModelNumber {
  product_color_id: string;
  model_number: string;
}
interface IRemove extends IWithTransactionClient {
  product_color_id: string;
}

@Injectable()
export class ProductColorService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductColor(product_color_id: string) {
    return await this.prisma.productColor.findUnique({
      where: { id: product_color_id },
      include: {
        product: true,
        colors: true,
        images: {
          where: {
            fieldname: 'thumbnail',
          },
          select: this.prisma.getFileSelection(),
        },
      },
    });
  }

  async addProductColor(productId: string, addColorDto: AddColorDto) {
    const { color_ids, ...rest } = addColorDto;
    return await this.prisma.productColor.create({
      data: {
        ...rest,
        product: {
          connect: {
            id: productId,
          },
        },
        colors: {
          connect: color_ids?.map((color_id) => ({
            id: color_id,
          })),
        },
      },
    });
  }

  async getProductColorImages(productColorId: string) {
    return await this.prisma.file.findMany({
      where: {
        product_color_id: productColorId,
      },
    });
  }

  async getProductColorFilesToSave(file_ids: string[]) {
    return await this.prisma.file.findMany({
      where: {
        id: {
          in: file_ids,
        },
        is_temp: true,
      },
    });
  }

  async updateProductColor({
    data,
    product_color_id,
    prisma = this.prisma,
  }: IUpdateProductColor) {
    const { color_ids, ...rest } = data;
    return await prisma.productColor.update({
      where: { id: product_color_id },
      data: {
        ...rest,
        ...(color_ids && {
          colors: {
            set: [],
            connect: color_ids?.map((color_id) => ({
              id: color_id,
            })),
          },
        }),
      },
    });
  }

  async isDuplicateModelNumber({
    model_number,
    product_color_id,
  }: IisDuplicateModelNumber) {
    return await this.prisma.productColor.findFirst({
      where: {
        id: {
          not: product_color_id,
        },
        model_number,
      },
    });
  }

  async remove({ product_color_id, prisma = this.prisma }: IRemove) {
    return await prisma.productColor.delete({
      where: { id: product_color_id },
      select: { id: true, images: { select: this.prisma.getFileSelection() } },
    });
  }
}
