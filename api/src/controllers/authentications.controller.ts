import { authenticationsService } from '@/services/authentications.service';
import { usersService } from '@/services/users.service';

class AuthenticationsController {
  constructor() {}
  async createAuthentication({ jwt, refreshJwt, body, set }: any) {
    const userId = await usersService.verifyUserByUsername(body.username);
    if (!userId) {
      throw new Error('User not found');
    }

    const accessToken = await jwt.sign(userId);
    const refreshToken = await refreshJwt.sign(userId);

    const tokenAdded = await authenticationsService.addRefreshToken(
      userId.id,
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

export const authenticationController = new AuthenticationsController();
