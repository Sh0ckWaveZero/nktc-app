export const Roles = {
  Admin: 'Admin',
  Teacher: 'Teacher',
  Student: 'Student',
  Parent: 'Parent',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
