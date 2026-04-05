import { Elysia } from "elysia";

export const responsePlugin = new Elysia({ name: "response" }).mapResponse(
	({ responseValue, path, request, set }) => {
		if (
			responseValue &&
			typeof responseValue === "object" &&
			("success" in responseValue || "statusCode" in responseValue)
		) {
			return new Response(JSON.stringify(responseValue), {
				status: (set.status as number) || 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		const isError = set.status && (set.status as number) >= 400;
		const wrapped = {
			success: !isError,
			statusCode: set.status || 200,
			message: isError ? "Request failed" : "Request successful",
			data: responseValue,
			meta: {
				timestamp: new Date().toISOString(),
				path,
				method: request.method,
			},
		};

		return new Response(JSON.stringify(wrapped), {
			status: (set.status as number) || 200,
			headers: { "Content-Type": "application/json" },
		});
	},
);