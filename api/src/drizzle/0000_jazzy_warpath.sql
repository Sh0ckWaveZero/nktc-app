-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "public"."Role" AS ENUM('Admin', 'User', 'Student', 'Teacher', 'Parent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_ClassroomToTeacher" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"avatar" text,
	"title" text,
	"firstName" text,
	"lastName" text,
	"idCard" text,
	"birthDate" timestamp(3),
	"bloodType" text,
	"fatherName" text,
	"fatherPhone" text,
	"motherName" text,
	"motherPhone" text,
	"parentName" text,
	"parentPhone" text,
	"addressLine1" text,
	"subdistrict" text,
	"district" text,
	"province" text,
	"postcode" text,
	"country" text,
	"phone" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text,
	"model" text,
	"recordId" text,
	"fieldName" text,
	"oldValue" text,
	"newValue" text,
	"detail" text,
	"ipAddr" text,
	"browser" text,
	"device" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course" (
	"id" text PRIMARY KEY NOT NULL,
	"courseId" text,
	"courseName" text,
	"numberOfCredit" integer,
	"type" text,
	"evaluation" text,
	"status" text,
	"programId" text,
	"classrommId" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department" (
	"id" text PRIMARY KEY NOT NULL,
	"departmentId" text,
	"name" text,
	"description" text,
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level" (
	"id" text PRIMARY KEY NOT NULL,
	"levelId" text,
	"levelName" text,
	"levelFullName" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reportCheckIn" (
	"id" text PRIMARY KEY NOT NULL,
	"teacherId" text NOT NULL,
	"teacherKey" text,
	"classroomId" text NOT NULL,
	"classroomKey" text,
	"present" text[] DEFAULT '{"RAY"}',
	"absent" text[] DEFAULT '{"RAY"}',
	"late" text[] DEFAULT '{"RAY"}',
	"leave" text[] DEFAULT '{"RAY"}',
	"internship" text[] DEFAULT '{"RAY"}',
	"checkInDate" timestamp(3),
	"checkInTime" timestamp(3),
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"expires" timestamp(3) NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacherOnClassroom" (
	"id" text PRIMARY KEY NOT NULL,
	"teacherId" text NOT NULL,
	"classroomId" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacher" (
	"id" text PRIMARY KEY NOT NULL,
	"teacherId" text,
	"jobTitle" text,
	"academicStanding" text,
	"classroomIds" text[] DEFAULT '{"RAY"}',
	"rfId" text,
	"programId" text,
	"userId" text,
	"departmentId" text,
	"levelClassroomId" text,
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"rolePermisssionId" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationtokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_ClassroomToLevelClassroom" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text,
	"isGraduation" boolean,
	"graduationYear" integer,
	"graduationDate" timestamp(3),
	"studentStatus" text,
	"group" text,
	"status" text DEFAULT 'normal',
	"userId" text,
	"classroomId" text,
	"departmentId" text,
	"programId" text,
	"levelId" text,
	"levelClassroomId" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activityCheckInReport" (
	"id" text PRIMARY KEY NOT NULL,
	"teacherId" text NOT NULL,
	"teacherKey" text,
	"classroomId" text NOT NULL,
	"classroomKey" text,
	"present" text[] DEFAULT '{"RAY"}',
	"absent" text[] DEFAULT '{"RAY"}',
	"internship" text[] DEFAULT '{"RAY"}',
	"checkInDate" timestamp(3),
	"checkInTime" timestamp(3),
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "classroom" (
	"id" text PRIMARY KEY NOT NULL,
	"classroomId" text,
	"name" text,
	"description" text,
	"teacherIds" text[] DEFAULT '{"RAY"}',
	"levelId" text,
	"programId" text,
	"departmentId" text,
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text,
	"levelClassroomIds" text[] DEFAULT '{"RAY"}'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "levelClassroom" (
	"id" text PRIMARY KEY NOT NULL,
	"levelClassroomId" text,
	"name" text,
	"description" text,
	"status" text,
	"programId" text,
	"levelId" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text,
	"classroomIds" text[] DEFAULT '{"RAY"}'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"role" "Role" DEFAULT 'User' NOT NULL,
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text,
	"verificationToken" text,
	"refreshToken" text,
	"accessToken" text,
	"expiresAt" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_sent" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "program" (
	"id" text PRIMARY KEY NOT NULL,
	"programId" text NOT NULL,
	"name" text,
	"description" text,
	"levelId" text,
	"departmentId" text,
	"status" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"updatedBy" text,
	"createdBy" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ClassroomToTeacher" ADD CONSTRAINT "_ClassroomToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ClassroomToTeacher" ADD CONSTRAINT "_ClassroomToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course" ADD CONSTRAINT "course_classrommId_fkey" FOREIGN KEY ("classrommId") REFERENCES "public"."classroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course" ADD CONSTRAINT "course_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."program"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "public"."classroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reportCheckIn" ADD CONSTRAINT "reportCheckIn_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teacher" ADD CONSTRAINT "teacher_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teacher" ADD CONSTRAINT "teacher_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "public"."levelClassroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teacher" ADD CONSTRAINT "teacher_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."program"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teacher" ADD CONSTRAINT "teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_role" ADD CONSTRAINT "user_role_rolePermisssionId_fkey" FOREIGN KEY ("rolePermisssionId") REFERENCES "public"."role_permission"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."classroom"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_ClassroomToLevelClassroom" ADD CONSTRAINT "_ClassroomToLevelClassroom_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."levelClassroom"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."classroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_levelClassroomId_fkey" FOREIGN KEY ("levelClassroomId") REFERENCES "public"."levelClassroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."level"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."program"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_classroomKey_fkey" FOREIGN KEY ("classroomKey") REFERENCES "public"."classroom"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activityCheckInReport" ADD CONSTRAINT "activityCheckInReport_teacherKey_fkey" FOREIGN KEY ("teacherKey") REFERENCES "public"."teacher"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classroom" ADD CONSTRAINT "classroom_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classroom" ADD CONSTRAINT "classroom_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."level"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classroom" ADD CONSTRAINT "classroom_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."program"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "levelClassroom" ADD CONSTRAINT "levelClassroom_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."level"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "levelClassroom" ADD CONSTRAINT "levelClassroom_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."program"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_verificationToken_fkey" FOREIGN KEY ("verificationToken") REFERENCES "public"."verificationtokens"("token") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program" ADD CONSTRAINT "program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "program" ADD CONSTRAINT "program_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."level"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_ClassroomToTeacher_AB_unique" ON "_ClassroomToTeacher" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_ClassroomToTeacher_B_index" ON "_ClassroomToTeacher" USING btree ("B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_name" ON "accounts" USING btree ("firstName","lastName");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_userId_id_key" ON "accounts" USING btree ("userId","id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_userId_key" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "course_courseId_key" ON "course" USING btree ("courseId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "level_levelId_key" ON "level" USING btree ("levelId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permission_label_key" ON "role_permission" USING btree ("label");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permission_name_key" ON "role_permission" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "session_sessionToken_key" ON "session" USING btree ("sessionToken");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teacherOnClassroom_teacherId_classroomId_key" ON "teacherOnClassroom" USING btree ("teacherId","classroomId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teacher_teacherId_key" ON "teacher" USING btree ("teacherId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teacher_userId_key" ON "teacher" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teacher_userId_teacherId_key" ON "teacher" USING btree ("userId","teacherId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verificationtokens_identifier_token_key" ON "verificationtokens" USING btree ("identifier","token");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "_ClassroomToLevelClassroom_AB_unique" ON "_ClassroomToLevelClassroom" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "_ClassroomToLevelClassroom_B_index" ON "_ClassroomToLevelClassroom" USING btree ("B");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "student_studentId_key" ON "student" USING btree ("studentId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "student_userId_key" ON "student" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "student_userId_studentId_key" ON "student" USING btree ("userId","studentId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "classroom_classroomId_key" ON "classroom" USING btree ("classroomId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "classroom_name_key" ON "classroom" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "levelClassroom_levelClassroomId_key" ON "levelClassroom" USING btree ("levelClassroomId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_key" ON "user" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_verificationToken_key" ON "user" USING btree ("username","verificationToken");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_index_verificationToken" ON "user" USING btree ("username","verificationToken");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "program_programId_key" ON "program" USING btree ("programId");
*/