import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  IWithTransactionClient,
  PrismaService,
} from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  IFindAll,
  IFindAllAvailableCoupon,
  IFindCouponByCode,
  IValidCoupon,
} from './types';
import dayjs from '../../lib/custom-dayjs';

/** Admin date-picker values are calendar days in India. */
const COUPON_TZ = 'Asia/Kolkata';

interface ICount {
  filters?: Prisma.CouponWhereInput;
}

interface IIsDuplicate extends IWithTransactionClient {
  coupon_id?: string;
  name: string;
}

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Availability filter for public offers / apply validation.
   *
   * - `valid_from` / `valid_till` are date-only in Asia/Kolkata; `valid_till` is inclusive of that day.
   * - `quantity` null or 0 = unlimited; `quantity > 0` = remaining pool.
   */
  private availableWhere(
    skip_quantity = false,
    extra?: Prisma.CouponWhereInput,
  ): Prisma.CouponWhereInput {
    const now = dayjs().tz(COUPON_TZ);
    // Date-only fields: treat calendar day in Asia/Kolkata as inclusive.
    // Compare valid_from against endOfToday (not wall-clock now) so UTC-midnight
    // stores for "today" still count as started on that IST calendar day.
    const startOfToday = now.startOf('day').toDate();
    const endOfToday = now.endOf('day').toDate();

    const clauses: Prisma.CouponWhereInput[] = [
      {
        OR: [
          { valid_from: { lte: endOfToday } },
          { valid_from: { equals: null } },
        ],
      },
      {
        OR: [
          { valid_till: { equals: null } },
          { valid_till: { gte: startOfToday } },
        ],
      },
    ];

    if (!skip_quantity) {
      clauses.push({
        OR: [
          { quantity: { gt: 0 } },
          { quantity: { equals: null } },
          { quantity: { equals: 0 } },
        ],
      });
    }

    if (extra && Object.keys(extra).length > 0) {
      clauses.push(extra);
    }

    return { AND: clauses };
  }

  async findCouponByCode({ coupon_code }: IFindCouponByCode) {
    return await this.prisma.coupon.findFirst({
      where: {
        name: { equals: coupon_code, mode: 'insensitive' },
      },
    });
  }

  async create(user_id: string, createCouponDto: CreateCouponDto) {
    try {
      const quantity =
        createCouponDto.quantity === 0 ? null : createCouponDto.quantity;
      return await this.prisma.coupon.create({
        data: {
          ...createCouponDto,
          quantity,
          user: {
            connect: {
              id: user_id,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (isPrismaUniqueError(error)) {
        throw new BadRequestException('Coupon with this name already exists');
      }
      throw new InternalServerErrorException(
        'Something went wrong while creating the coupon',
      );
    }
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    return await this.prisma.coupon.findMany({
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
            return [{ name: 'asc' }];
          case 'name_desc':
            return [{ name: 'desc' }];
          case 'recently_updated':
            return [{ updated_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
    });
  }

  async getAvailableCoupons({
    page,
    page_size,
    filters,
  }: IFindAllAvailableCoupon) {
    const where = this.availableWhere(false, filters);

    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip: (page - 1) * page_size,
        take: page_size,
        where,
        orderBy: [{ created_at: 'desc' }],
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { data, total };
  }

  async count(params?: ICount | Prisma.CouponWhereInput) {
    if (!params) {
      return await this.prisma.coupon.count();
    }
    const where =
      'filters' in params && params.filters !== undefined
        ? params.filters
        : (params as Prisma.CouponWhereInput);
    return await this.prisma.coupon.count({ where });
  }

  async doesExist(coupon_id: string) {
    return await this.prisma.coupon.findUnique({
      where: { id: coupon_id },
    });
  }

  async isDuplicate({ coupon_id, name, prisma }: IIsDuplicate) {
    const PRISMA = prisma || this.prisma;
    return await PRISMA.coupon.findFirst({
      where: {
        name,
        ...(coupon_id && { id: { not: coupon_id } }),
      },
    });
  }

  async update(coupon_id: string, updateCouponDto: UpdateCouponDto) {
    try {
      const data = {
        ...updateCouponDto,
        ...(updateCouponDto.quantity === 0 ? { quantity: null } : {}),
      };
      return await this.prisma.coupon.update({
        where: { id: coupon_id },
        data,
      });
    } catch (error: unknown) {
      if (isPrismaUniqueError(error)) {
        throw new BadRequestException('Coupon with this name already exists');
      }
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  async remove(coupon_id: string) {
    try {
      return await this.prisma.coupon.delete({
        where: { id: coupon_id },
      });
    } catch {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async validCoupon({
    coupon_id,
    coupon_code,
    user_id,
    order_value,
    skip_quantity = false,
    prisma = this.prisma,
  }: IValidCoupon) {
    if (!coupon_id && !coupon_code) return null;

    const coupon = await prisma.coupon.findFirst({
      where: {
        ...(coupon_id && { id: coupon_id }),
        ...(coupon_code && {
          name: { equals: coupon_code, mode: 'insensitive' },
        }),
        ...this.availableWhere(skip_quantity),
        minimum_order: { lte: order_value },
      },
    });

    if (!coupon) {
      return null;
    }

    if (user_id) {
      const usedCoupon = await prisma.couponRedemption.findFirst({
        where: {
          coupon_id: coupon.id,
          user_id,
        },
      });

      if (usedCoupon) {
        return null;
      }
    }

    return coupon;
  }

  /** Atomically reserve one unit from the coupon pool. No-op when unlimited (null/0). */
  async lockQuantity(
    coupon_id: string,
    prisma: any = this.prisma,
  ): Promise<boolean> {
    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (!coupon) return false;
    if (coupon.quantity == null || coupon.quantity === 0) return false;

    const result = await prisma.coupon.updateMany({
      where: { id: coupon_id, quantity: { gt: 0 } },
      data: { quantity: { decrement: 1 } },
    });
    return result.count > 0;
  }

  /** Restore one unit to the coupon pool after a cancelled/expired reservation. */
  async releaseQuantity(
    coupon_id: string,
    prisma: any = this.prisma,
  ): Promise<void> {
    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (!coupon || coupon.quantity == null) return;
    await prisma.coupon.update({
      where: { id: coupon_id },
      data: { quantity: { increment: 1 } },
    });
  }
}
