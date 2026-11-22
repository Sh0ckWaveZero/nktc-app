import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";

import { errorHandler } from "./plugins/error-handler";
import { responsePlugin } from "./plugins/response";
import { logger } from "./libs/logger";
import { createLogger } from "./infrastructure/logging";
import { initializeDatabase } from "./libs/prisma";
import { auth as betterAuthServer } from "./libs/better-auth";

// Modules
import { auth } from "./modules/auth";
import { users } from "./modules/users";
import { accounts } from "./modules/accounts";
import { levels } from "./modules/levels";
import { departments } from "./modules/departments";
import { programs } from "./modules/programs";
import { auditLog } from "./modules/audit-log";
import { visits } from "./modules/visits";
import { statistics } from "./modules/statistics";
import { reportCheckIn } from "./modules/report-check-in";
import { attendanceSummary } from "./modules/attendance-summary";
import { activityCheckIn } from "./modules/activity-check-in";
import { goodnessIndividual } from "./modules/goodness-individual";
import { badnessIndividual } from "./modules/badness-individual";
import { classrooms } from "./modules/classrooms";
import { teachers } from "./modules/teachers";
import { students } from "./modules/students";
import { statics } from "./modules/statics";
import { academicCalendar } from "./modules/academic-calendar";
import { academicYears } from "./modules/academic-years";
import { withAcademicYearRequest } from "./modules/academic-years/request-scope";
import { systemSettings } from "./modules/system-settings";

const appLogger = createLogger();

await initializeDatabase();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required");

const isDev = process.env.NODE_ENV !== "production";

const app = new Elysia()
  .use(errorHandler)
  .use(responsePlugin)
  .use(logger)
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get("origin");
        if (!origin) return true;

        const allowedDomains = (process.env.CORS_ALLOWED_DOMAINS || "")
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);

        const devOrigins = (process.env.CORS_DEV_ORIGINS || "")
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);

        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isAllowedDomain = allowedDomains.some((domain) => origin.endsWith(domain));
        const isDevOrigin = devOrigins.includes(origin);

        return isLocalhost || isAllowedDomain || isDevOrigin;
      },
      methods: (process.env.CORS_PRODUCTION_METHODS || "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        .split(",")
        .map((m) => m.trim()),
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Academic-Year", "X-Academic-Year-Version"],
      exposeHeaders: ["X-Academic-Year", "X-Active-Academic-Year", "X-Academic-Year-Version"],
      credentials: true,
      maxAge: Number(process.env.CORS_MAX_AGE) || 86400,
    }),
  )
  .use(
    isDev
      ? swagger({
          path: "/swagger",
          documentation: {
            info: {
              title: "NKTC API Documentation",
              description:
                "OpenAPI Documentation for NKTC Student Management System",
              version: "1.0.0",
            },
            tags: [
              { name: "Auth", description: "Authentication and token management" },
              { name: "Users", description: "User management and profiles" },
              { name: "Students", description: "Student records and management" },
              { name: "Teachers", description: "Teacher records and management" },
              { name: "Classrooms", description: "Classroom and group management" },
              { name: "Statistics", description: "Data analytics and reports" },
            ],
            components: {
              securitySchemes: {
                BearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                },
              },
            },
          },
          swaggerOptions: {
            persistAuthorization: true,
          },
        })
      : new Elysia({ name: "swagger-disabled" }),
  )

  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
      exp: "15m",
    }),
  )
  .get("/", () => "Hello Elysia!")
  .group("/api", (app) =>
    app
      .get("/health", () => ({ status: "ok" }))
      .use(auth)
      .use(users)
      .use(accounts)
      .use(levels)
      .use(departments)
      .use(programs)
      .use(auditLog)
      .use(visits)
      .use(statistics)
      .use(classrooms)
      .use(teachers)
      .use(students)
      .use(reportCheckIn)
      .use(attendanceSummary)
      .use(activityCheckIn)
      .use(goodnessIndividual)
      .use(badnessIndividual)
      .use(academicYears)
      .use(academicCalendar)
      .use(statics)
      .use(systemSettings),
  )
  .mount(betterAuthServer.handler);

const server = Bun.serve({
  port: process.env.PORT || 3001,
  fetch: (request) => withAcademicYearRequest(request, () => app.fetch(request)),
});

appLogger.info("🦊 Server started", {
  url: `http://${server.hostname}:${server.port}`,
  port: server.port,
  environment: isDev ? "development" : "production",
});
