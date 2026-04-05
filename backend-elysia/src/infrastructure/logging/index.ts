export type { ILogger } from "./logger.interface.ts";
export { PinoLogger } from "./pino-logger.ts";
export { createLogger } from "./logger-factory.ts";
export type { LoggerConfig } from "./logger-factory.ts";

// Default logger instance
import { createLogger } from "./logger-factory.ts";
export const logger = createLogger();