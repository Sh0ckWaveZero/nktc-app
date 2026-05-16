import { describe, it, expect } from "bun:test";
import {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  ValidationError,
  TooManyRequestsError,
} from "@/libs/errors";

describe("AppError", () => {
  it("sets statusCode, errorCode, message", () => {
    const err = new AppError("oops", 400, "BAD");
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe("BAD");
    expect(err.message).toBe("oops");
    expect(err.name).toBe("AppError");
  });

  it("sets errors array when provided", () => {
    const err = new AppError("fail", 422, "VAL", [{ field: "x", message: "bad" }]);
    expect(err.errors).toEqual([{ field: "x", message: "bad" }]);
  });

  it("is instanceof Error", () => {
    expect(new AppError("x", 400)).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("has 404 status and NOT_FOUND code", () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.errorCode).toBe("NOT_FOUND");
  });

  it("accepts custom message", () => {
    expect(new NotFoundError("gone").message).toBe("gone");
  });
});

describe("ConflictError", () => {
  it("has 409 status and CONFLICT code", () => {
    const err = new ConflictError("dup");
    expect(err.statusCode).toBe(409);
    expect(err.errorCode).toBe("CONFLICT");
  });

  it("no errors array when field not provided", () => {
    expect(new ConflictError("dup").errors).toBeUndefined();
  });

  it("sets errors with field when field provided", () => {
    const err = new ConflictError("dup", "email");
    expect(err.errors).toEqual([{ field: "email", message: "dup" }]);
  });
});

describe("UnauthorizedError", () => {
  it("has 401 status and UNAUTHORIZED code", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.errorCode).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("has 403 status and FORBIDDEN code", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.errorCode).toBe("FORBIDDEN");
  });
});

describe("BadRequestError", () => {
  it("has 400 status and BAD_REQUEST code", () => {
    const err = new BadRequestError("bad");
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe("BAD_REQUEST");
  });

  it("no errors array when field not provided", () => {
    expect(new BadRequestError("bad").errors).toBeUndefined();
  });

  it("sets errors with field when field provided", () => {
    const err = new BadRequestError("bad value", "name");
    expect(err.errors).toEqual([{ field: "name", message: "bad value" }]);
  });
});

describe("ValidationError", () => {
  it("has 422 status and VALIDATION_ERROR code", () => {
    const err = new ValidationError([{ field: "x", message: "required" }]);
    expect(err.statusCode).toBe(422);
    expect(err.errorCode).toBe("VALIDATION_ERROR");
    expect(err.errors).toEqual([{ field: "x", message: "required" }]);
  });
});

describe("TooManyRequestsError", () => {
  it("has 429 status and RATE_LIMITED code", () => {
    const err = new TooManyRequestsError();
    expect(err.statusCode).toBe(429);
    expect(err.errorCode).toBe("RATE_LIMITED");
  });

  it("sets retryAfter when provided", () => {
    expect(new TooManyRequestsError("slow down", 30).retryAfter).toBe(30);
  });

  it("retryAfter is undefined when not provided", () => {
    expect(new TooManyRequestsError().retryAfter).toBeUndefined();
  });
});
