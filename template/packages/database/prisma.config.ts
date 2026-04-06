import path from 'node:path';
import { defineConfig } from 'prisma/config';

const loadEnvFile = Reflect.get(process, 'loadEnvFile') as
  | undefined
  | ((path?: string) => void);

loadEnvFile?.(path.resolve(import.meta.dirname, '.env'));

export default defineConfig({
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
