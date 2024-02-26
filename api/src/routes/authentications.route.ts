import { Elysia } from 'elysia';
import { authenticationsHandler } from '../handlers/authentications.handler';

export function configureAuthenticationsRoutes(app: any) {
  return app
    .post("/", authenticationsHandler.postAuthentications)
    .put("/", authenticationsHandler.putAuthentications)
}