import type { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

type PermissionEntry = { name?: string; description?: string };

export async function upsertPermissions(prisma: PrismaClient): Promise<void> {
  const filePath = path.join(__dirname, 'permissions.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as Record<string, PermissionEntry>;

  for (const [code, entry] of Object.entries(data)) {
    await prisma.permission.upsert({
      where: { code },
      create: {
        code,
        name: entry.name ?? code,
        description: entry.description ?? undefined,
      },
      update: {
        name: entry.name ?? code,
        description: entry.description ?? undefined,
      },
    });
  }
  console.log('Permissions upserted:', Object.keys(data).length);
}
