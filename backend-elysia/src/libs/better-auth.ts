import { passkey } from "@better-auth/passkey";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { twoFactor, username } from "better-auth/plugins";

import { prisma } from "@/libs/prisma";

const BETTER_AUTH_BASE_PATH = "/api/auth/better-auth";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const firstProductionDomain = (process.env.CORS_ALLOWED_DOMAINS || "")
	.split(",")
	.map((domain) => domain.trim().replace(/^\./, ""))
	.find(Boolean);
const defaultAppOrigin = process.env.NODE_ENV === "production" && firstProductionDomain
	? `https://${firstProductionDomain}`
	: "http://localhost:3000";
const appOrigin = trimTrailingSlash(process.env.BETTER_AUTH_ORIGIN?.trim() || defaultAppOrigin);

const trustedOrigins = Array.from(
	new Set(
		[
			appOrigin,
			...(process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
				.split(",")
				.map((origin) => trimTrailingSlash(origin.trim()))
				.filter(Boolean),
		],
	),
);

const rpID = process.env.BETTER_AUTH_RP_ID?.trim() || new URL(appOrigin).hostname;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;

if (!betterAuthSecret) {
	throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

/**
 * Better Auth สำหรับ MFA, Passkey และ session แบบ cookie โดยผูกผู้ใช้กับ User เดิมผ่าน id เดียวกัน
 */
export const auth = betterAuth({
	appName: "NKTC Student Management System",
	baseURL: appOrigin,
	basePath: BETTER_AUTH_BASE_PATH,
	secret: betterAuthSecret,
	trustedOrigins,
	disabledPaths: ["/is-username-available", "/sign-up/email"],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: 8,
		password: {
			hash: (password) => Bun.password.hash(password),
			verify: ({ hash, password }) => Bun.password.verify(password, hash),
		},
	},
	user: {
		modelName: "AuthUser",
		additionalFields: {
			legacyUserId: {
				type: "string",
				required: true,
				input: false,
				returned: false,
			},
		},
	},
	session: {
		modelName: "AuthSession",
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		freshAge: 60 * 10,
	},
	account: {
		modelName: "AuthAccount",
	},
	verification: {
		modelName: "AuthVerification",
		storeIdentifier: "hashed",
	},
	advanced: {
		cookiePrefix: "nktc-auth",
		useSecureCookies: process.env.NODE_ENV === "production",
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
		},
	},
	plugins: [
		username({
			minUsernameLength: 1,
			maxUsernameLength: 128,
			usernameNormalization: false,
			displayUsernameNormalization: false,
			usernameValidator: () => true,
		}),
		twoFactor({
			issuer: "NKTC Student Management System",
			twoFactorTable: "AuthTwoFactor",
			accountLockout: {
				enabled: true,
				maxFailedAttempts: 5,
				durationSeconds: 15 * 60,
			},
		}),
		passkey({
			rpID,
			rpName: "NKTC Student Management System",
			origin: trustedOrigins,
			authenticatorSelection: {
				residentKey: "required",
				requireResidentKey: true,
				userVerification: "required",
			},
			schema: {
				passkey: {
				modelName: "AuthPasskey",
				},
			},
		}),
	],
});
