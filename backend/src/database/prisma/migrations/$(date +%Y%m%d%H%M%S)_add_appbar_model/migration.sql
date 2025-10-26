-- CreateEnum
CREATE TYPE "AppbarCategory" AS ENUM ('menu', 'submenu', 'link', 'button');

-- CreateTable
CREATE TABLE "appbar" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "AppbarCategory",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "created_by" TEXT,

    CONSTRAINT "appbar_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "appbar_key_key" UNIQUE ("key")
);

-- CreateIndex
CREATE INDEX "appbar_index_key" ON "appbar"("key");
CREATE INDEX "appbar_index_category" ON "appbar"("category");