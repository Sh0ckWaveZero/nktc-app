import { Elysia } from "elysia";

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

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
	({ error, code, path, request, set }) => {
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
				meta: {
					timestamp: new Date().toISOString(),
					path,
					method: request.method,
				},
			};
		}

		const status = CodeStatusMap[code] ?? (set.status as number) ?? 500;
		set.status = status;

		return {
			success: false,
			statusCode: status,
			message: error instanceof Error ? error.message : "Request failed",
			meta: {
				timestamp: new Date().toISOString(),
				path,
				method: request.method,
			},
		};
	},
);