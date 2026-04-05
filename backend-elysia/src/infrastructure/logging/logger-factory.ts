import type { ILogger } from "./logger.interface.ts";
import { PinoLogger } from "./pino-logger.ts";

export interface LoggerConfig {
  level?: string;
  environment?: string;
}

export function createLogger(config: LoggerConfig = {}): ILogger {
  const environment = config.environment ?? process.env.NODE_ENV ?? "development";
  const level = config.level ?? (environment === "test" ? "silent" : "info");

  return new PinoLogger({ level, environment });
}