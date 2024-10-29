export const DEFAULT = {
  JWT_ACCESS_TOKEN_EXPIRED: '1H',
  JWT_REFRESH_TOKEN_EXPIRED: '14d',
  PAGING_LIMIT: 10,
  PAGING_OFFSET: 0,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
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
