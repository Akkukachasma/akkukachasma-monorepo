import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyInfoDto } from './dto/create-company-info.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyInfoDto: CreateCompanyInfoDto, updated_by_id: string, prisma?: Prisma.TransactionClient) {
    const client = prisma || this.prisma;
    return await client.companyInfo.create({
      data: {
        ...createCompanyInfoDto,
        updated_by: {
          connect: { id: updated_by_id },
        },
      },
      include: {
        updated_by: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.companyInfo.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        updated_by: true,
      },
    });
  }

  async findOne(id: string) {
    const companyInfo = await this.prisma.companyInfo.findUnique({
      where: { id },
      include: {
        updated_by: true,
      },
    });

    if (!companyInfo) {
      throw new NotFoundException('Company info not found');
    }

    return companyInfo;
  }

  async findLatest() {
    return await this.prisma.companyInfo.findFirst({
      orderBy: { created_at: 'desc' },
      include: {
        updated_by: true,
      },
    });
  }

  /** Defaults to true so COD remains available until explicitly disabled. */
  async isCodEnabled(): Promise<boolean> {
    const latest = await this.prisma.companyInfo.findFirst({
      orderBy: { created_at: 'desc' },
      select: { cod_enabled: true },
    });
    return latest?.cod_enabled ?? true;
  }

  async update(id: string, updateCompanyInfoDto: UpdateCompanyInfoDto, updated_by_id: string, prisma?: Prisma.TransactionClient) {
    await this.findOne(id);

    const client = prisma || this.prisma;
    return await client.companyInfo.update({
      where: { id },
      data: {
        ...updateCompanyInfoDto,
        updated_by: {
          connect: { id: updated_by_id },
        },
      },
      include: {
        updated_by: true,
      },
    });
  }

  async remove(id: string, prisma?: Prisma.TransactionClient) {
    await this.findOne(id);

    const client = prisma || this.prisma;
    return await client.companyInfo.delete({
      where: { id },
    });
  }
}
