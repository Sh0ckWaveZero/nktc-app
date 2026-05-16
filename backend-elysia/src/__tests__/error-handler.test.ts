import { describe, it, expect, mock } from "bun:test";

const mockLoggerError = mock();

mock.module("@/infrastructure/logging", () => ({
  logger: { info: mock(), warn: mock(), error: mockLoggerError, debug: mock() },
  createLogger: () => ({ info: mock(), warn: mock(), error: mock(), debug: mock() }),
}));

import { Elysia, t } from "elysia";
import { errorHandler } from "@/plugins/error-handler";
import {
  TooManyRequestsError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  AppError,
  ValidationError,
} from "@/libs/errors";

function makePrismaError(code: string) {
  const err = new Error("Prisma error") as any;
  Object.defineProperty(err, "constructor", {
    value: { name: "PrismaClientKnownRequestError" },
    configurable: true,
  });
  err.code = code;
  return err;
}

const app = new Elysia()
  .use(errorHandler)
  .get("/rate-limit-with-retry", () => { throw new TooManyRequestsError("Too many requests", 30); })
  .get("/rate-limit-no-retry", () => { throw new TooManyRequestsError("Too many requests"); })
  .get("/unauthorized", () => { throw new UnauthorizedError(); })
  .get("/forbidden", () => { throw new ForbiddenError(); })
  .get("/not-found", () => { throw new NotFoundError("User not found"); })
  .get("/app-error", () => { throw new AppError("Something failed", 400, "CUSTOM_CODE"); })
  .get("/validation-error", () => {
    throw new ValidationError([{ field: "email", message: "Invalid email" }]);
  })
  .get("/generic-500", () => { throw new Error("unexpected boom"); })
  .get("/prisma-p2002", () => { throw makePrismaError("P2002"); })
  .get("/prisma-p2025", () => { throw makePrismaError("P2025"); })
  .get("/prisma-p9999", () => { throw makePrismaError("P9999"); })
  .post(
    "/typebox-validate",
    ({ body }: { body: { name: string } }) => ({ ok: true, name: body.name }),
    { body: t.Object({ name: t.String() }) },
  );

describe("error-handler: TooManyRequestsError", () => {
  it("returns 429 status", async () => {
    const res = await app.handle(new Request("http://localhost/rate-limit-with-retry"));
    expect(res.status).toBe(429);
  });

  it("includes retryAfter in response body", async () => {
    const res = await app.handle(new Request("http://localhost/rate-limit-with-retry"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.retryAfter).toBe(30);
  });

  it("omits retryAfter when not provided", async () => {
    const res = await app.handle(new Request("http://localhost/rate-limit-no-retry"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.retryAfter).toBeUndefined();
  });

  it("sets errorCode to RATE_LIMITED", async () => {
    const res = await app.handle(new Request("http://localhost/rate-limit-with-retry"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("RATE_LIMITED");
  });
});

describe("error-handler: AppError variants", () => {
  it("UnauthorizedError → 401 + UNAUTHORIZED code", async () => {
    const res = await app.handle(new Request("http://localhost/unauthorized"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(401);
    expect(body.errorCode).toBe("UNAUTHORIZED");
    expect(body.success).toBe(false);
  });

  it("ForbiddenError → 403 + FORBIDDEN code", async () => {
    const res = await app.handle(new Request("http://localhost/forbidden"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(403);
    expect(body.errorCode).toBe("FORBIDDEN");
  });

  it("NotFoundError → 404 with custom message", async () => {
    const res = await app.handle(new Request("http://localhost/not-found"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(404);
    expect(body.message).toBe("User not found");
    expect(body.errorCode).toBe("NOT_FOUND");
  });

  it("AppError with custom code → uses that code", async () => {
    const res = await app.handle(new Request("http://localhost/app-error"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(400);
    expect(body.errorCode).toBe("CUSTOM_CODE");
  });

  it("ValidationError → includes field errors array", async () => {
    const res = await app.handle(new Request("http://localhost/validation-error"));
    const body = await res.json() as Record<string, unknown>;
    expect(res.status).toBe(422);
    const errors = body.errors as Array<{ field: string; message: string }>;
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });
});

describe("error-handler: response shape", () => {
  it("every error response has success: false", async () => {
    for (const path of ["/unauthorized", "/forbidden", "/not-found", "/rate-limit-with-retry"]) {
      const res = await app.handle(new Request(`http://localhost${path}`));
      const body = await res.json() as Record<string, unknown>;
      expect(body.success).toBe(false);
    }
  });

  it("every error response includes meta with timestamp and path", async () => {
    const res = await app.handle(new Request("http://localhost/unauthorized"));
    const body = await res.json() as Record<string, unknown>;
    const meta = body.meta as Record<string, unknown>;
    expect(meta).toBeDefined();
    expect(typeof meta.timestamp).toBe("string");
    expect(meta.path).toBe("/unauthorized");
    expect(meta.method).toBe("GET");
  });
});

describe("error-handler: TypeBox validation (Elysia VALIDATION code)", () => {
  it("returns 422 when body fails TypeBox schema", async () => {
    const res = await app.handle(
      new Request("http://localhost/typebox-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: 123 }),
      }),
    );
    expect(res.status).toBe(422);
  });

  it("response has VALIDATION_ERROR errorCode and errors array", async () => {
    const res = await app.handle(
      new Request("http://localhost/typebox-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: 123 }),
      }),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("VALIDATION_ERROR");
    expect(Array.isArray(body.errors)).toBe(true);
  });
});

describe("error-handler: Prisma known errors", () => {
  it("P2002 → 409 conflict", async () => {
    const res = await app.handle(new Request("http://localhost/prisma-p2002"));
    expect(res.status).toBe(409);
  });

  it("P2002 response has PRISMA_P2002 errorCode", async () => {
    const res = await app.handle(new Request("http://localhost/prisma-p2002"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.errorCode).toBe("PRISMA_P2002");
    expect(body.success).toBe(false);
  });

  it("P2025 → 404 not found", async () => {
    const res = await app.handle(new Request("http://localhost/prisma-p2025"));
    expect(res.status).toBe(404);
  });

  it("unknown Prisma code → 500", async () => {
    const res = await app.handle(new Request("http://localhost/prisma-p9999"));
    expect(res.status).toBe(500);
  });
});

describe("error-handler: generic 500", () => {
  it("returns 500 for unexpected errors", async () => {
    const res = await app.handle(new Request("http://localhost/generic-500"));
    expect(res.status).toBe(500);
  });

  it("calls logger.error for 500 errors", async () => {
    mockLoggerError.mockReset();
    await app.handle(new Request("http://localhost/generic-500"));
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it("returns generic message for 500", async () => {
    const res = await app.handle(new Request("http://localhost/generic-500"));
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toBe("Internal server error");
  });
});

describe("error-handler: PARSE error (malformed JSON body)", () => {
  it("returns 400 when body is not valid JSON", async () => {
    const res = await app.handle(
      new Request("http://localhost/typebox-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json{{{",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns error message in body for parse error", async () => {
    const res = await app.handle(
      new Request("http://localhost/typebox-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json{{{",
      }),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(false);
    expect(typeof body.message).toBe("string");
  });
});
