/**
 * Query Keys Configuration
 * Centralized query keys for React Query
 *
 * Benefits:
 * - Type-safe query keys
 * - Easy invalidation
 * - Consistent naming
 * - Auto-completion
 *
 * Pattern:
 * - Base key: ['entity']
 * - List: ['entity', 'list', filters]
 * - Detail: ['entity', 'detail', id]
 * - Related: ['entity', id, 'relation']
 */

/**
 * Statistics Query Keys
 */
export const statisticsKeys = {
  all: ['statistics'] as const,
  term: (params: {
    startDate: string;
    endDate: string;
    academicYear?: string;
    departmentId?: string;
    programId?: string;
  }) => [...statisticsKeys.all, 'term', params] as const,
};

/**
 * Students Query Keys
 */
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...studentKeys.lists(), filters] as const,
  searches: () => [...studentKeys.all, 'search'] as const,
  search: (query?: Record<string, any>) => [...studentKeys.searches(), query] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  trophy: (id: string) => [...studentKeys.detail(id), 'trophy'] as const,
};

/**
 * Departments Query Keys
 */
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...departmentKeys.lists(), filters] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

/**
 * Programs Query Keys
 */
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...programKeys.lists(), filters] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
};

/**
 * Teachers Query Keys
 */
export const teacherKeys = {
  all: ['teachers'] as const,
  lists: () => [...teacherKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...teacherKeys.lists(), filters] as const,
  details: () => [...teacherKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  classrooms: (id: string) => [...teacherKeys.detail(id), 'classrooms'] as const,
  students: (id: string) => [...teacherKeys.detail(id), 'students'] as const,
};

/**
 * Classrooms Query Keys
 */
export const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...classroomKeys.lists(), filters] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (id: string) => [...classroomKeys.details(), id] as const,
  students: (id: string) => [...classroomKeys.detail(id), 'students'] as const,
};

/**
 * Check-in Query Keys
 */
export const checkInKeys = {
  all: ['check-in'] as const,
  reports: () => [...checkInKeys.all, 'report'] as const,
  report: (params: {
    teacherId?: string;
    classroomId?: string;
    date?: string;
  }) => [...checkInKeys.reports(), params] as const,
  daily: (params: {
    teacherId: string;
    classroomId: string;
    date: string;
  }) => [...checkInKeys.reports(), 'daily', params] as const,
};

/**
 * User Projects Query Keys
 */
export const userProjectKeys = {
  all: ['user-projects'] as const,
  lists: () => [...userProjectKeys.all, 'list'] as const,
  list: (query?: string) => [...userProjectKeys.lists(), query] as const,
};

/**
 * Images Query Keys
 */
export const imageKeys = {
  all: ['images'] as const,
  image: (url: string, token?: string | null) => [...imageKeys.all, url, token] as const,
};

/**
 * PDFs Query Keys
 */
export const pdfKeys = {
  all: ['pdfs'] as const,
  pdf: (url: string) => [...pdfKeys.all, url] as const,
};

/**
 * Goodness Records Query Keys
 */
export const goodnessKeys = {
  all: ['goodness'] as const,
  lists: () => [...goodnessKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...goodnessKeys.lists(), filters] as const,
  student: (studentId: string) => [...goodnessKeys.all, 'student', studentId] as const,
};

/**
 * Badness Records Query Keys
 */
export const badnessKeys = {
  all: ['badness'] as const,
  lists: () => [...badnessKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...badnessKeys.lists(), filters] as const,
  student: (studentId: string) => [...badnessKeys.all, 'student', studentId] as const,
};

/**
 * Visits Query Keys
 */
export const visitKeys = {
  all: ['visits'] as const,
  lists: () => [...visitKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...visitKeys.lists(), filters] as const,
  details: () => [...visitKeys.all, 'detail'] as const,
  detail: (id: string) => [...visitKeys.details(), id] as const,
  student: (studentId: string) => [...visitKeys.all, 'student', studentId] as const,
};

/**
 * Users Query Keys
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
  auditLogs: (userName: string, skip?: number, take?: number) =>
    [...userKeys.all, 'audit-logs', userName, { skip, take }] as const,
};

/**
 * Helper function to invalidate all queries for an entity
 *
 * Example:
 * ```ts
 * queryClient.invalidateQueries({ queryKey: studentKeys.all });
 * ```
 */
export const queryKeys = {
  statistics: statisticsKeys,
  students: studentKeys,
  departments: departmentKeys,
  programs: programKeys,
  teachers: teacherKeys,
  classrooms: classroomKeys,
  checkIn: checkInKeys,
  userProjects: userProjectKeys,
  images: imageKeys,
  pdfs: pdfKeys,
  goodness: goodnessKeys,
  badness: badnessKeys,
  visits: visitKeys,
  users: userKeys,
} as const;

/**
 * Type helper for query keys
 */
export type QueryKeys = typeof queryKeys;
