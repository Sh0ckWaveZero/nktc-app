export default {
  meEndpoint: '/auth/me',
  loginEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken'
}
