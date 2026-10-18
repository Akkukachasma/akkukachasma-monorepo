import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrescriptionType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { ICreatePrescription } from './types';
import { CreatePrescriptionDto } from './dto/create.dto';
import { UpdatePrescriptionDto } from './dto/update.dto';

const FILLUP_FIELDS = [
  'right_sph',
  'right_cyl',
  'right_axis',
  'right_add',
  'left_sph',
  'left_cyl',
  'left_axis',
  'left_add',
] as const;

@Injectable()
export class PrescriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async findAllForUser(user_id: string) {
    return this.prisma.prescription.findMany({
      where: { user_id },
      orderBy: { updated_at: 'desc' },
      include: { image: true },
    });
  }

  async findOneForUser(
    id: string,
    user_id: string,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const row = await prisma.prescription.findFirst({
      where: { id, user_id },
      include: { image: true },
    });
    if (!row) {
      throw new NotFoundException('Prescription not found');
    }
    return row;
  }

  async createPrescription({
    createPrescriptionDto,
    user_id,
    prisma = this.prisma,
  }: ICreatePrescription) {
    const prescription = await prisma.prescription.create({
      data: {
        ...createPrescriptionDto,
        user: { connect: { id: user_id } },
      },
    });
    return prescription;
  }

  private assertFillupComplete(dto: CreatePrescriptionDto | UpdatePrescriptionDto) {
    for (const key of FILLUP_FIELDS) {
      const v = dto[key];
      if (v === undefined || v === null || String(v).trim() === '') {
        throw new BadRequestException(`Missing or empty field: ${key}`);
      }
    }
  }

  async createForUser(user_id: string, dto: CreatePrescriptionDto) {
    if (dto.type === PrescriptionType.fillup) {
      this.assertFillupComplete(dto);
    } else if (dto.type === PrescriptionType.photo) {
      if (!dto.image) {
        throw new BadRequestException('Image is required for photo prescription');
      }
    }

    const { image, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      const prescription = await this.createPrescription({
        user_id,
        createPrescriptionDto: rest,
        prisma: tx,
      });
      if (dto.type === PrescriptionType.photo && image) {
        await this.fileService.update({
          file_id: image,
          data: {
            is_temp: false,
            prescription: { connect: { id: prescription.id } },
          },
          prisma: tx,
        });
      }
      return this.findOneForUser(prescription.id, user_id, tx);
    });
  }

  async updateForUser(id: string, user_id: string, dto: UpdatePrescriptionDto) {
    const existing = await this.prisma.prescription.findFirst({
      where: { id, user_id },
      include: { image: true },
    });
    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    if (dto.type !== undefined && dto.type !== existing.type) {
      throw new BadRequestException(
        'Changing prescription type is not supported. Delete this prescription and create a new one.',
      );
    }

    const nextType = existing.type;

    if (nextType === PrescriptionType.fillup) {
      const merged = { ...this.toFillupPayload(existing), ...dto };
      this.assertFillupComplete(merged as CreatePrescriptionDto);
    }

    if (nextType === PrescriptionType.photo) {
      for (const k of FILLUP_FIELDS) {
        if ((dto as Record<string, unknown>)[k] !== undefined) {
          throw new BadRequestException(
            'Cannot set sphere/cylinder fields on a photo prescription',
          );
        }
      }
    }

    const data = this.buildScalarUpdate(dto, nextType);

    return this.prisma.$transaction(async (tx) => {
      if (nextType === PrescriptionType.photo && dto.image !== undefined) {
        const oldFileId = existing.image?.id;
        if (oldFileId && oldFileId !== dto.image) {
          await tx.file.update({
            where: { id: oldFileId },
            data: { prescription: { disconnect: true } },
          });
        }
        if (dto.image && (!oldFileId || oldFileId !== dto.image)) {
          await this.fileService.update({
            file_id: dto.image,
            data: {
              is_temp: false,
              prescription: { connect: { id } },
            },
            prisma: tx,
          });
        }
      }

      await tx.prescription.update({
        where: { id },
        data,
      });

      return this.findOneForUser(id, user_id, tx);
    });
  }

  private toFillupPayload(
    p: Prisma.PrescriptionGetPayload<{ include: { image: true } }>,
  ): Record<string, string | undefined> {
    const out: Record<string, string | undefined> = {};
    for (const k of FILLUP_FIELDS) {
      out[k] = p[k] ?? undefined;
    }
    return out;
  }

  private buildScalarUpdate(
    dto: UpdatePrescriptionDto,
    nextType: PrescriptionType,
  ): Prisma.PrescriptionUpdateInput {
    const data: Prisma.PrescriptionUpdateInput = {};
    if (dto.comments !== undefined) {
      data.comments = dto.comments;
    }
    if (nextType === PrescriptionType.fillup) {
      for (const key of FILLUP_FIELDS) {
        if (dto[key] !== undefined) {
          (data as Record<string, string | undefined>)[key] = dto[key] as string;
        }
      }
    }
    return data;
  }

  async removeForUser(id: string, user_id: string) {
    const existing = await this.prisma.prescription.findFirst({
      where: { id, user_id },
      include: { image: true },
    });
    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    if (existing.image?.id) {
      await this.fileService.update({
        file_id: existing.image.id,
        data: { prescription: { disconnect: true } },
      });
    }

    await this.prisma.prescription.delete({
      where: { id },
    });

    return existing;
  }
}
