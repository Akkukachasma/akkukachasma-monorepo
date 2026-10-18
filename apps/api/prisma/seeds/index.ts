import { PrismaClient } from '@prisma/client';
import { upsertPermissions } from './upsert-permissions';
import { upsertSystemRoles } from './upsert-system-roles';
import { upsertAdmin } from './upsert-admin';

const prisma = new PrismaClient();

async function main() {
  await upsertPermissions(prisma);
  await upsertSystemRoles(prisma);
  await upsertAdmin(prisma);
}

main()
  .then(() => {
    console.log('Seeds completed.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
