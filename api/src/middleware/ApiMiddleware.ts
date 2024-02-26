export const apiMiddleware = async ({ bearer, set, jwt }: any) => {
  if (!bearer) {
    set.status = 401
    set.headers[
      'WWW-Authenticate'
    ] = `Bearer realm='sign', error="invalid_request"`

    return {
      status: "error",
      message: 'Unauthorized'
    }
  }

  const profile = await jwt.verify(bearer);
  if (!profile) {
    set.status = 401
    set.headers[
      'WWW-Authenticate'
    ] = `Bearer realm='sign', error="invalid_request"`

    return {
      status: "error",
      message: 'Unauthorized'
    }
  }
}