import { t } from 'elysia';
import { usersService } from '../services/users.service';
class UsersHandler {
  async getUsers() {
    const users = await usersService.getUsers();
    return {
      status: "success",
      data: users
    };
  }

  async getUserById({ set, params: { id } }: any) {
    console.log('🚀 ~ UsersHandler ~ getUserById ~ id:', id);
    const user = await usersService.getUserById(id);
    set.status = 200;
    return {
      status: "success",
      data: user
    };
  }

  async deleteUser({ params: { id } }: any) {
    await usersService.deleteUser(id);
    return {
      status: "success",
      message: `User ${id} has been successfully deleted!`
    };
  }

  async loginUser({ jwt, setCookie, body, set }: any) {
    const hashedPassword = await usersService.getPasswordByUsername(body.username);
    const isMatch = await Bun.password.verify(body.password, hashedPassword);

    if (!isMatch) {
      set.status = 401;
      return {
        status: "failed",
        message: `Unauthorized! Invalid username or password.`
      };
    }

    const login = await usersService.loginUser({ username: body.username, password: hashedPassword });

    setCookie("auth", await jwt.sign(login), {
      httpOnly: true,
      maxAge: 4 * 86400,
    });

    set.status = 200;
    return {
      status: "success",
      message: `Sign in successfully!`
    };
  }

  validateCreateUser = t.Object({
    username: t.String(),
    password: t.String(),
    email: t.String(),
  });
}

export const usersHandler = new UsersHandler();