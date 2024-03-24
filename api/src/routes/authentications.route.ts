import { authenticationController } from '@/controllers/authentications.controller';

export function configureAuthenticationsRoutes(app: any) {
  return app
    .post("/login", authenticationController.postAuthentications)
    .put("/", authenticationController.putAuthentications)
}