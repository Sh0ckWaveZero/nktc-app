import { authenticationsService } from '@/services/authentications.service';
import { usersService } from '@/services/users.service';

class AuthController {
  constructor() {}
  async createAuthentication({ jwt, refreshJwt, body, set }: any) {
    const user = await usersService.verifyUserByUsername(body.username);

    if (!user.id) {
      throw new Error('User not found');
    }

    const accessToken = await jwt.sign(user);
    const refreshToken = await refreshJwt.sign(user);

    const tokenAdded = await authenticationsService.addRefreshToken(
      user.id,
      refreshToken,
    );
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
    await authenticationsService.verifyRefreshToken(refresh_token);

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
    await authenticationsService.verifyRefreshToken(refresh_token);

    await refreshJwt.verify(refresh_token);

    set.status = 200;
    return {
      message: 'Refresh token has been successfully deleted',
    };
  }
}

export const authController = new AuthController();
