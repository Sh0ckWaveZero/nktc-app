-- Auth tables are separate so the legacy User, Account, Session and JWT flow remain compatible.
CREATE TABLE "auth_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "displayUsername" TEXT,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "legacyUserId" TEXT NOT NULL,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failedVerificationCount" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "auth_two_factor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3),
    "aaguid" TEXT,

    CONSTRAINT "auth_passkey_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");
CREATE UNIQUE INDEX "auth_user_username_key" ON "auth_user"("username");
CREATE UNIQUE INDEX "auth_user_legacyUserId_key" ON "auth_user"("legacyUserId");
CREATE UNIQUE INDEX "auth_session_token_key" ON "auth_session"("token");
CREATE INDEX "auth_session_userId_idx" ON "auth_session"("userId");
CREATE INDEX "auth_account_userId_idx" ON "auth_account"("userId");
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification"("identifier");
CREATE INDEX "auth_two_factor_secret_idx" ON "auth_two_factor"("secret");
CREATE INDEX "auth_two_factor_userId_idx" ON "auth_two_factor"("userId");
CREATE INDEX "auth_passkey_userId_idx" ON "auth_passkey"("userId");
CREATE INDEX "auth_passkey_credentialID_idx" ON "auth_passkey"("credentialID");

ALTER TABLE "auth_user"
ADD CONSTRAINT "auth_user_legacyUserId_fkey"
FOREIGN KEY ("legacyUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_session"
ADD CONSTRAINT "auth_session_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_account"
ADD CONSTRAINT "auth_account_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_two_factor"
ADD CONSTRAINT "auth_two_factor_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_passkey"
ADD CONSTRAINT "auth_passkey_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
