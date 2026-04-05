import { Elysia } from "elysia";
import { logger as appLogger } from "../infrastructure/logging/index.ts";

export const logger = new Elysia()
  .onBeforeHandle(({ request }) => {
    const { method } = request;
    const url = new URL(request.url);
    appLogger.info(`${method} ${url.pathname}`, {
      method,
      path: url.pathname,
      query: url.search,
    });
  })
  .onAfterHandle(({ request, set }) => {
    const { method } = request;
    const url = new URL(request.url);
    appLogger.debug(`${method} ${url.pathname} ${set.status}`, {
      method,
      path: url.pathname,
      status: set.status,
    });
  })
  .onError(({ request, error, code, set }) => {
    const { method } = request;
    const url = new URL(request.url);
    appLogger.error(`${method} ${url.pathname} ${set.status} - ${code}`, {
      method,
      path: url.pathname,
      status: set.status,
      error: error instanceof Error ? error.message : String(error),
      code,
    });
  });