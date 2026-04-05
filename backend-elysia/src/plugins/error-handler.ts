import { Elysia } from "elysia";
import { AppError } from "@/libs/errors";
import { logger } from "@/infrastructure/logging";

const PrismaErrorMap: Record<string, { status: number; message: string }> = {
	P2002: { status: 409, message: "A record with this value already exists" },
	P2025: { status: 404, message: "Record not found" },
	P2003: { status: 400, message: "Invalid reference provided" },
	P2014: { status: 400, message: "A relation violation occurred" },
	P2021: { status: 400, message: "Invalid operation" },
	P2022: { status: 400, message: "Invalid operation" },
};

const CodeStatusMap: Record<string, number> = {
	VALIDATION: 422,
	NOT_FOUND: 404,
	PARSE: 400,
	INTERNAL_SERVER_ERROR: 500,
	UNKNOWN: 500,
};

function parseElysiaValidationErrors(error: unknown) {
	const raw = (error as any)?.all ?? [];
	return raw.map((e: any) => ({
		field: e.path?.replace(/^\//, "") || undefined,
		message: e.message ?? "Invalid value",
	}));
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
	({ error, code, path, request, set }) => {
		const meta = {
			timestamp: new Date().toISOString(),
			path,
			method: request.method,
		};

		// AppError — business logic errors (4xx)
		if (error instanceof AppError) {
			set.status = error.statusCode;
			return {
				success: false,
				statusCode: error.statusCode,
				message: error.message,
				errorCode: error.errorCode,
				...(error.errors?.length ? { errors: error.errors } : {}),
				meta,
			};
		}

		// Elysia validation errors (TypeBox)
		if (code === "VALIDATION") {
			set.status = 422;
			const errors = parseElysiaValidationErrors(error);
			return {
				success: false,
				statusCode: 422,
				message: "Validation failed",
				errorCode: "VALIDATION_ERROR",
				errors,
				meta,
			};
		}

		// Prisma known errors
		const prismaErrorName = (error as any)?.constructor?.name;
		if (prismaErrorName === "PrismaClientKnownRequestError") {
			const prismaCode = (error as any).code as string;
			const { status, message } = PrismaErrorMap[prismaCode] ?? {
				status: 500,
				message: "Database operation failed",
			};
			set.status = status;
			return {
				success: false,
				statusCode: status,
				message,
				errorCode: `PRISMA_${prismaCode}`,
				meta,
			};
		}

		// Unexpected errors — log with structured logger, return generic message
		const status = CodeStatusMap[code] ?? (set.status as number) ?? 500;
		set.status = status;

		if (status >= 500) {
			logger.error(`Unhandled error [${code}] ${request.method} ${path}`, {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				code,
				path,
				method: request.method,
			});
		}

		return {
			success: false,
			statusCode: status,
			message:
				status >= 500
					? "Internal server error"
					: error instanceof Error
						? error.message
						: "Request failed",
			meta,
		};
	},
);
