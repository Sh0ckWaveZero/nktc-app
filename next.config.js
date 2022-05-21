/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const serverRuntimeConfig = {
  secret: process.env.SECRET
}

const publicRuntimeConfig = {
  apiUrl: process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api' // development api
    : process.env.HOST // production api
}

const images = {
  domains: ['localhost', 'vercel.com', 'vercel.app'],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}

// const optimizeFonts = true;

module.exports = { nextConfig, serverRuntimeConfig, publicRuntimeConfig, images };