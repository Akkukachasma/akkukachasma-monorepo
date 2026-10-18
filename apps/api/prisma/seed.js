// eslint-disable-next-line
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const createSuperUser = async () => {
  const exist = await prisma.user.findUnique({
    where: { email: 'admin@akkukachasma.com' },
  });
  if (!exist) {
    const user = await prisma.user.create({
      data: {
        email: 'admin@akkukachasma.com',
        agree_t_and_c: true,
        name: 'Admin',
        type: 'admin',
        credentials: {
          create: {
            password: bcrypt.hashSync('Admin@123', 10),
          },
        },
      },
    });
    console.log('created super user', user);
  } else {
    console.log('super user already exist.');
  }
};

const main = async () => {
  await createSuperUser();
  process.exit(0);
};

try {
  main();
} catch (error) {
  // eslint-disable-next-line
  console.log(error);
  process.exit(1);
} finally {
  prisma.$disconnect();
}
