import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from '../exceptions/invariantError';
import { AuthenticationError } from '../exceptions/authenticationError';
import { AuthorizationError } from '../exceptions/authorizationError';

const db = new PrismaClient();
interface loginPayload {
  username: string,
  password: string
}

export const usersService = {
  getUsers: async () => {
    return await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      }
    });
  },
  getUserById: async (id: string) => {
    const user = await db.user.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      }
    });

    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  deleteUser: async (id: string) => {
    await db.user.delete({
      where: {
        id: id,
      },
    });
  },
  getPasswordByUsername: async (username: string) => {
    const getPassword = await db.user.findFirst({
      where: {
        username: {
          equals: username
        }
      },
      select: {
        password: true
      }
    })

    if (!getPassword) throw new InvariantError("Username is not found!")

    return getPassword.password
  },

  loginUser: async (body: loginPayload) => {
    const user = await db.user.findFirst({
      where: {
        username: {
          equals: body.username,
        },
        password: {
          equals: body.password
        }
      },
      select: {
        id: true
      }
    })


    if (!user) throw new AuthenticationError("Username or password is wrong!")
    return user
  },

  verifyUserByUsername: async (username: string) => {
    const user = await db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new AuthenticationError("Username or password is wrong!")

    return user;
  },

  verifyUserById: async (id: string) => {
    const user = await db.user.findFirst({
      where: {
        username: {
          equals: id,
        },
      },
    });

    if (!user) throw new AuthorizationError("You have no access!")
  },

  verifyUsernameIsAvailable: async (username: string) => {
    const isAvailable = await db.user.findFirst({
      where: {
        username: {
          equals: username
        }
      },
    })

    if (isAvailable) throw new InvariantError('Username already exist!')
  }
};