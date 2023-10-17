import { PrismaClient } from '@internal/prisma/client';
import { SearchData } from '../../apis/app-bar/db';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding...');

  const appBar = await prisma.appbar.createMany({
    data: SearchData,
  });

  console.log({ appBar });
};

main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
