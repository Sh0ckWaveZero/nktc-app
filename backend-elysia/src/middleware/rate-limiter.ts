import { TooManyRequestsError } from "@/libs/errors";

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store.entries()) {
		if (now >= entry.resetAt) store.delete(key);
	}
}, 5 * 60_000).unref();

export function extractIp(headers: Record<string, string | undefined>): string {
	const fwd = headers["x-forwarded-for"];
	return fwd?.split(",")[0]?.trim() ?? headers["x-real-ip"] ?? "unknown";
}

export function createRateLimiter(options: {
	max: number;
	windowMs: number;
	keyPrefix?: string;
}) {
	const { max, windowMs, keyPrefix = "rl" } = options;

	const check = (key: string): { allowed: boolean; remaining: number; retryAfter?: number } => {
		const now = Date.now();
		const fullKey = `${keyPrefix}:${key}`;
		const entry = store.get(fullKey);

		if (!entry || now >= entry.resetAt) {
			store.set(fullKey, { count: 1, resetAt: now + windowMs });
			return { allowed: true, remaining: max - 1 };
		}

		entry.count += 1;

		if (entry.count > max) {
			const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
			return { allowed: false, remaining: 0, retryAfter };
		}

		return { allowed: true, remaining: max - entry.count };
	};

	const checkOrThrow = (key: string, message: string) => {
		const result = check(key);
		if (!result.allowed) throw new TooManyRequestsError(message, result.retryAfter);
	};

	const cleanup = () => {
		const now = Date.now();
		for (const [key, entry] of store.entries()) {
			if (now >= entry.resetAt) {
				store.delete(key);
			}
		}
	};

	return { check, checkOrThrow, cleanup };
}

export const loginRateLimiter = createRateLimiter({
	max: 5,
	windowMs: 60_000,
	keyPrefix: "login",
});

export const refreshRateLimiter = createRateLimiter({
	max: 10,
	windowMs: 60_000,
	keyPrefix: "refresh",
});

export const registerRateLimiter = createRateLimiter({
	max: 3,
	windowMs: 60_000,
	keyPrefix: "register",
});
