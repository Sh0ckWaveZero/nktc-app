import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for faster DOM operations (lighter than jsdom)
    environment: 'happy-dom',

    // Global test setup
    globals: true,

    // Setup files
    setupFiles: ['./vitest.setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types/**',
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Include patterns
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Timeout for tests
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/@core'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@configs': path.resolve(__dirname, './src/configs'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@views': path.resolve(__dirname, './src/views'),
    },
  },
});
