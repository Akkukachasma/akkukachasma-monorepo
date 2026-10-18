import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.ActivityWhereInput;
  sort_by?: string;
}

interface ICount {
  filters?: Prisma.ActivityWhereInput;
}

export type ActivityTypeEnum = 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING' | 'ALERT';

interface ICreate {
  type: ActivityTypeEnum;
  title: string;
  description?: string;
  detail?: Prisma.InputJsonValue;
  user_id?: string;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const activities = await this.prisma.activity.findMany({
      skip: (page - 1) * page_size,
      take: page_size,
      where: filters ?? {},
      orderBy:
        sort_by === 'created_asc'
          ? [{ created_at: 'asc' }]
          : [{ created_at: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return activities;
  }

  async count(params?: ICount) {
    const { filters } = params ?? {};
    return this.prisma.activity.count({
      where: filters ?? {},
    });
  }

  async create({ type, title, description, detail, user_id }: ICreate) {
    return this.prisma.activity.create({
      data: {
        type: type ?? 'INFO',
        title: title ?? 'Activity',
        description: description ?? null,
        detail: (detail ?? {}) as Prisma.InputJsonValue,
        user_id: user_id ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
