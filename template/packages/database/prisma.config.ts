import path from 'node:path';
import { defineConfig } from 'prisma/config';

const loadEnvFile = Reflect.get(process, 'loadEnvFile') as
  | undefined
  | ((path?: string) => void);

const envFilePath = path.resolve(import.meta.dirname, '.env');

try {
  loadEnvFile?.(envFilePath);
} catch (error) {
  if (
    !(error instanceof Error) ||
    !('code' in error) ||
    error.code !== 'ENOENT'
  ) {
    throw error;
  }
}

export default defineConfig({
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
