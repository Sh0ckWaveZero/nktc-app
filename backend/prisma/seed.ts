import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";


const prisma = new PrismaClient();

const main = async () => {

  console.log("Seeding...");

  const user1 = await prisma.user.create({
    data: {
      username: "user1",
      password: await hash("user1", 12),
      email: "",
      role: "Student",
      account: {
        create: {
          firstName: "",
          lastName: "",
          firstNameEn: "",
          lastNameEn: "",
          idCard: "",
          bloodType: "A",
          birthDate: new Date(),
          phone: "",
        }
      }
    }
  });

  console.log({ user1 });
}


main()
  .catch((err: any) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });