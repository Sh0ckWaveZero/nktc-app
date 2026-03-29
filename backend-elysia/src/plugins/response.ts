import { Elysia } from "elysia";

export const responsePlugin = new Elysia({ name: "response" }).mapResponse(
	({ response, path, request, set }) => {
		if (
			response &&
			typeof response === "object" &&
			("success" in response || "statusCode" in response)
		) {
			return new Response(JSON.stringify(response), {
				status: (set.status as number) || 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		const isError = set.status && (set.status as number) >= 400;
		const wrapped = {
			success: !isError,
			statusCode: set.status || 200,
			message: isError ? "Request failed" : "Request successful",
			data: response,
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