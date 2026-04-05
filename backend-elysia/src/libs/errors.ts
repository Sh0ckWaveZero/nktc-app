export type FieldError = {
	field?: string;
	message: string;
};

export class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number = 400,
		public readonly errorCode?: string,
		public readonly errors?: FieldError[],
	) {
		super(message);
		this.name = "AppError";
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404, "NOT_FOUND");
	}
}

export class ConflictError extends AppError {
	constructor(message: string, field?: string) {
		super(
			message,
			409,
			"CONFLICT",
			field ? [{ field, message }] : undefined,
		);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super(message, 401, "UNAUTHORIZED");
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden") {
		super(message, 403, "FORBIDDEN");
	}
}

export class BadRequestError extends AppError {
	constructor(message: string, field?: string) {
		super(
			message,
			400,
			"BAD_REQUEST",
			field ? [{ field, message }] : undefined,
		);
	}
}

export class ValidationError extends AppError {
	constructor(errors: FieldError[]) {
		super("Validation failed", 422, "VALIDATION_ERROR", errors);
	}
}
