import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'false',
});

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
  
  // Turbopack Configuration
  turbopack: {
    resolveAlias: {
      '@': './src',
      '@core': './src/@core',
      '@components': './src/components',
      '@layouts': './src/layouts',
      '@utils': './src/utils',
      '@hooks': './src/hooks',
      '@store': './src/store',
      '@configs': './src/configs',
      '@context': './src/context',
      '@services': './src/services',
      '@types': './src/types',
      '@views': './src/views',
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
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