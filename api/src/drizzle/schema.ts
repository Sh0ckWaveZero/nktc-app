import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const role = pgEnum('Role', [
  'Admin',
  'User',
  'Student',
  'Teacher',
  'Parent',
]);

export const rolePermission = pgTable(
  'role_permission',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    name: text('name').notNull(),
    label: text('label').notNull(),
    permissions: jsonb('permissions').notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('role_permission_label_key').using(
      'btree',
      table.label.asc().nullsLast(),
    ),
    uniqueIndex('role_permission_name_key').using(
      'btree',
      table.name.asc().nullsLast(),
    ),
  ],
);

export const classroomToLevelClassroom = pgTable(
  '_classroom_to_level_classroom',
  {
    a: text('A').notNull(),
    b: text('B').notNull(),
  },
  (table) => [
    uniqueIndex('_ClassroomToLevelClassroom_AB_unique').using(
      'btree',
      table.a.asc().nullsLast(),
      table.b.asc().nullsLast(),
    ),
    index().using('btree', table.b.asc().nullsLast()),
    foreignKey({
      columns: [table.a],
      foreignColumns: [classroom.id],
      name: '_ClassroomToLevelClassroom_A_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.b],
      foreignColumns: [levelClassroom.id],
      name: '_ClassroomToLevelClassroom_B_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const activityCheckInReport = pgTable(
  'activity_check_in_report',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    teacherId: text('teacherId').notNull(),
    teacherKey: text('teacherKey'),
    classroomId: text('classroomId').notNull(),
    classroomKey: text('classroomKey'),
    present: text('present').array().default(['RAY']),
    absent: text('absent').array().default(['RAY']),
    internship: text('internship').array().default(['RAY']),
    checkInDate: timestamp('checkInDate', { precision: 3, mode: 'string' }),
    checkInTime: timestamp('checkInTime', { precision: 3, mode: 'string' }),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    foreignKey({
      columns: [table.classroomKey],
      foreignColumns: [classroom.id],
      name: 'activityCheckInReport_classroomKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.teacherKey],
      foreignColumns: [teacher.id],
      name: 'activityCheckInReport_teacherKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const userRole = pgTable(
  'user_role',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: text('userId').notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
    rolePermissionId: text('rolePermissionId'),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_role_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      columns: [table.rolePermissionId],
      foreignColumns: [rolePermission.id],
      name: 'user_role_rolePermissionId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const user = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    email: text('email'),
    role: role('role').default('User').notNull(),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
    verificationToken: text('verificationToken'),
    refreshToken: text('refreshToken'),
    accessToken: text('accessToken'),
    expiresAt: integer('expiresAt'),
  },
  (table) => [
    uniqueIndex('user_username_key').using(
      'btree',
      table.username.asc().nullsLast(),
    ),
    uniqueIndex('user_username_verificationToken_key').using(
      'btree',
      table.username.asc().nullsLast(),
      table.verificationToken.asc().nullsLast(),
    ),
    index('users_index_verificationToken').using(
      'btree',
      table.username.asc().nullsLast(),
      table.verificationToken.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.verificationToken],
      foreignColumns: [verificationTokens.token],
      name: 'user_verificationToken_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const teacher = pgTable(
  'teacher',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    teacherId: text('teacherId'),
    jobTitle: text('jobTitle'),
    academicStanding: text('academicStanding'),
    classroomIds: text('classroomIds').array().default(['RAY']),
    rfId: text('rfId'),
    programId: text('programId'),
    userId: text('userId'),
    departmentId: text('departmentId'),
    levelClassroomId: text('levelClassroomId'),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('teacher_teacherId_key').using(
      'btree',
      table.teacherId.asc().nullsLast(),
    ),
    uniqueIndex('teacher_userId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
    uniqueIndex('teacher_userId_teacherId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.teacherId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: 'teacher_departmentId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [program.id],
      name: 'teacher_programId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'teacher_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.levelClassroomId],
      foreignColumns: [levelClassroom.id],
      name: 'teacher_level_classroom_id_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const level = pgTable(
  'level',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    levelId: text('levelId'),
    levelName: text('levelName'),
    levelFullName: text('levelFullName'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('level_levelId_key').using(
      'btree',
      table.levelId.asc().nullsLast(),
    ),
  ],
);

export const session = pgTable(
  'session',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    sessionToken: text('sessionToken').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
    userId: text('userId').notNull(),
  },
  (table) => [
    uniqueIndex('session_sessionToken_key').using(
      'btree',
      table.sessionToken.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const student = pgTable(
  'student',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    studentId: text('studentId'),
    isGraduation: boolean('isGraduation'),
    graduationYear: integer('graduationYear'),
    graduationDate: timestamp('graduationDate', {
      precision: 3,
      mode: 'string',
    }),
    studentStatus: text('studentStatus'),
    group: text('group'),
    status: text('status').default('normal'),
    userId: text('userId'),
    classroomId: text('classroomId'),
    departmentId: text('departmentId'),
    programId: text('programId'),
    levelId: text('levelId'),
    levelClassroomId: text('levelClassroomId'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('student_studentId_key').using(
      'btree',
      table.studentId.asc().nullsLast(),
    ),
    uniqueIndex('student_userId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
    uniqueIndex('student_userId_studentId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.studentId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.classroomId],
      foreignColumns: [classroom.id],
      name: 'student_classroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: 'student_departmentId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.levelId],
      foreignColumns: [level.id],
      name: 'student_levelId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [program.id],
      name: 'student_programId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'student_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.levelClassroomId],
      foreignColumns: [levelClassroom.id],
      name: 'student_levelClassroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const levelClassroom = pgTable(
  'level_classroom',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    levelClassroomId: text('levelClassroomId'),
    name: text('name'),
    description: text('description'),
    status: text('status'),
    programId: text('programId'),
    levelId: text('levelId'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
    classroomIds: text('classroomIds').array().default(['RAY']),
  },
  (table) => [
    uniqueIndex('levelClassroom_levelClassroomId_key').using(
      'btree',
      table.levelClassroomId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.levelId],
      foreignColumns: [level.id],
      name: 'levelClassroom_levelId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [program.id],
      name: 'levelClassroom_programId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    uniqueIndex('verification_tokens_identifier_token_key').using(
      'btree',
      table.identifier.asc().nullsLast(),
      table.token.asc().nullsLast(),
    ),
    unique('verification_tokens_token_unique').on(table.token),
  ],
);

export const classroom = pgTable(
  'classroom',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    classroomId: text('classroomId'),
    name: text('name'),
    description: text('description'),
    teacherIds: text('teacherIds').array().default(['RAY']),
    levelId: text('levelId'),
    programId: text('programId'),
    departmentId: text('departmentId'),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
    levelClassroomIds: text('levelClassroomIds').array().default(['RAY']),
  },
  (table) => [
    uniqueIndex('classroom_classroomId_key').using(
      'btree',
      table.classroomId.asc().nullsLast(),
    ),
    uniqueIndex('classroom_name_key').using(
      'btree',
      table.name.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: 'classroom_departmentId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.levelId],
      foreignColumns: [level.id],
      name: 'classroom_levelId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [program.id],
      name: 'classroom_programId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const department = pgTable('department', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  departmentId: text('departmentId'),
  name: text('name'),
  description: text('description'),
  status: text('status'),
  createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', {
    precision: 3,
    mode: 'string',
  }).notNull(),
  updatedBy: text('updatedBy'),
  createdBy: text('createdBy'),
});

export const auditLog = pgTable('audit_log', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  action: text('action'),
  model: text('model'),
  recordId: text('recordId'),
  fieldName: text('fieldName'),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  detail: text('detail'),
  ipAddr: text('ipAddr'),
  browser: text('browser'),
  device: text('device'),
  createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdBy: text('createdBy'),
});

export const course = pgTable(
  'course',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    courseId: text('courseId'),
    courseName: text('courseName'),
    numberOfCredit: integer('numberOfCredit'),
    type: text('type'),
    evaluation: text('evaluation'),
    status: text('status'),
    programId: text('programId'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
    classroomId: text('classroomId'),
  },
  (table) => [
    uniqueIndex('course_courseId_key').using(
      'btree',
      table.courseId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.programId],
      foreignColumns: [program.id],
      name: 'course_programId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.classroomId],
      foreignColumns: [classroom.id],
      name: 'course_classroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const accounts = pgTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: text('userId'),
    avatar: text('avatar'),
    title: text('title'),
    firstName: text('firstName'),
    lastName: text('lastName'),
    idCard: text('idCard'),
    birthDate: timestamp('birthDate', { precision: 3, mode: 'string' }),
    bloodType: text('bloodType'),
    fatherName: text('fatherName'),
    fatherPhone: text('fatherPhone'),
    motherName: text('motherName'),
    motherPhone: text('motherPhone'),
    parentName: text('parentName'),
    parentPhone: text('parentPhone'),
    addressLine1: text('addressLine1'),
    subdistrict: text('subdistrict'),
    district: text('district'),
    province: text('province'),
    postcode: text('postcode'),
    country: text('country'),
    phone: text('phone'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    index('account_name').using(
      'btree',
      table.firstName.asc().nullsLast(),
      table.lastName.asc().nullsLast(),
    ),
    uniqueIndex('accounts_userId_id_key').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.id.asc().nullsLast(),
    ),
    uniqueIndex('accounts_userId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'accounts_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const program = pgTable(
  'program',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    programId: text('programId').notNull(),
    name: text('name'),
    description: text('description'),
    levelId: text('levelId'),
    departmentId: text('departmentId'),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('program_programId_key').using(
      'btree',
      table.programId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: 'program_departmentId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.levelId],
      foreignColumns: [level.id],
      name: 'program_levelId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const teacherOnClassroom = pgTable(
  'teacher_on_classroom',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    teacherId: text('teacherId').notNull(),
    classroomId: text('classroomId').notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    uniqueIndex('teacherOnClassroom_teacherId_classroomId_key').using(
      'btree',
      table.teacherId.asc().nullsLast(),
      table.classroomId.asc().nullsLast(),
    ),
  ],
);

export const reportCheckIn = pgTable(
  'report_check_in',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    teacherId: text('teacherId').notNull(),
    teacherKey: text('teacherKey'),
    classroomId: text('classroomId').notNull(),
    classroomKey: text('classroomKey'),
    present: text('present').array().default(['RAY']),
    absent: text('absent').array().default(['RAY']),
    late: text('late').array().default(['RAY']),
    leave: text('leave').array().default(['RAY']),
    internship: text('internship').array().default(['RAY']),
    checkInDate: timestamp('checkInDate', { precision: 3, mode: 'string' }),
    checkInTime: timestamp('checkInTime', { precision: 3, mode: 'string' }),
    status: text('status'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    foreignKey({
      columns: [table.classroomKey],
      foreignColumns: [classroom.id],
      name: 'reportCheckIn_classroomKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.teacherKey],
      foreignColumns: [teacher.id],
      name: 'reportCheckIn_teacherKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const classroomToTeacher = pgTable(
  '_classroom_to_teacher',
  {
    a: text('A').notNull(),
    b: text('B').notNull(),
  },
  (table) => [
    uniqueIndex('_classroom_to_teacher_AB_unique').using(
      'btree',
      table.a.asc().nullsLast(),
      table.b.asc().nullsLast(),
    ),
    index().using('btree', table.b.asc().nullsLast()),
    foreignKey({
      columns: [table.a],
      foreignColumns: [classroom.id],
      name: '_classroom_to_teacher_A_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.b],
      foreignColumns: [teacher.id],
      name: '_ClassroomToTeacher_B_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const account = pgTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    userId: text('userId').unique(),
    avatar: text('avatar'),
    title: text('title'),
    firstName: text('firstName'),
    lastName: text('lastName'),
    idCard: text('idCard'),
    birthDate: timestamp('birthDate', { precision: 3, mode: 'string' }),
    bloodType: text('bloodType'),
    fatherName: text('fatherName'),
    fatherPhone: text('fatherPhone'),
    motherName: text('motherName'),
    motherPhone: text('motherPhone'),
    parentName: text('parentName'),
    parentPhone: text('parentPhone'),
    addressLine1: text('addressLine1'),
    subdistrict: text('subdistrict'),
    district: text('district'),
    province: text('province'),
    postcode: text('postcode'),
    country: text('country'),
    phone: text('phone'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    index('account_name').using(
      'btree',
      table.firstName.asc().nullsLast(),
      table.lastName.asc().nullsLast(),
    ),
    uniqueIndex('accounts_userId_id_key').using(
      'btree',
      table.userId.asc().nullsLast(),
      table.id.asc().nullsLast(),
    ),
    uniqueIndex('accounts_userId_key').using(
      'btree',
      table.userId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'accounts_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
);

export const goodnessIndividual = pgTable(
  'goodness_individual',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    studentId: text('studentId').notNull(),
    studentKey: text('studentKey').notNull(),
    classroomId: text('classroomId'),
    goodnessScore: integer('goodnessScore'),
    goodnessDetail: text('goodnessDetail'),
    image: text('image'),
    goodDate: timestamp('goodDate', { precision: 3, mode: 'string' }),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    foreignKey({
      columns: [table.studentKey],
      foreignColumns: [student.id],
      name: 'goodnessIndividual_studentKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.classroomId],
      foreignColumns: [classroom.id],
      name: 'goodnessIndividual_classroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const badnessIndividual = pgTable(
  'badness_individual',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    studentId: text('studentId').notNull(),
    studentKey: text('studentKey').notNull(),
    classroomId: text('classroomId'),
    badnessScore: integer('badnessScore'),
    badnessDetail: text('badnessDetail'),
    image: text('image'),
    badDate: timestamp('badDate', { precision: 3, mode: 'string' }),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    foreignKey({
      columns: [table.studentKey],
      foreignColumns: [student.id],
      name: 'badnessIndividual_studentKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.classroomId],
      foreignColumns: [classroom.id],
      name: 'badnessIndividual_classroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const visitStudent = pgTable(
  'visit_student',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`)
      .notNull(),
    studentId: text('studentId').notNull(),
    studentKey: text('studentKey').notNull(),
    classroomId: text('classroomId'),
    visitDate: timestamp('visitDate', { precision: 3, mode: 'string' }),
    visitDetail: jsonb('visitDetail'),
    visitMap: text('visitMap'),
    images: text('images').array().default(['RAY']),
    visitNo: integer('visitNo'),
    academicYear: text('academicYear'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', {
      precision: 3,
      mode: 'string',
    }).notNull(),
    updatedBy: text('updatedBy'),
    createdBy: text('createdBy'),
  },
  (table) => [
    foreignKey({
      columns: [table.studentKey],
      foreignColumns: [student.id],
      name: 'visitStudent_studentKey_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
    foreignKey({
      columns: [table.classroomId],
      foreignColumns: [classroom.id],
      name: 'visitStudent_classroomId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);
