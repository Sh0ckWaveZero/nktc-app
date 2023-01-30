
export default () => ({
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  userAdmin: process.env.USER_ADMIN,
  userPassword: process.env.USER_PASSWORD,
  host: process.env.HOST,
  minioEndpoint: process.env.MINIO_ENDPOINT,
  minioPort: parseInt(process.env.MINIO_PORT, 10) || 9000,
  minioAccessKey: process.env.MINIO_ACCESS_KEY,
  minioSecretKey: process.env.MINIO_SECRET_KEY,
  minioUseSSL: process.env.MINIO_USE_SSL === 'true' ? true : false,
  minioBucket: process.env.MINIO_BUCKET_NAME,
  hostUrl: process.env.HOST_URL,
});
