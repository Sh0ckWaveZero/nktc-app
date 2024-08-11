export const apiMiddleware = async ({ bearer, set, jwt }: any) => {
  const setUnauthorizedResponse = () => {
    set.status = 401;
    set.headers['WWW-Authenticate'] =
      `Bearer realm='sign', error="invalid_request"`;
    return {
      status: 'error',
      message: 'Unauthorized',
    };
  };

  if (!bearer) {
    return setUnauthorizedResponse();
  }

  const profile = await jwt.verify(bearer);
  if (!profile) {
    return setUnauthorizedResponse();
  }
};
