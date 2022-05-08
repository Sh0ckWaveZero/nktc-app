import { errorHandler, jwtMiddleware } from '../../helpers/api';

export const apiHandler = (handler: any) => {
  return async (req: any, res: any) => {
    try {
      // global middleware
      await jwtMiddleware(req, res);

      // route handler
      await handler(req, res);
    } catch (err) {
      // global error handler
      errorHandler(err, res);
    }
  }
}