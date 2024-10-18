import { env } from 'bun';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './src/drizzle',
  schema: './src/drizzle/schema.ts',
  dbCredentials: {
    url: env.DRIZZLE_DATABASE_URL! as string,
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
