import type { Elysia } from 'elysia';
import { swaggerOptions } from '@/common/constants';
import { swagger } from '@elysiajs/swagger';
import { env } from 'bun';

export const swaggerConfig = () => (app: Elysia) => {
  if (env.NODE_ENV !== 'production') {
    return app.use(
      swagger({
        documentation: {
          info: { ...swaggerOptions.info, version: '1.0.0' },
          servers: [
            {
              url: `http://localhost:${env.PORT}`,
              description: 'Local server',
            },
          ],
          tags: Object.values(swaggerOptions.tags),
          components: {
            securitySchemes: {
              accessToken: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
              refreshToken: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
              apiKey: {
                type: 'apiKey',
                name: 'apiKey',
                in: 'header',
              },
            },
          },
        },
        version: '1.0.0',
        provider: 'scalar',
        scalarConfig: { theme: 'solarized' },
        path: '/docs',
      }),
    );
  }
  return app;
};
