import { Classroom } from '@/types/apps/teacherTypes';

// ** Types
export interface LoginCountByUser {
	date: string;
	count: number;
}

export interface TeacherAccount {
	id: string;
	title?: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	idCard?: string;
	birthDate?: Date | string | null;
	phone?: string;
}

export interface TeacherUser {
	id: string;
	username: string;
	email?: string;
	role: string;
	account?: TeacherAccount;
}

export interface Teacher {
	id: string;
	teacherId?: string;
	jobTitle?: string;
	academicStanding?: string;
	classroomIds?: string[];
	programId?: string;
	departmentId?: string;
	levelClassroomId?: string;
	status?: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	updatedBy?: string;
	createdBy?: string;
	user?: TeacherUser;
	department?: any;
	classrooms?: any[];
	teacherOnClassroom?: string[];
	classroomNames?: string[];
	loginCountByUser?: LoginCountByUser[];
	[key: string]: unknown;
}

export type TeacherArray = Teacher[];

export type TeacherResponse =
	| TeacherArray
	| { data: TeacherArray }
	| { teachers: TeacherArray }
	| { items: TeacherArray }
	| null
	| undefined;

export interface UpdateClassroomInfo {
	id: string;
	classrooms: string[];
	teacherInfo?: string;
}

export interface AddTeacherInfo {
	fullName: string;
	password: string;
	[key: string]: unknown;
}

export interface UpdateTeacherBody {
	user: { id?: string };
	teacher: Teacher;
	account: { id?: string };
}

// ** Helper Functions
export const extractTeacherArray = (data: TeacherResponse): TeacherArray => {
	if (!data) {
		return [];
	}

	if (Array.isArray(data)) {
		return data;
	}

	if (typeof data === 'object') {
		if ('data' in data && Array.isArray(data.data)) {
			return data.data;
		}
		if ('teachers' in data && Array.isArray(data.teachers)) {
			return data.teachers;
		}
		if ('items' in data && Array.isArray(data.items)) {
			return data.items;
		}
	}

	return [];
};

export const getFullName = (teacher: Teacher): string => {
	const title = teacher.user?.account?.title || '';
	const firstName = teacher.user?.account?.firstName || '';
	const lastName = teacher.user?.account?.lastName || '';
	return `${title}${firstName} ${lastName}`.trim();
};

export const getClassroomDefaultValues = (
	currentData: Teacher | null,
	classrooms: Classroom[]
): Classroom[] => {
	if (!currentData?.teacherOnClassroom) {
		return [];
	}

	return classrooms.filter((item: Classroom) => {
		const classroomId = item.id || item.classroomId;
		return classroomId && currentData.teacherOnClassroom?.includes(classroomId);
	});
};

// ** Helper to get flattened data for display
export const getTeacherDisplayData = (teacher: Teacher) => {
	return {
		id: teacher.id,
		username: teacher.user?.username || '',
		email: teacher.user?.email || '',
		role: teacher.user?.role || 'Teacher',
		title: teacher.user?.account?.title || '',
		firstName: teacher.user?.account?.firstName || '',
		lastName: teacher.user?.account?.lastName || '',
		avatar: teacher.user?.account?.avatar || '',
		accountId: teacher.user?.account?.id,
		teacherId: teacher.teacherId || teacher.id,
		jobTitle: teacher.jobTitle || '',
		status: teacher.status || '',
		teacherOnClassroom: teacher.teacherOnClassroom || [],
		classrooms: teacher.classroomNames || [],
		loginCountByUser: teacher.loginCountByUser || [],
	};
};