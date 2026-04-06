import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const localRequire = createRequire(__filename);
const RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 500;

interface DatabasePackageJson {
  prisma?: {
    seed?: string;
  };
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  async pushSchemaWithRetry(databaseUrl: string): Promise<void> {
    await this.withRetry(
      async () => {
        await this.runPrismaCommand(['db', 'push'], databaseUrl);
      },
      'Prisma schema push',
    );
  }

  async seedWithRetry(
    databaseUrl: string,
    options?: { subdomain?: string },
  ): Promise<void> {
    if (!(await this.hasSeedScriptConfigured())) {
      this.logger.log(
        'Skipping tenant seed because no Prisma seed script is configured.',
      );
      return;
    }

    await this.withRetry(
      async () => {
        await this.runPrismaCommand(['db', 'seed'], databaseUrl, {
          PRISMA_SCHEMA_TARGET: 'tenant',
          TENANT_SEED_SUBDOMAIN: options?.subdomain ?? 'tenant',
        });
      },
      'Prisma seed',
    );
  }

  private async runPrismaCommand(
    args: string[],
    databaseUrl: string,
    extraEnv: Record<string, string> = {},
  ): Promise<void> {
    const databasePackageDir = await this.getDatabasePackageDir();
    const schemaPath = path.join(databasePackageDir, 'prisma/tenant-schema.prisma');
    const prismaCliPath = localRequire.resolve('prisma/build/index.js', {
      paths: [databasePackageDir],
    });

    await new Promise<void>((resolve, reject) => {
      execFile(
        process.execPath,
        [prismaCliPath, ...args, '--schema', schemaPath],
        {
          cwd: databasePackageDir,
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
            ...extraEnv,
          },
          maxBuffer: 10 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (!error) {
            resolve();
            return;
          }

          const output = stderr || stdout || error.message;
          const enrichedOutput = this.enrichPrismaConnectionError(
            output,
            databaseUrl,
          );

          reject(
            new InternalServerErrorException(
              `${args.join(' ')} failed: ${enrichedOutput.trim()}`,
            ),
          );
        },
      );
    });
  }

  private async withRetry(
    task: () => Promise<void>,
    label: string,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
      try {
        await task();
        return;
      } catch (error) {
        lastError = error;

        if (attempt === RETRY_ATTEMPTS) {
          break;
        }

        const backoffMs = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);

        this.logger.warn(
          `${label} failed on attempt ${attempt}/${RETRY_ATTEMPTS}. Retrying in ${backoffMs}ms.`,
        );

        await delay(backoffMs);
      }
    }

    throw lastError;
  }

  private async hasSeedScriptConfigured(): Promise<boolean> {
    const databasePackageDir = await this.getDatabasePackageDir();
    const packageJsonPath = path.join(databasePackageDir, 'package.json');
    const packageJson = JSON.parse(
      await readFile(packageJsonPath, 'utf8'),
    ) as DatabasePackageJson;

    const configuredSeedScript = packageJson.prisma?.seed;

    if (!configuredSeedScript) {
      return false;
    }

    const seedFilePath = path.join(databasePackageDir, 'prisma/seed.ts');

    try {
      await access(seedFilePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async getDatabasePackageDir(): Promise<string> {
    const workspaceRoot = await this.findWorkspaceRoot(process.cwd());
    const databasePackageDir = path.join(workspaceRoot, 'packages/database');

    await access(databasePackageDir, constants.F_OK);

    return databasePackageDir;
  }

  private async findWorkspaceRoot(startDir: string): Promise<string> {
    let currentDir = path.resolve(startDir);

    while (true) {
      const workspaceMarker = path.join(currentDir, 'pnpm-workspace.yaml');

      try {
        await access(workspaceMarker, constants.F_OK);
        return currentDir;
      } catch {
        const parentDir = path.dirname(currentDir);

        if (parentDir === currentDir) {
          throw new InternalServerErrorException(
            'Could not locate workspace root for tenant provisioning',
          );
        }

        currentDir = parentDir;
      }
    }
  }

  private enrichPrismaConnectionError(
    output: string,
    databaseUrl: string,
  ): string {
    if (!output.includes('P1001')) {
      return output;
    }

    let hostname: string;

    try {
      hostname = new URL(databaseUrl).hostname;
    } catch {
      return output;
    }

    if (!hostname.includes('-app-')) {
      return output;
    }

    return `${output}\n\nDokploy returned the internal hostname ${hostname}. This hostname usually works only from containers in the Dokploy network. If apps/api is running locally, configure an external Dokploy database port or run the provisioning worker inside Dokploy.`;
  }
}
