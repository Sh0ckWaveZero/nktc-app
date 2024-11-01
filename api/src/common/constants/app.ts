export const DEFAULT = {
  JWT_ACCESS_TOKEN_EXPIRED: '1H',
  JWT_REFRESH_TOKEN_EXPIRED: '14d',
  PAGING_LIMIT: 10,
  PAGING_OFFSET: 0,
  PASSWORD_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  USER_NAME_MAX_LENGTH: 50,
  USER_NAME_MIN_LENGTH: 3,
};

export enum HEADER_KEY {
  AUTHORIZATION = 'authorization',
  X_TIMEZONE = 'x-timezone',
  X_CUSTOM_LANGUAGE = 'x-custom-lang',
  X_TIMESTAMP = 'x-timestamp',
  X_REQUEST_ID = 'x-request-id',
  X_VERSION = 'x-version',
  X_REPO_VERSION = 'x-repo-version',
  USER_AGENT = 'User-Agent',
}

export const swaggerOptions = {
  info: {
    title: 'NKTC Documentation',
    description: 'Development documentation',
    contact: {
      name: 'MidSeeLee',
    },
    license: { name: 'MIT', url: 'https://opensource.org/license/mit' },
    termsOfService: 'termsOfService',
  },
  tags: {
    auth: { name: 'Auth', description: 'Authentication endpoints' },
    app: { name: 'App', description: 'General endpoints' },
    user: { name: 'User', description: 'User endpoints' },
    setting: { name: 'Setting', description: 'Setting endpoints' },
    device: { name: 'Device', description: 'Device management endpoints' },
    permission: { name: 'Permission', description: 'Permission endpoints' },
    role: { name: 'Role', description: 'Role endpoints' },
  },
};
