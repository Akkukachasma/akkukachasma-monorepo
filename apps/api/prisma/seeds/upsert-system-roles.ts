import type { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

type RoleEntry = {
  name?: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  permissions: string[];
};

export async function upsertSystemRoles(prisma: PrismaClient): Promise<void> {
  const filePath = path.join(__dirname, 'system-roles.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as Record<string, RoleEntry>;

  for (const [code, entry] of Object.entries(data)) {
    const role = await prisma.role.upsert({
      where: { code },
      create: {
        code,
        name: entry.name ?? code,
        description: entry.description ?? undefined,
        is_system_role: entry.is_system_role ?? true,
        is_active: entry.is_active ?? true,
      },
      update: {
        name: entry.name ?? code,
        description: entry.description ?? undefined,
        is_active: entry.is_active ?? true,
      },
    });

    let permissionIds: string[] = [];
    if (entry.permissions?.length === 1 && entry.permissions[0] === '*') {
      const all = await prisma.permission.findMany({ select: { id: true } });
      permissionIds = all.map((p) => p.id);
    } else {
      for (const permCode of entry.permissions ?? []) {
        const perm = await prisma.permission.findUnique({ where: { code: permCode } });
        if (perm) permissionIds.push(perm.id);
      }
    }

    const existing = await prisma.rolePermission.findMany({
      where: { role_id: role.id },
      select: { permission_id: true },
    });
    const existingSet = new Set(existing.map((r) => r.permission_id));

    for (const permissionId of permissionIds) {
      if (existingSet.has(permissionId)) continue;
      await prisma.rolePermission.create({
        data: { role_id: role.id, permission_id: permissionId },
      });
    }
  }
  console.log('System roles upserted:', Object.keys(data).length);
}
