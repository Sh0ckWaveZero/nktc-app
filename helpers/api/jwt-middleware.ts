import { expressjwt } from 'express-jwt';
import util from 'util';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const jwtMiddleware = (req: any, res: any) => {
  const middleware = expressjwt({ secret: serverRuntimeConfig.secret, algorithms: ['HS256'] }).unless({
    path: [
      // public routes that don't require authentication
      '/api/users/authenticate'
    ]
  });

  return util.promisify(middleware)(req, res);
}

export { jwtMiddleware };