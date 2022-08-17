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