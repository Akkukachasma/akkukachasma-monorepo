import type { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@akkukachasma.com';
const ADMIN_DEFAULT_PASSWORD = 'Admin@123';

export async function upsertAdmin(prisma: PrismaClient): Promise<void> {
  const adminRole = await prisma.role.findUnique({
    where: { code: 'admin' },
  });
  if (!adminRole) {
    console.warn('Admin role not found. Run upsert-system-roles first.');
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: { user_roles: { include: { role: true } } },
  });

  if (existing) {
    const hasAdminRole = existing.user_roles?.some((ur) => ur.role?.code === 'admin');
    if (!hasAdminRole) {
      await prisma.userRole.create({
        data: { user_id: existing.id, role_id: adminRole.id },
      });
      console.log('Admin role assigned to existing user:', ADMIN_EMAIL);
    } else {
      console.log('Admin user already exists with admin role:', ADMIN_EMAIL);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: 'Admin',
      agree_t_and_c: true,
      credentials: {
        create: { password: hashedPassword },
      },
      user_roles: {
        create: { role_id: adminRole.id },
      },
    },
  });
  console.log('Admin user created:', user.email);
}
