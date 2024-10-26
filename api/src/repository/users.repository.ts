import { DbClient } from '@/db';
import { user } from '@/drizzle/schema';
import { AuthenticationError } from '@/exceptions/authenticationError';
import { InvariantError } from '@/exceptions/invariantError';
import { and, eq } from 'drizzle-orm';
import { NotFoundError } from 'elysia';

interface loginPayload {
  username: string;
  password: string;
}

class UserRepository {
  constructor(private db: DbClient) {}

  async getUsers() {
    return await this.db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
      })
      .from(user);
  }

  async getUserById(id: string) {
    const [userInfo] = await this.db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, id))
      .catch((err) => {
        throw new NotFoundError('User not found');
      });

    return userInfo;
  }

  async deleteUser(id: string) {
    return await this.db.delete(user).where(eq(user.id, id)).returning();
  }

  async getPasswordByUsername(username: string) {
    const [getPassword] = await this.db
      .select({
        password: user.password,
      })
      .from(user)
      .where(eq(user.username, username))
      .catch((err) => {
        throw new InvariantError('Username is not found!');
      });

    return getPassword.password;
  }

  async loginUser(body: loginPayload) {
    const [userInfo] = await this.db
      .select({
        id: user.id,
      })
      .from(user)
      .where(
        and(eq(user.username, body.username), eq(user.password, body.password)),
      )
      .catch((err) => {
        throw new AuthenticationError('Username or password is wrong!');
      });

    console.log('🚀 ~ UsersService ~ loginUser ~ userInfo:', userInfo);

    return userInfo;
  }

  async verifyUserByUsername(username: string) {
    try {
      const [selectedUser] = await this.db
        .select({
          id: user.id,
        })
        .from(user)
        .where(eq(user.username, username))
        .catch((err) => {
          throw new AuthenticationError('❌ User not found!');
        });

      return selectedUser;
    } catch (err) {
      console.error('Error verifying user by username:', err);
      throw new AuthenticationError('Username or password is wrong!');
    }
  }

  async verifyUserById(id: string) {
    const [userInfo] = await this.db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.id, id))
      .catch((err) => {
        throw new AuthenticationError('❌ You have no access!');
      });

    return userInfo;
  }

  async verifyUsernameIsAvailable(username: string) {
    const [isAvailable] = await this.db
      .select({
        username: user.username,
      })
      .from(user)
      .where(eq(user.username, username))
      .catch((err) => {
        throw new InvariantError('❌ Username already exist!');
      });

    return isAvailable;
  }
}

export const usersService = new UserRepository(DbClient);
