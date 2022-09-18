// ** Types
import { ThemeColor } from '@/@core/layouts/types'

export type TeacherLayoutType = {
  id: string | undefined
}

export type teachersTypes = {
  id: number
  role: string
  email: string
  status: string
  avatar: string
  company: string
  country: string
  contact: string
  fullName: string
  username: string
  currentPlan: string
  avatarColor?: ThemeColor
}


export type Classroom = {
  id?: string;
  classroomId?: string;
  name?: string;
  description?: string;
  levelId?: string;
  programId?: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
  level?: Level;
  program?: Program;
}

export type Level = {
  id?: string;
  levelId?: string;
  levelName?: string;
  levelFullName?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
}

export type Program = {
  id?: string;
  programId?: string;
  name?: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdBy?: string;
  level?: Level;
}