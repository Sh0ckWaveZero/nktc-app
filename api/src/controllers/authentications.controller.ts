
import { authenticationsService } from '@/services/authentications.service';
import { usersService } from '@/services/users.service';


class AuthenticationsController {
  constructor(

  ) { }
  async postAuthentications({ jwt, refreshJwt, body, set }: any) {
    const userId = await usersService.verifyUserByUsername(body.username);
    if (!userId) {
      throw new Error('User not found');
    }

    const access_token = await jwt.sign(userId);
    const refresh_token = await refreshJwt.sign(userId);

    const tokenAdded = await authenticationsService.addRefreshToken(userId.id, refresh_token);
    if (!tokenAdded) {
      throw new Error('Failed to add refresh token');
    }

    set.status = 201;

    return {
      data: {
        access_token: access_token,
        refresh_token: refresh_token,
      },
    };
  }

  async putAuthentications({ jwt, refreshJwt, body: { refresh_token }, set }: any) {
    await authenticationsService.verifyRefreshToken(refresh_token)

    const tokenPayload = await refreshJwt.verify(refresh_token);
    const access_token = await jwt.sign(tokenPayload);

    set.status = 200;
    return {
      message: "Access token successfully updated",
      data: {
        access_token: access_token,
      },
    };
  }

  async deleteAuthentications({ refreshJwt, body: { refresh_token }, set }: any) {
    await authenticationsService.verifyRefreshToken(refresh_token)

    await refreshJwt.verify(refresh_token);

    set.status = 200;
    return {
      message: "Refresh token has been successfully deleted",
    };
  }
}

export const authenticationController = new AuthenticationsController();