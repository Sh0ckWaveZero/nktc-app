import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from '@/exceptions/invariantError';
import { AuthenticationError } from '@/exceptions/authenticationError';
import { AuthorizationError } from '@/exceptions/authorizationError';

interface loginPayload {
  username: string,
  password: string
}

class UsersService {


  constructor(
    private db = new PrismaClient(),
  ) { }


  async getUsers() {
    return await this.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      }
    });
  }

  async getUserById(id: string) {
    const user = await this.db.user.findFirst({
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
  }

  async deleteUser(id: string) {
    await this.db.user.delete({
      where: {
        id: id,
      },
    });
  }

  async getPasswordByUsername(username: string) {
    const getPassword = await this.db.user.findFirst({
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
  }

  async loginUser(body: loginPayload) {
    const user = await this.db.user.findFirst({
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
  }

  async verifyUserByUsername(username: string) {
    const user = await this.db.user.findFirst({
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
  }

  async verifyUserById(id: string) {
    const user = await this.db.user.findFirst({
      where: {
        username: {
          equals: id,
        },
      },
    });

    if (!user) throw new AuthorizationError("You have no access!")
  }

  async verifyUsernameIsAvailable(username: string) {
    const isAvailable = await this.db.user.findFirst({
      where: {
        username: {
          equals: username
        }
      },
    })

    if (isAvailable) throw new InvariantError('Username already exist!')
  }
}

export const usersService = new UsersService();