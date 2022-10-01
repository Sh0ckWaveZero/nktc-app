-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rolePermisssionId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_name_key" ON "role_permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_label_key" ON "role_permission"("label");

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_rolePermisssionId_fkey" FOREIGN KEY ("rolePermisssionId") REFERENCES "role_permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
