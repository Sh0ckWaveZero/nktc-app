
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt'
import configuration from '../../config/configuration';
import { createByAdmin } from '../../utils/utils';

export const userAdmin = async () => {
  const admin = createByAdmin();
  const username = configuration().userAdmin;
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