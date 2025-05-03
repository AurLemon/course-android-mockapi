import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: '123456',
        role: 0,
        trueName: '管理员',
        regtime: new Date(),
      },
    });
    console.log('Admin user created');
  }

  const testExists = await prisma.user.findUnique({
    where: { username: 'test' },
  });

  if (!testExists) {
    await prisma.user.create({
      data: {
        username: 'test',
        password: '123456',
        role: 1,
        trueName: '测试用户',
        regtime: new Date(),
      },
    });
    console.log('Test user created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
