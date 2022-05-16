import type { NextApiRequest, NextApiResponse } from 'next'
import { errorHandler, jwtMiddleware } from '@/helpers/api';

export const apiHandler = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
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