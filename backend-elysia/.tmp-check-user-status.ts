import { prisma } from "./src/libs/prisma";

const user = await prisma.user.findUnique({
  where: { username: "test99" },
  select: { username: true, role: true, status: true },
});

console.log(JSON.stringify(user));
await prisma.$disconnect();
