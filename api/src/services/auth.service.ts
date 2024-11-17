import { authRepo } from '@/repository/auth.repository';
import { usersService } from '@/repository/users.repository';

class AuthService {
  constructor() {}
  async loginHandler({ jwt, refreshJwt, body, set, cookie }: any) {
    const user = await usersService.verifyUserByUsername(body.username);

    if (!user.id) {
      throw new Error('User not found');
    }

    const accessToken = await jwt.sign(user);
    const refreshToken = await refreshJwt.sign(user);

    const tokenAdded = await authRepo.addRefreshToken(user.id, refreshToken);
    if (!tokenAdded) {
      throw new Error('Failed to add refresh token');
    }

    set.status = 201;

    return {
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }

  async updateAccessToken({
    jwt,
    refreshJwt,
    body: { refresh_token },
    set,
  }: any) {
    await authRepo.verifyRefreshToken(refresh_token);

    const tokenPayload = await refreshJwt.verify(refresh_token);
    const accessToken = await jwt.sign(tokenPayload);

    set.status = 200;
    return {
      message: 'Access token successfully updated',
      data: {
        access_token: accessToken,
      },
    };
  }

  async removeAuthentications({
    refreshJwt,
    body: { refresh_token },
    set,
  }: any) {
    await authRepo.verifyRefreshToken(refresh_token);

    await refreshJwt.verify(refresh_token);

    set.status = 200;
    return {
      message: 'Refresh token has been successfully deleted',
    };
  }

  async updatePassword(body: any) {
    console.log('🚀 ~ AuthController ~ updatePassword ~ body:', body);
    // await usersService.updatePassword(id, password);

    return {
      message: 'Password has been successfully updated',
    };
  }
}

export const authService = new AuthService();
