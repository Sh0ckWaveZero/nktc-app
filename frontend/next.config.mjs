import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'false',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic Configuration
  trailingSlash: true,
  reactStrictMode: false,
  output: 'standalone',
  
  // Performance & Optimization
  poweredByHeader: false,
  compress: true,
  
  // Image Optimization
  images: {
    domains: ['localhost', 'nktc-stu.com', 'cdn.nktc-stu.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers for Security & Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack Configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        mui: {
          name: 'mui',
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          chunks: 'all',
          priority: 10,
        },
        icons: {
          name: 'icons',
          test: /[\\/]node_modules[\\/](react-icons|@iconify)[\\/]/,
          chunks: 'all',
          priority: 10,
        },
      };
    }
    
    // Resolve aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
      '@core': new URL('./src/@core', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@layouts': new URL('./src/layouts', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@hooks': new URL('./src/hooks', import.meta.url).pathname,
      '@store': new URL('./src/store', import.meta.url).pathname,
      '@configs': new URL('./src/configs', import.meta.url).pathname,
      '@context': new URL('./src/context', import.meta.url).pathname,
      '@services': new URL('./src/services', import.meta.url).pathname,
      '@types': new URL('./src/types', import.meta.url).pathname,
      '@views': new URL('./src/views', import.meta.url).pathname,
    };
    
    return config;
  },
  
  // Experimental Features for Next.js 15
  experimental: {
    // Optimize package imports for better performance
    optimizePackageImports: [
      // Core UI Libraries
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      
      // Icon Libraries
      '@iconify/react',
      'mdi-material-ui',
      'react-icons',
      
      // Form & State Management
      'react-hook-form',
      '@tanstack/react-query',
      'zustand',
      
      // PDF & File Processing
      'pdf-lib',
      '@pdf-lib/fontkit',
      
      // Animation & UI Enhancement
      'react-spring',
      'react-confetti',
      'sweetalert2',
      
      // Utilities
      'clsx',
      'date-fns',
      'dayjs',
      'react-use',
      'react-password-strength-bar',
    ],
  },
  
  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Environment Variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default withBundleAnalyzer(nextConfig);