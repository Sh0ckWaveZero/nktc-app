-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'User', 'Student', 'Teacher', 'Parent');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'User',
    "status" TEXT DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "avatar" TEXT,
    "title" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "idCard" TEXT,
    "birthDate" TIMESTAMP(3),
    "bloodType" TEXT,
    "fatherName" TEXT,
    "fatherPhone" TEXT,
    "motherName" TEXT,
    "motherPhone" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "addressLine1" TEXT,
    "subdistrict" TEXT,
    "district" TEXT,
    "province" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "isGraduation" BOOLEAN DEFAULT false,
    "graduationYear" INTEGER,
    "graduationDate" TIMESTAMP(3),
    "studentStatus" TEXT DEFAULT 'กำลังศึกษา',
    "group" TEXT,
    "status" TEXT DEFAULT 'normal',
    "userId" TEXT,
    "classroomId" TEXT,
    "departmentId" TEXT,
    "programId" TEXT,
    "levelId" TEXT,
    "levelClassroomId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT,
    "jobTitle" TEXT,
    "academicStanding" TEXT,
    "classroomIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rfId" TEXT,
    "programId" TEXT,
    "userId" TEXT,
    "departmentId" TEXT,
    "levelClassroomId" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "teacherIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "levelId" TEXT,
    "programId" TEXT,
    "departmentId" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,
    "levelClassroomIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levelClassroom" (
    "id" TEXT NOT NULL,
    "levelClassroomId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "status" TEXT,
    "programId" TEXT,
    "levelId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,
    "classroomIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "levelClassroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacherOnClassroom" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "teacherOnClassroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT,
    "name" TEXT,
    "description" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "levelId" TEXT,
    "departmentId" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT,
    "numberOfCredit" INTEGER,
    "type" TEXT,
    "evaluation" TEXT,
    "status" TEXT,
    "programId" TEXT,
    "classrommId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level" (
    "id" TEXT NOT NULL,
    "levelId" TEXT,
    "levelName" TEXT,
    "levelFullName" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportCheckIn" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherKey" TEXT,
    "classroomId" TEXT NOT NULL,
    "classroomKey" TEXT,
    "present" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "absent" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "late" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "leave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "internship" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "checkInDate" TIMESTAMP(3),
    "checkInTime" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "reportCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activityCheckInReport" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherKey" TEXT,
    "classroomId" TEXT NOT NULL,
    "classroomKey" TEXT,
    "present" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "absent" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activityType" TEXT NOT NULL DEFAULT 'CLUB',
    "checkInDate" TIMESTAMP(3),
    "checkInTime" TIMESTAMP(3),
    "status" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "activityCheckInReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "action" TEXT,
    "model" TEXT,
    "recordId" TEXT,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "detail" TEXT,
    "ipAddr" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goodnessIndividual" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "goodnessScore" INTEGER,
    "goodnessDetail" TEXT,
    "image" TEXT,
    "goodDate" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "goodnessIndividual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badnessIndividual" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "badnessScore" INTEGER,
    "badnessDetail" TEXT,
    "image" TEXT,
    "badDate" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "badnessIndividual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitStudent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentKey" TEXT NOT NULL,
    "classroomId" TEXT,
    "visitDate" TIMESTAMP(3),
    "visitDetail" JSONB,
    "visitMap" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visitNo" INTEGER,
    "academicYear" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "visitStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassroomToLevelClassroom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassroomToLevelClassroom_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "users_index_username" ON "user"("username");

-- CreateIndex
CREATE INDEX "users_index_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "users_index_role" ON "user"("role");

-- CreateIndex
CREATE INDEX "users_index_status" ON "user"("status");

-- CreateIndex
CREATE INDEX "users_index_created_at" ON "user"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_name_key" ON "role_permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_label_key" ON "role_permission"("label");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_userId_key" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "account_name" ON "accounts"("firstName", "lastName");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_userId_id_key" ON "accounts"("userId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "student_studentId_key" ON "student"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_userId_key" ON "student"("userId");

-- CreateIndex
CREATE INDEX "students_index_studentId" ON "student"("studentId");

-- CreateIndex
CREATE INDEX "students_index_classroom" ON "student"("classroomId");

-- CreateIndex
CREATE INDEX "students_index_department" ON "student"("departmentId");

-- CreateIndex
CREATE INDEX "students_index_program" ON "student"("programId");

-- CreateIndex
CREATE INDEX "students_index_level" ON "student"("levelId");

-- CreateIndex
CREATE INDEX "students_index_student_status" ON "student"("studentStatus");

-- CreateIndex
CREATE INDEX "students_index_status" ON "student"("status");

-- CreateIndex
CREATE INDEX "students_index_graduation" ON "student"("isGraduation");

-- CreateIndex
CREATE INDEX "students_index_graduation_year" ON "student"("graduationYear");

-- CreateIndex
CREATE UNIQUE INDEX "student_userId_studentId_key" ON "student"("userId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacherId_key" ON "teacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_userId_key" ON "teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_userId_teacherId_key" ON "teacher"("userId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_classroomId_key" ON "classroom"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_name_key" ON "classroom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "levelClassroom_levelClassroomId_key" ON "levelClassroom"("levelClassroomId");

-- CreateIndex
CREATE UNIQUE INDEX "teacherOnClassroom_teacherId_classroomId_key" ON "teacherOnClassroom"("teacherId", "classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "program_programId_key" ON "program"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "course_courseId_key" ON "course"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "level_levelId_key" ON "level"("levelId");

-- CreateIndex
CREATE INDEX "activityCheckInReport_teacherId_classroomId_activityType_idx" ON "activityCheckInReport"("teacherId", "classroomId", "activityType");

-- CreateIndex
CREATE INDEX "activityCheckInReport_classroomId_checkInDate_idx" ON "activityCheckInReport"("classroomId", "checkInDate");

-- CreateIndex
CREATE INDEX "activityCheckInReport_checkInDate_idx" ON "activityCheckInReport"("checkInDate");

-- CreateIndex
CREATE INDEX "_ClassroomToLevelClassroom_B_index" ON "_ClassroomToLevelClassroom"("B");

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_rolePermisssionId_fkey" FOREIGN KEY ("rolePermisssionId") REFERENCES "role_permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "levelClassroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "levelClassroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levelClassroom" ADD CONSTRAINT "levelClassroom_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levelClassroom" ADD CONSTRAINT "levelClassroom_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacherOnClassroom" ADD CONSTRAINT "teacherOnClassroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacherOnClassroom" ADD CONSTRAINT "teacherOnClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_classrommId_fkey" FOREIGN KEY ("classrommId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goodnessIndividual" ADD CONSTRAINT "goodnessIndividual_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goodnessIndividual" ADD CONSTRAINT "goodnessIndividual_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badnessIndividual" ADD CONSTRAINT "badnessIndividual_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badnessIndividual" ADD CONSTRAINT "badnessIndividual_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitStudent" ADD CONSTRAINT "visitStudent_studentKey_fkey" FOREIGN KEY ("studentKey") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitStudent" ADD CONSTRAINT "visitStudent_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_A_fkey" FOREIGN KEY ("A") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_B_fkey" FOREIGN KEY ("B") REFERENCES "levelClassroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
