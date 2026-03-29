import { t } from "elysia";

/**
 * Standard response wrapper for OpenAPI documentation
 * Matching the structure defined in responsePlugin
 */
export const wrappedResponse = (dataSchema: any) =>
  t.Object({
    success: t.Boolean(),
    statusCode: t.Number(),
    message: t.String(),
    data: dataSchema,
    meta: t.Object({
      timestamp: t.String({ format: "date-time" }),
      path: t.String(),
      method: t.String(),
    }),
  });
