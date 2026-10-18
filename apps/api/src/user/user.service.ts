import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginateQueryDto } from '../prisma/dto/paginate.dto';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashString } from '../../lib/utils';

const userRolesInclude = {
  user_roles: {
    include: { role: { select: { id: true, code: true, name: true } } },
  },
};

interface IFindAll extends PaginateQueryDto {
  filters?: Prisma.UserWhereInput;
  sort_by?: string;
}
interface ICount {
  filters?: Prisma.UserWhereInput;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  isBlocked(user: any) {
    return !!user.deleted_at;
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id, deleted_at: null },
      include: {
        avatar: { select: this.prisma.getFileSelection() },
        ...userRolesInclude,
      },
    });
  }

  async findAll({ page, page_size, filters, sort_by }: IFindAll) {
    const skip = (page - 1) * page_size;
    const take = page_size;

    return await this.prisma.user.findMany({
      where: filters,
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
      skip,
      take,
      include: {
        avatar: { select: this.prisma.getFileSelection() },
        ...userRolesInclude,
      },
    });
  }

  async count({ filters }: ICount) {
    let whereClause: Prisma.UserWhereInput = filters;

    return await this.prisma.user.count({ where: whereClause });
  }

  async create(dto: CreateUserDto) {
    const { password, role_ids, ...userData } = dto;
    let roleIds = role_ids?.length ? role_ids : null;
    if (!roleIds) {
      const customerRole = await this.prisma.role.findUnique({
        where: { code: 'customer' },
      });
      if (customerRole) roleIds = [customerRole.id];
    }
    const hashedPassword = await hashString(password);
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        credentials: {
          create: { password: hashedPassword },
        },
        ...(roleIds?.length && {
          user_roles: {
            create: roleIds.map((role_id) => ({ role_id })),
          },
        }),
      },
      include: {
        credentials: true,
        ...userRolesInclude,
      },
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const { password, role_ids, ...rest } = dto as UpdateUserDto & { password?: string };
    if (role_ids !== undefined) {
      await this.prisma.userRole.deleteMany({ where: { user_id: id } });
      if (role_ids.length) {
        await this.prisma.userRole.createMany({
          data: role_ids.map((role_id) => ({ user_id: id, role_id })),
        });
      }
    }
    const updateData: Prisma.UserUpdateInput = {};
    const { name, email, phone_number, agree_t_and_c } = rest;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (agree_t_and_c !== undefined) updateData.agree_t_and_c = agree_t_and_c;
    if (password !== undefined) {
      updateData.credentials = {
        update: { password: await hashString(password) },
      };
    }
    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: userRolesInclude,
    });
  }

  async delete(id: string) {
    // Soft delete (block)
    return await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async blockUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async unblockUser(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { deleted_at: null },
    });
  }
}
