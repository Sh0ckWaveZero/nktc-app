/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `classroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classroom_name_key" ON "classroom"("name");
