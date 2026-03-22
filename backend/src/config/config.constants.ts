export const CONFIG_KEYS = {
  NODE_ENV: 'node_env',
  PORT: 'port',
  HOST: 'host',
  HOST_URL: 'hostUrl',
  APP_NAME: 'appName',
  
  JWT_SECRET: 'jwtSecret',
  JWT_EXPIRES_IN: 'jwtExpiresIn',
  JWT_REFRESH_SECRET: 'jwtRefreshSecret',
  JWT_REFRESH_EXPIRES_IN: 'jwtRefreshExpiresIn',
  
  USER_ADMIN: 'userAdmin',
  USER_PASSWORD: 'userPassword',
  
  MINIO_ENDPOINT: 'minioEndpoint',
  MINIO_PORT: 'minioPort',
  MINIO_ACCESS_KEY: 'minioAccessKey',
  MINIO_SECRET_KEY: 'minioSecretKey',
  MINIO_USE_SSL: 'minioUseSSL',
  MINIO_BUCKET_NAME: 'minioBucket',
  
  EDUCATION_YEARS: 'educationYears',
  
  CORS_ALLOWED_DOMAINS: 'corsAllowedDomains',
  CORS_DEV_ORIGINS: 'corsDevOrigins',
  CORS_MAX_AGE: 'corsMaxAge',
  CORS_PRODUCTION_METHODS: 'corsProductionMethods',
} as const;

export type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];