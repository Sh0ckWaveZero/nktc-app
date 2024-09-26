import { pgTable, uniqueIndex, index, foreignKey, text, timestamp, integer, jsonb, boolean, bigint, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const role = pgEnum("Role", ['Admin', 'User', 'Student', 'Teacher', 'Parent'])



export const classroomToTeacher = pgTable("_ClassroomToTeacher", {
	a: text("A").notNull(),
	b: text("B").notNull(),
},
(table) => {
	return {
		abUnique: uniqueIndex("_ClassroomToTeacher_AB_unique").using("btree", table.a.asc().nullsLast(), table.b.asc().nullsLast()),
		bIdx: index().using("btree", table.b.asc().nullsLast()),
		classroomToTeacherAFkey: foreignKey({
			columns: [table.a],
			foreignColumns: [classroom.id],
			name: "_ClassroomToTeacher_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		classroomToTeacherBFkey: foreignKey({
			columns: [table.b],
			foreignColumns: [teacher.id],
			name: "_ClassroomToTeacher_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId"),
	avatar: text("avatar"),
	title: text("title"),
	firstName: text("firstName"),
	lastName: text("lastName"),
	idCard: text("idCard"),
	birthDate: timestamp("birthDate", { precision: 3, mode: 'string' }),
	bloodType: text("bloodType"),
	fatherName: text("fatherName"),
	fatherPhone: text("fatherPhone"),
	motherName: text("motherName"),
	motherPhone: text("motherPhone"),
	parentName: text("parentName"),
	parentPhone: text("parentPhone"),
	addressLine1: text("addressLine1"),
	subdistrict: text("subdistrict"),
	district: text("district"),
	province: text("province"),
	postcode: text("postcode"),
	country: text("country"),
	phone: text("phone"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		accountName: index("account_name").using("btree", table.firstName.asc().nullsLast(), table.lastName.asc().nullsLast()),
		userIdIdKey: uniqueIndex("accounts_userId_id_key").using("btree", table.userId.asc().nullsLast(), table.id.asc().nullsLast()),
		userIdKey: uniqueIndex("accounts_userId_key").using("btree", table.userId.asc().nullsLast()),
		accountsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "accounts_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const auditLog = pgTable("audit_log", {
	id: text("id").primaryKey().notNull(),
	action: text("action"),
	model: text("model"),
	recordId: text("recordId"),
	fieldName: text("fieldName"),
	oldValue: text("oldValue"),
	newValue: text("newValue"),
	detail: text("detail"),
	ipAddr: text("ipAddr"),
	browser: text("browser"),
	device: text("device"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdBy: text("createdBy"),
});

export const course = pgTable("course", {
	id: text("id").primaryKey().notNull(),
	courseId: text("courseId"),
	courseName: text("courseName"),
	numberOfCredit: integer("numberOfCredit"),
	type: text("type"),
	evaluation: text("evaluation"),
	status: text("status"),
	programId: text("programId"),
	classrommId: text("classrommId"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		courseIdKey: uniqueIndex("course_courseId_key").using("btree", table.courseId.asc().nullsLast()),
		courseClassrommIdFkey: foreignKey({
			columns: [table.classrommId],
			foreignColumns: [classroom.id],
			name: "course_classrommId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		courseProgramIdFkey: foreignKey({
			columns: [table.programId],
			foreignColumns: [program.id],
			name: "course_programId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const department = pgTable("department", {
	id: text("id").primaryKey().notNull(),
	departmentId: text("departmentId"),
	name: text("name"),
	description: text("description"),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
});

export const level = pgTable("level", {
	id: text("id").primaryKey().notNull(),
	levelId: text("levelId"),
	levelName: text("levelName"),
	levelFullName: text("levelFullName"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		levelIdKey: uniqueIndex("level_levelId_key").using("btree", table.levelId.asc().nullsLast()),
	}
});

export const reportCheckIn = pgTable("reportCheckIn", {
	id: text("id").primaryKey().notNull(),
	teacherId: text("teacherId").notNull(),
	teacherKey: text("teacherKey"),
	classroomId: text("classroomId").notNull(),
	classroomKey: text("classroomKey"),
	present: text("present").array().default(["RAY"]),
	absent: text("absent").array().default(["RAY"]),
	late: text("late").array().default(["RAY"]),
	leave: text("leave").array().default(["RAY"]),
	internship: text("internship").array().default(["RAY"]),
	checkInDate: timestamp("checkInDate", { precision: 3, mode: 'string' }),
	checkInTime: timestamp("checkInTime", { precision: 3, mode: 'string' }),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		reportCheckInClassroomKeyFkey: foreignKey({
			columns: [table.classroomKey],
			foreignColumns: [classroom.id],
			name: "reportCheckIn_classroomKey_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		reportCheckInTeacherKeyFkey: foreignKey({
			columns: [table.teacherKey],
			foreignColumns: [teacher.id],
			name: "reportCheckIn_teacherKey_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const rolePermission = pgTable("role_permission", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	label: text("label").notNull(),
	permissions: jsonb("permissions").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		labelKey: uniqueIndex("role_permission_label_key").using("btree", table.label.asc().nullsLast()),
		nameKey: uniqueIndex("role_permission_name_key").using("btree", table.name.asc().nullsLast()),
	}
});

export const session = pgTable("session", {
	id: text("id").primaryKey().notNull(),
	sessionToken: text("sessionToken").notNull(),
	expires: timestamp("expires", { precision: 3, mode: 'string' }).notNull(),
	userId: text("userId").notNull(),
},
(table) => {
	return {
		sessionTokenKey: uniqueIndex("session_sessionToken_key").using("btree", table.sessionToken.asc().nullsLast()),
		sessionUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const teacherOnClassroom = pgTable("teacherOnClassroom", {
	id: text("id").primaryKey().notNull(),
	teacherId: text("teacherId").notNull(),
	classroomId: text("classroomId").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		teacherIdClassroomIdKey: uniqueIndex("teacherOnClassroom_teacherId_classroomId_key").using("btree", table.teacherId.asc().nullsLast(), table.classroomId.asc().nullsLast()),
	}
});

export const teacher = pgTable("teacher", {
	id: text("id").primaryKey().notNull(),
	teacherId: text("teacherId"),
	jobTitle: text("jobTitle"),
	academicStanding: text("academicStanding"),
	classroomIds: text("classroomIds").array().default(["RAY"]),
	rfId: text("rfId"),
	programId: text("programId"),
	userId: text("userId"),
	departmentId: text("departmentId"),
	levelClassroomId: text("levelClassroomId"),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		teacherIdKey: uniqueIndex("teacher_teacherId_key").using("btree", table.teacherId.asc().nullsLast()),
		userIdKey: uniqueIndex("teacher_userId_key").using("btree", table.userId.asc().nullsLast()),
		userIdTeacherIdKey: uniqueIndex("teacher_userId_teacherId_key").using("btree", table.userId.asc().nullsLast(), table.teacherId.asc().nullsLast()),
		teacherDepartmentIdFkey: foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "teacher_departmentId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		teacherLevelClassroomIdFkey: foreignKey({
			columns: [table.levelClassroomId],
			foreignColumns: [levelClassroom.id],
			name: "teacher_levelClassroomId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		teacherProgramIdFkey: foreignKey({
			columns: [table.programId],
			foreignColumns: [program.id],
			name: "teacher_programId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		teacherUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "teacher_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const userRole = pgTable("user_role", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId").notNull(),
	rolePermisssionId: text("rolePermisssionId"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		userRoleRolePermisssionIdFkey: foreignKey({
			columns: [table.rolePermisssionId],
			foreignColumns: [rolePermission.id],
			name: "user_role_rolePermisssionId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		userRoleUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_role_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	}
});

export const verificationtokens = pgTable("verificationtokens", {
	identifier: text("identifier").notNull(),
	token: text("token").notNull(),
	expires: timestamp("expires", { precision: 3, mode: 'string' }).notNull(),
},
(table) => {
	return {
		identifierTokenKey: uniqueIndex("verificationtokens_identifier_token_key").using("btree", table.identifier.asc().nullsLast(), table.token.asc().nullsLast()),
	}
});

export const classroomToLevelClassroom = pgTable("_ClassroomToLevelClassroom", {
	a: text("A").notNull(),
	b: text("B").notNull(),
},
(table) => {
	return {
		abUnique: uniqueIndex("_ClassroomToLevelClassroom_AB_unique").using("btree", table.a.asc().nullsLast(), table.b.asc().nullsLast()),
		bIdx: index().using("btree", table.b.asc().nullsLast()),
		classroomToLevelClassroomAFkey: foreignKey({
			columns: [table.a],
			foreignColumns: [classroom.id],
			name: "_ClassroomToLevelClassroom_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		classroomToLevelClassroomBFkey: foreignKey({
			columns: [table.b],
			foreignColumns: [levelClassroom.id],
			name: "_ClassroomToLevelClassroom_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const student = pgTable("student", {
	id: text("id").primaryKey().notNull(),
	studentId: text("studentId"),
	isGraduation: boolean("isGraduation"),
	graduationYear: integer("graduationYear"),
	graduationDate: timestamp("graduationDate", { precision: 3, mode: 'string' }),
	studentStatus: text("studentStatus"),
	group: text("group"),
	status: text("status").default('normal'),
	userId: text("userId"),
	classroomId: text("classroomId"),
	departmentId: text("departmentId"),
	programId: text("programId"),
	levelId: text("levelId"),
	levelClassroomId: text("levelClassroomId"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		studentIdKey: uniqueIndex("student_studentId_key").using("btree", table.studentId.asc().nullsLast()),
		userIdKey: uniqueIndex("student_userId_key").using("btree", table.userId.asc().nullsLast()),
		userIdStudentIdKey: uniqueIndex("student_userId_studentId_key").using("btree", table.userId.asc().nullsLast(), table.studentId.asc().nullsLast()),
		studentClassroomIdFkey: foreignKey({
			columns: [table.classroomId],
			foreignColumns: [classroom.id],
			name: "student_classroomId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		studentDepartmentIdFkey: foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "student_departmentId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		studentLevelClassroomIdFkey: foreignKey({
			columns: [table.levelClassroomId],
			foreignColumns: [levelClassroom.id],
			name: "student_levelClassroomId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		studentLevelIdFkey: foreignKey({
			columns: [table.levelId],
			foreignColumns: [level.id],
			name: "student_levelId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		studentProgramIdFkey: foreignKey({
			columns: [table.programId],
			foreignColumns: [program.id],
			name: "student_programId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		studentUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "student_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const activityCheckInReport = pgTable("activityCheckInReport", {
	id: text("id").primaryKey().notNull(),
	teacherId: text("teacherId").notNull(),
	teacherKey: text("teacherKey"),
	classroomId: text("classroomId").notNull(),
	classroomKey: text("classroomKey"),
	present: text("present").array().default(["RAY"]),
	absent: text("absent").array().default(["RAY"]),
	internship: text("internship").array().default(["RAY"]),
	checkInDate: timestamp("checkInDate", { precision: 3, mode: 'string' }),
	checkInTime: timestamp("checkInTime", { precision: 3, mode: 'string' }),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		activityCheckInReportClassroomKeyFkey: foreignKey({
			columns: [table.classroomKey],
			foreignColumns: [classroom.id],
			name: "activityCheckInReport_classroomKey_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		activityCheckInReportTeacherKeyFkey: foreignKey({
			columns: [table.teacherKey],
			foreignColumns: [teacher.id],
			name: "activityCheckInReport_teacherKey_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const classroom = pgTable("classroom", {
	id: text("id").primaryKey().notNull(),
	classroomId: text("classroomId"),
	name: text("name"),
	description: text("description"),
	teacherIds: text("teacherIds").array().default(["RAY"]),
	levelId: text("levelId"),
	programId: text("programId"),
	departmentId: text("departmentId"),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
	levelClassroomIds: text("levelClassroomIds").array().default(["RAY"]),
},
(table) => {
	return {
		classroomIdKey: uniqueIndex("classroom_classroomId_key").using("btree", table.classroomId.asc().nullsLast()),
		nameKey: uniqueIndex("classroom_name_key").using("btree", table.name.asc().nullsLast()),
		classroomDepartmentIdFkey: foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "classroom_departmentId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		classroomLevelIdFkey: foreignKey({
			columns: [table.levelId],
			foreignColumns: [level.id],
			name: "classroom_levelId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		classroomProgramIdFkey: foreignKey({
			columns: [table.programId],
			foreignColumns: [program.id],
			name: "classroom_programId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const levelClassroom = pgTable("levelClassroom", {
	id: text("id").primaryKey().notNull(),
	levelClassroomId: text("levelClassroomId"),
	name: text("name"),
	description: text("description"),
	status: text("status"),
	programId: text("programId"),
	levelId: text("levelId"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
	classroomIds: text("classroomIds").array().default(["RAY"]),
},
(table) => {
	return {
		levelClassroomIdKey: uniqueIndex("levelClassroom_levelClassroomId_key").using("btree", table.levelClassroomId.asc().nullsLast()),
		levelClassroomLevelIdFkey: foreignKey({
			columns: [table.levelId],
			foreignColumns: [level.id],
			name: "levelClassroom_levelId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		levelClassroomProgramIdFkey: foreignKey({
			columns: [table.programId],
			foreignColumns: [program.id],
			name: "levelClassroom_programId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const user = pgTable("user", {
	id: text("id").primaryKey().notNull(),
	username: text("username").notNull(),
	password: text("password").notNull(),
	email: text("email"),
	role: role("role").default('User').notNull(),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
	verificationToken: text("verificationToken"),
	refreshToken: text("refreshToken"),
	accessToken: text("accessToken"),
	expiresAt: integer("expiresAt"),
},
(table) => {
	return {
		usernameKey: uniqueIndex("user_username_key").using("btree", table.username.asc().nullsLast()),
		usernameVerificationTokenKey: uniqueIndex("user_username_verificationToken_key").using("btree", table.username.asc().nullsLast(), table.verificationToken.asc().nullsLast()),
		indexVerificationToken: index("users_index_verificationToken").using("btree", table.username.asc().nullsLast(), table.verificationToken.asc().nullsLast()),
		userVerificationTokenFkey: foreignKey({
			columns: [table.verificationToken],
			foreignColumns: [verificationtokens.token],
			name: "user_verificationToken_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});

export const message = pgTable("message", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "message_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	messageSent: boolean("message_sent").default(false),
});

export const program = pgTable("program", {
	id: text("id").primaryKey().notNull(),
	programId: text("programId").notNull(),
	name: text("name"),
	description: text("description"),
	levelId: text("levelId"),
	departmentId: text("departmentId"),
	status: text("status"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	updatedBy: text("updatedBy"),
	createdBy: text("createdBy"),
},
(table) => {
	return {
		programIdKey: uniqueIndex("program_programId_key").using("btree", table.programId.asc().nullsLast()),
		programDepartmentIdFkey: foreignKey({
			columns: [table.departmentId],
			foreignColumns: [department.id],
			name: "program_departmentId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
		programLevelIdFkey: foreignKey({
			columns: [table.levelId],
			foreignColumns: [level.id],
			name: "program_levelId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	}
});