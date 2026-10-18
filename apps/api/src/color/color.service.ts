import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}

  async doesExist(id: string) {
    return await this.prisma.color.findUnique({ where: { id } });
  }

  async isDuplicate(color: string, id?: string) {
    return await this.prisma.color.findFirst({
      where: {
        ...(id && { id: { not: id } }),
        color,
      },
    });
  }

  async create(user_id: string, createColorDto: CreateColorDto) {
    return await this.prisma.color.create({
      data: { ...createColorDto, user: { connect: { id: user_id } } },
    });
  }

  async findAll() {
    return await this.prisma.color.findMany();
  }

  async update(color_id: string, updateColorDto: UpdateColorDto) {
    return await this.prisma.color.update({
      where: { id: color_id },
      data: updateColorDto,
    });
  }

  async count() {
    return await this.prisma.color.count();
  }

  async hasRecord(color_id: string) {
    const record = await this.prisma.productColor.findFirst({
      where: { color_ids: { hasSome: [color_id] } },
    });
    return !!record;
  }

  async remove(color_id: string) {
    return await this.prisma.color.delete({ where: { id: color_id } });
  }
}
