import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPermissions() {
    const list = await this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
      select: { id: true, code: true, name: true, description: true },
    });
    return list;
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: [{ is_system_role: 'desc' }, { code: 'asc' }],
      include: {
        role_permissions: {
          include: { permission: { select: { id: true, code: true, name: true } } },
        },
        _count: { select: { user_roles: true } },
      },
    });
    return roles.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      is_system_role: r.is_system_role,
      is_active: r.is_active,
      permissions: r.role_permissions.map((rp) => rp.permission),
      users_count: r._count.user_roles,
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: { permission: true },
        },
        _count: { select: { user_roles: true } },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      is_system_role: role.is_system_role,
      is_active: role.is_active,
      permissions: role.role_permissions.map((rp) => rp.permission),
      users_count: role._count.user_roles,
    };
  }

  async create(dto: CreateRoleDto) {
    const baseCode = slugify(dto.name) || 'role';
    let code = baseCode;
    let suffix = 0;
    while (await this.prisma.role.findUnique({ where: { code } })) {
      suffix += 1;
      code = `${baseCode}-${suffix}`;
    }

    const validPermissionIds = await this.prisma.permission.findMany({
      where: { id: { in: dto.permission_ids } },
      select: { id: true },
    });
    const ids = validPermissionIds.map((p) => p.id);

    const role = await this.prisma.role.create({
      data: {
        code,
        name: dto.name,
        description: dto.description ?? null,
        is_system_role: false,
        is_active: true,
        role_permissions: {
          create: ids.map((permission_id) => ({ permission_id })),
        },
      },
      include: {
        role_permissions: {
          include: { permission: { select: { id: true, code: true, name: true } } },
        },
        _count: { select: { user_roles: true } },
      },
    });
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      is_system_role: role.is_system_role,
      is_active: role.is_active,
      permissions: role.role_permissions.map((rp) => rp.permission),
      users_count: role._count.user_roles,
    };
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.is_system_role) {
      throw new ForbiddenException('System roles cannot be updated');
    }

    const updateData: { name?: string; description?: string; is_active?: boolean } = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;

    if (dto.permission_ids !== undefined) {
      const validIds = await this.prisma.permission.findMany({
        where: { id: { in: dto.permission_ids } },
        select: { id: true },
      });
      const permissionIds = validIds.map((p) => p.id);
      await this.prisma.rolePermission.deleteMany({ where: { role_id: id } });
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permission_id) => ({ role_id: id, permission_id })),
      });
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        role_permissions: {
          include: { permission: { select: { id: true, code: true, name: true } } },
        },
        _count: { select: { user_roles: true } },
      },
    });
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      is_system_role: updated.is_system_role,
      is_active: updated.is_active,
      permissions: updated.role_permissions.map((rp) => rp.permission),
      users_count: updated._count.user_roles,
    };
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { user_roles: true } } },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.is_system_role) {
      throw new ForbiddenException('System roles cannot be deleted');
    }
    if (role._count.user_roles > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users. Unassign users first.',
      );
    }
    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }
}
