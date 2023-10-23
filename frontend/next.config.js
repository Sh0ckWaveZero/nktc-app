// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

// /** @type {import('next').NextConfig} */
// module.exports = withBundleAnalyzer({
//   trailingSlash: true,
//   reactStrictMode: false,
//   output: 'standalone',
//   webpack: config => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//     }

//     return config
//   }
// });

const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules');

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  output: 'standalone',
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
  experimental: {
    optimizePackageImports: [
      '@core/styles/libs/thailand-address',
      '@iconify/react',
      '@material-ui/core',
      '@material-ui/icons',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      '@pdf-lib/fontkit',
      '@pdf-lib/pdf-lib',
      '@tanstack/react-query',
      'clsx',
      'mdi-material-ui',
      'mui-core',
      'react-hook-form',
      'react-icons/ai',
      'react-icons/bi',
      'react-icons/bs',
      'react-icons/cg',
      'react-icons/ci',
      'react-icons/di',
      'react-icons/fa',
      'react-icons/fa6',
      'react-icons/fc',
      'react-icons/fi',
      'react-icons/gi',
      'react-icons/go',
      'react-icons/gr',
      'react-icons/hi',
      'react-icons/hi2',
      'react-icons/im',
      'react-icons/io',
      'react-icons/io5',
      'react-icons/lia',
      'react-icons/lib',
      'react-icons/lu',
      'react-icons/md',
      'react-icons/pi',
      'react-icons/ri',
      'react-icons/rx',
      'react-icons/si',
      'react-icons/sl',
      'react-icons/tb',
      'react-icons/tfi',
      'react-icons/ti',
      'react-icons/vsc',
      'react-icons/wi',
      'react-password-strength-bar',
      'react-spring',
      'react-use',
      'sweetalert2',
    ]
  }
};

module.exports = withPlugins([withTM], nextConfig);