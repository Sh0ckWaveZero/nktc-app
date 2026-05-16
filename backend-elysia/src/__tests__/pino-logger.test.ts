import { describe, it, expect, mock } from "bun:test";

// Prevent pino-pretty in tests
process.env.NODE_ENV = "test";

// Mock pino so we can capture calls
const mockInfo = mock();
const mockWarn = mock();
const mockError = mock();
const mockDebug = mock();
const mockPinoInstance = { info: mockInfo, warn: mockWarn, error: mockError, debug: mockDebug };

mock.module("pino", () => ({
  default: () => mockPinoInstance,
}));

const { PinoLogger } = await import("@/infrastructure/logging/pino-logger");

const logger = new PinoLogger({ level: "silent", environment: "test" });

describe("PinoLogger", () => {
  it("info without metadata calls logger.info(message)", () => {
    mockInfo.mockReset();
    logger.info("hello");
    expect(mockInfo).toHaveBeenCalledWith("hello");
  });

  it("info with metadata calls logger.info(metadata, message)", () => {
    mockInfo.mockReset();
    logger.info("hello", { key: "val" });
    expect(mockInfo).toHaveBeenCalledWith({ key: "val" }, "hello");
  });

  it("warn without metadata calls logger.warn(message)", () => {
    mockWarn.mockReset();
    logger.warn("warn msg");
    expect(mockWarn).toHaveBeenCalledWith("warn msg");
  });

  it("warn with metadata calls logger.warn(metadata, message)", () => {
    mockWarn.mockReset();
    logger.warn("warn msg", { code: 1 });
    expect(mockWarn).toHaveBeenCalledWith({ code: 1 }, "warn msg");
  });

  it("error without metadata calls logger.error(message)", () => {
    mockError.mockReset();
    logger.error("err msg");
    expect(mockError).toHaveBeenCalledWith("err msg");
  });

  it("error with metadata calls logger.error(metadata, message)", () => {
    mockError.mockReset();
    logger.error("err msg", { stack: "trace" });
    expect(mockError).toHaveBeenCalledWith({ stack: "trace" }, "err msg");
  });

  it("debug without metadata calls logger.debug(message)", () => {
    mockDebug.mockReset();
    logger.debug("dbg msg");
    expect(mockDebug).toHaveBeenCalledWith("dbg msg");
  });

  it("debug with metadata calls logger.debug(metadata, message)", () => {
    mockDebug.mockReset();
    logger.debug("dbg msg", { x: 1 });
    expect(mockDebug).toHaveBeenCalledWith({ x: 1 }, "dbg msg");
  });
});
