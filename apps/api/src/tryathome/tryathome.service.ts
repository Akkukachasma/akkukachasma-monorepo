import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurposeDto } from './dto/create-purpose.dto';
import { UpdatePurposeDto } from './dto/update-purpose.dto';
import { CreateTryAtHomeDto } from './dto/create-tryathome.dto';
import { GetTryAtHomeDto } from './dto/get-tryathome.dto';
import { Prisma } from '@prisma/client';
import { ICreateRequest, IListRequests } from './types';

@Injectable()
export class TryAtHomeService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin: Create a new purpose
  async createPurpose(dto: CreatePurposeDto) {
    return await this.prisma.tryAtHomePurpose.create({ data: dto });
  }

  // Admin: List all purposes
  async listPurposes() {
    return await this.prisma.tryAtHomePurpose.findMany();
  }

  // Admin: Update a purpose
  async updatePurpose(id: string, dto: UpdatePurposeDto) {
    return await this.prisma.tryAtHomePurpose.update({ where: { id }, data: dto });
  }

  // Admin: Remove a purpose
  async removePurpose(id: string) {
    return await this.prisma.tryAtHomePurpose.delete({ where: { id } });
  }

  // Admin: List all tryathome requests (with filters)
  async listRequests({filters, page, page_size, sort_by}: IListRequests) {
    return await this.prisma.tryAtHome.findMany({
      where: filters,
      take: page_size,
      skip: (page - 1) * page_size,
      orderBy: (() => {
        switch (sort_by) {
          case 'created_asc':
            return [{ created_at: 'asc' }];
          case 'created_desc':
            return [{ created_at: 'desc' }];
          case 'name_asc':
            return [{ name: 'asc' }];
          case 'name_desc':
            return [{ name: 'desc' }];
          case 'recently_updated':
            return [{ updated_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
      include: {
        address: true,
        purpose: true,
      }
    });
  }

  async count(filters: Prisma.TryAtHomeWhereInput){
    return await this.prisma.tryAtHome.count({ where: filters });
  }

  // Admin: Remove a tryathome request
  async removeRequest(id: string) {
    return await this.prisma.tryAtHome.delete({ where: { id } });
  }

  // Public: Create a tryathome request
  async createRequest({data, address_id, prisma = this.prisma}: ICreateRequest) {
    const {purpose_id, zip_code, ...rest} = data;
    return await prisma.tryAtHome.create({
      data: {
        ...rest,
        address: { connect: { id: address_id } },
        purpose: {
          connect: {id: purpose_id}
        }
      },
    });
  }
} 