import pino from "pino";
import type { ILogger } from "./logger.interface.ts";

export interface PinoLoggerOptions {
  level?: string;
  environment?: string;
}

export class PinoLogger implements ILogger {
  private readonly logger: pino.Logger;

  constructor(options: PinoLoggerOptions = {}) {
    const environment = options.environment ?? process.env.NODE_ENV ?? "development";
    const level = options.level ?? (environment === "test" ? "silent" : "info");

    if (environment === "development") {
      this.logger = pino({
        level,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      });
    } else {
      this.logger = pino({ level });
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    if (metadata !== undefined) {
      this.logger.info(metadata, message);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    if (metadata !== undefined) {
      this.logger.warn(metadata, message);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    if (metadata !== undefined) {
      this.logger.error(metadata, message);
    } else {
      this.logger.error(message);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (metadata !== undefined) {
      this.logger.debug(metadata, message);
    } else {
      this.logger.debug(message);
    }
  }
}