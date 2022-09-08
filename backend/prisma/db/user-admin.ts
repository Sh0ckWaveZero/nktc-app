
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt'
import configuration from '../../src/config/configuration';
import { createByAdmin } from './utils';

export const userAdmin = async () => {
  const admin = createByAdmin();
  const username = configuration().userAdmin;
  console.log("🚀 ~ file: user-admin.ts ~ line 10 ~ userAdmin ~ username", username)
  const password = await hash(configuration().userPassword, 12);

  const userAdmin = Prisma.validator<Prisma.UserCreateInput>()(
    {
      username,
      password,
      role: "Admin",
      account: {
        create: {
          firstName: 'แอดมิน',
          lastName: 'มัดหมี่',
          ...admin,
        }
      },
      ...admin,
    },
  );

  return userAdmin;
}