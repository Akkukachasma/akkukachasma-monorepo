import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Canonical E.164-style storage without +: e.g. 919876543210 */
function normalizeIndianWhatsAppNumber(raw: string): string {
  const trimmed = raw.trim().replace(/[\s-]/g, '');
  let digits = trimmed.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = '91' + digits;
  } else if (digits.length >= 12 && digits.startsWith('91')) {
    digits = digits.slice(0, 12);
  }

  if (!/^91[6-9]\d{9}$/.test(digits)) {
    throw new BadRequestException(
      'Please enter a valid Indian mobile number (10 digits, starting with 6–9).',
    );
  }

  return digits;
}

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(rawNumber: string) {
    const number = normalizeIndianWhatsAppNumber(rawNumber);

    const existing = await this.prisma.newsletter.findUnique({
      where: { number },
    });
    if (existing) {
      throw new ConflictException('This number is already subscribed.');
    }

    return this.prisma.newsletter.create({
      data: { number },
    });
  }

  async findAll({
    page,
    page_size,
    filters,
    sort_by,
  }: {
    page: number;
    page_size: number;
    filters?: Prisma.NewsletterWhereInput;
    sort_by?: string;
  }) {
    return this.prisma.newsletter.findMany({
      skip: (page - 1) * page_size,
      take: page_size,
      where: filters,
      orderBy: (() => {
        switch (sort_by) {
          case 'created_asc':
            return [{ created_at: 'asc' }];
          case 'created_desc':
            return [{ created_at: 'desc' }];
          default:
            return [{ created_at: 'desc' }];
        }
      })(),
    });
  }

  async count(filters?: Prisma.NewsletterWhereInput) {
    return this.prisma.newsletter.count({
      where: filters,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.newsletter.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Subscriber not found.');
    }
    await this.prisma.newsletter.delete({ where: { id } });
  }
}
