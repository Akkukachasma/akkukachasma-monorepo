import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';

interface ICreate extends IWithTransactionClient {
  createCategoryDto: Omit<CreateCategoryDto, 'image'>;
  user_id: string;
}

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.CategoryWhereInput;
  sort_by?: string;
}

interface IUpdate extends IWithTransactionClient {
  category_id: string;
  updateCategoryDto: Omit<UpdateCategoryDto, 'image'>;
}

interface IDelete extends IWithTransactionClient {
  category_id: string;
}

interface ICount {
  filters?: Prisma.CategoryWhereInput;
}

interface IReorder extends IWithTransactionClient {
  updates: Array<{ id: string; order: number }>;
}
interface IsDuplicateSlug {
  slug: string;
  category_id?: string;
}

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Backward compatibility:
   * assign order to legacy rows that don't have it yet.
   */
  private async ensureCategoryOrderValues(
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    const rows = (await prisma.category.findMany({
      select: { id: true, order: true } as any,
      orderBy: [{ created_at: 'asc' }],
    } as any)) as Array<{ id: string; order: number | null }>;
    if (!rows.length) return;
    let maxOrder = rows.reduce((m, r) => Math.max(m, r.order ?? 0), 0);
    const missing = rows.filter((r) => r.order == null);
    if (!missing.length) return;
    for (const row of missing) {
      maxOrder += 1;
      await prisma.category.update({
        where: { id: row.id },
        data: { order: maxOrder } as any,
      } as any);
    }
  }

  async isDuplicateSlug({ slug, category_id }: IsDuplicateSlug) {
    return await this.prisma.category.count({
      where: {
        slug,
        ...(category_id && { id: { not: category_id } }),
      },
    });
  }

  async doesExist(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async create({ createCategoryDto, user_id, prisma = this.prisma }: ICreate) {
    await this.ensureCategoryOrderValues(prisma);
    const max = (await prisma.category.findFirst({
      select: { order: true } as any,
      orderBy: [{ order: 'desc' }] as any,
    } as any)) as { order?: number | null } | null;
    const nextOrder = Number(max?.order ?? 0) + 1;
    return await prisma.category.create({
      data: {
        ...createCategoryDto,
        keywords: createCategoryDto.keywords ?? [],
        order: nextOrder as any,
        user: {
          connect: { id: user_id },
        },
      } as any,
    } as any);
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    await this.ensureCategoryOrderValues();
    const categrories = await this.prisma.category.findMany({
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
            return [{ order: 'asc' }, { created_at: 'asc' }] as any;
        }
      })(),
      include: {
        image: { select: this.prisma.getFileSelection() },
      },
    });
    return categrories;
  }

  async findOneBySlug(slug: string) {
    return await this.prisma.category.findUnique({
      where: { slug },
      include: { image: { select: this.prisma.getFileSelection() } },
    });
  }

  async count(params?: ICount) {
    const { filters } = params || {};
    return await this.prisma.category.count({
      where: {
        ...(filters && filters),
      },
    });
  }

  async update({
    category_id,
    updateCategoryDto,
    prisma = this.prisma,
  }: IUpdate) {
    return await prisma.category.update({
      where: {
        id: category_id,
      },
      data: updateCategoryDto,
    });
  }

  async delete({ category_id, prisma }: IDelete) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.category.delete({ where: { id: category_id } });
  }

  async reorder({ updates, prisma = this.prisma }: IReorder) {
    await this.ensureCategoryOrderValues(prisma);
    return await this.prisma.$transaction(
      updates.map((u) =>
        prisma.category.update({
          where: { id: u.id },
          data: { order: u.order } as any,
        } as any),
      ),
    );
  }
}
