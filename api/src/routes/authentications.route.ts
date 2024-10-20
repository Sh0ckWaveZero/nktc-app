import { authenticationController } from '@/controllers/authentications.controller';

export function initializeAuthRoutes(app: any) {
  return app
    .post('/login', authenticationController.createAuthentication)
    .put('/', authenticationController.updateAccessToken);
}
