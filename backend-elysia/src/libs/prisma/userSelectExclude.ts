/**
 * Sensitive user fields that should never be exposed in API responses
 */
const USER_SENSITIVE_FIELDS = {
  password: false,
  email: false,
  refreshToken: false,
  accessToken: false,
  expiresAt: false,
} as const;

/**
 * Standard user public select statement for Prisma queries
 * Includes: id, username, role, and full account info (without sensitive data)
 */
export const userPublicSelect = {
  id: true,
  username: true,
  role: true,
  account: {
    select: {
      id: true,
      title: true,
      firstName: true,
      lastName: true,
      avatar: true,
      idCard: true,
      birthDate: true,
      phone: true,
      addressLine1: true,
      subdistrict: true,
      district: true,
      province: true,
      postcode: true,
    },
  },
  ...USER_SENSITIVE_FIELDS,
} as const;

/**
 * Minimal user select for reports (goodness/badness)
 * Includes: only firstName, lastName, title, avatar from account
 */
export const userMinimalSelect = {
  account: {
    select: {
      firstName: true,
      lastName: true,
      title: true,
      avatar: true,
    },
  },
  ...USER_SENSITIVE_FIELDS,
} as const;
