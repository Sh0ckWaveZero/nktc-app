import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";

import { errorHandler } from "./plugins/error-handler";
import { responsePlugin } from "./plugins/response";
import { logger } from "./libs/logger";
import { createLogger } from "./infrastructure/logging";
import { initializeDatabase } from "./libs/prisma";

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
import { activityCheckIn } from "./modules/activity-check-in";
import { goodnessIndividual } from "./modules/goodness-individual";
import { badnessIndividual } from "./modules/badness-individual";
import { classrooms } from "./modules/classrooms";
import { teachers } from "./modules/teachers";
import { students } from "./modules/students";
import { statics } from "./modules/statics";

const appLogger = createLogger();

await initializeDatabase();

const app = new Elysia()
	.use(errorHandler)
	.use(responsePlugin)
	.use(logger)
	.use(cors())
	.use(
		swagger({
			path: "/swagger",
			documentation: {
				info: {
					title: "NKTC API Documentation",
					description: "OpenAPI Documentation for NKTC Student Management System",
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
		}),
	)

	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET || "supersecret",
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
			.use(activityCheckIn)
			.use(goodnessIndividual)
			.use(badnessIndividual)
			.use(statics),
	)
	.listen(process.env.PORT || 3001);

appLogger.info("Server started", {
	url: `http://${app.server?.hostname}:${app.server?.port}`,
	port: app.server?.port,
	environment: process.env.NODE_ENV || "development",
});