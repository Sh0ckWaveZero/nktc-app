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
    : 'http://localhost:3000/api' // production api
}

const images = {
  domains: ["www.logo-th.com"]
}

// const optimizeFonts = true;

module.exports = { nextConfig, serverRuntimeConfig, publicRuntimeConfig, images };