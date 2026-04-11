import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { execFile } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { Socket } from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { hash } from 'bcryptjs';

const RETRY_ATTEMPTS = 10;
const INITIAL_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 5000;
const DB_READINESS_TIMEOUT_MS = 2000;

interface TenantProvisioningAddressInput {
  addressId?: string;
  city?: string;
  country?: string;
  postCode?: string;
  state?: string;
  streetName?: string;
  streetNumber?: string;
}

interface TenantProvisioningSeedOptions {
  subdomain?: string;
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  iban?: string;
  companyNumber?: string;
  address?: TenantProvisioningAddressInput;
  superAdmin?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  };
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  private static readonly DEFAULT_SUPER_ADMIN_FIRST_NAME = 'Super';
  private static readonly DEFAULT_SUPER_ADMIN_LAST_NAME = 'Admin';
  private static readonly DEFAULT_SUPER_ADMIN_EMAIL_LOCAL_PART = 'admin';
  private static readonly DEFAULT_SITE_CONFIG_EMAIL_LOCAL_PART = 'office';
  private static readonly DEFAULT_PHONE_NUMBER = '+430000000000';
  private static readonly DEFAULT_IBAN = 'AT000000000000000000';
  private static readonly DEFAULT_COMPANY_NUMBER = 'PENDING';
  private static readonly DEFAULT_SUPER_ADMIN_PASSWORD = 'kennwort1';
  private static readonly DEFAULT_SUPER_ADMIN_EMAIL = 'admin@admin.com';

  private buildNormalizedSeedPayload(
    options?: TenantProvisioningSeedOptions,
  ): TenantProvisioningSeedOptions {
    const normalizedSubdomain = options?.subdomain?.trim() || 'tenant';
    const normalizedCompanyName =
      options?.companyName?.trim() || normalizedSubdomain;
    const normalizedAddress = this.normalizeAddress(options?.address);
    const normalizedEmailDomain = `${normalizedSubdomain}.admin.local`;

    return {
      subdomain: normalizedSubdomain,
      companyName: normalizedCompanyName,
      email:
        options?.email?.trim() ||
        `${TenantProvisioningService.DEFAULT_SITE_CONFIG_EMAIL_LOCAL_PART}@${normalizedEmailDomain}`,
      phoneNumber:
        options?.phoneNumber?.trim() ||
        TenantProvisioningService.DEFAULT_PHONE_NUMBER,
      iban: options?.iban?.trim() || TenantProvisioningService.DEFAULT_IBAN,
      companyNumber:
        options?.companyNumber?.trim() ||
        TenantProvisioningService.DEFAULT_COMPANY_NUMBER,
      address: normalizedAddress,
      superAdmin: {
        email:
          options?.superAdmin?.email?.trim() ||
          options?.email?.trim() ||
          `${TenantProvisioningService.DEFAULT_SUPER_ADMIN_EMAIL_LOCAL_PART}@${normalizedEmailDomain}`,
        firstName:
          options?.superAdmin?.firstName?.trim() ||
          TenantProvisioningService.DEFAULT_SUPER_ADMIN_FIRST_NAME,
        lastName:
          options?.superAdmin?.lastName?.trim() ||
          TenantProvisioningService.DEFAULT_SUPER_ADMIN_LAST_NAME,
        password:
          options?.superAdmin?.password?.trim() ||
          TenantProvisioningService.DEFAULT_SUPER_ADMIN_PASSWORD,
      },
    };
  }

  private normalizeAddress(
    address?: TenantProvisioningAddressInput,
  ): TenantProvisioningAddressInput {
    return {
      addressId: address?.addressId,
      city: address?.city?.trim() || 'Unknown City',
      country: address?.country?.trim() || 'Unknown Country',
      postCode: address?.postCode?.trim() || '0000',
      state: address?.state?.trim() || 'Unknown State',
      streetName: address?.streetName?.trim() || 'Unknown Street',
      streetNumber: address?.streetNumber?.trim() || '0',
    };
  }

  async pushSchemaWithRetry(databaseUrl: string): Promise<void> {
    await this.withRetry(async (attempt) => {
      await this.waitForDatabaseReady(databaseUrl, attempt);
      await this.runPrismaCommand(['db', 'push'], databaseUrl);
    }, 'Prisma schema push');
  }

  async seedWithRetry(
    databaseUrl: string,
    options?: TenantProvisioningSeedOptions,
  ): Promise<void> {
    const payload = this.buildNormalizedSeedPayload(options);

    await this.withRetry(async (attempt) => {
      await this.waitForDatabaseReady(databaseUrl, attempt);
      await this.runPsqlSeed(databaseUrl, payload);
    }, 'PostgreSQL seed');
  }

  buildSeedPreview(
    options?: TenantProvisioningSeedOptions,
  ): TenantProvisioningSeedOptions {
    return this.buildNormalizedSeedPayload(options);
  }

  private async runPsqlSeed(
    databaseUrl: string,
    payload: TenantProvisioningSeedOptions,
  ): Promise<void> {
    const normalizedPayload = this.buildNormalizedSeedPayload(payload);
    const databasePackageDir = await this.getDatabasePackageDir();
    const seedFilePath = path.join(
      databasePackageDir,
      'prisma',
      'tenant-seed.sql',
    );

    await access(seedFilePath, constants.F_OK);

    const passwordHash = await hash(
      normalizedPayload.superAdmin?.password?.trim() ||
        TenantProvisioningService.DEFAULT_SUPER_ADMIN_PASSWORD,
      10,
    );

    const psqlArgs = [
      '--dbname',
      databaseUrl,
      '-v',
      'ON_ERROR_STOP=1',
      '-v',
      `company_name=${normalizedPayload.companyName ?? ''}`,
      '-v',
      `site_email=${normalizedPayload.email ?? ''}`,
      '-v',
      `phone_number=${normalizedPayload.phoneNumber ?? ''}`,
      '-v',
      `iban=${normalizedPayload.iban ?? ''}`,
      '-v',
      `company_number=${normalizedPayload.companyNumber ?? ''}`,
      '-v',
      `address_city=${normalizedPayload.address?.city ?? ''}`,
      '-v',
      `address_country=${normalizedPayload.address?.country ?? ''}`,
      '-v',
      `address_post_code=${normalizedPayload.address?.postCode ?? ''}`,
      '-v',
      `address_state=${normalizedPayload.address?.state ?? ''}`,
      '-v',
      `address_street_name=${normalizedPayload.address?.streetName ?? ''}`,
      '-v',
      `address_street_number=${normalizedPayload.address?.streetNumber ?? ''}`,
      '-v',
      `super_admin_email=${normalizedPayload.superAdmin?.email ?? ''}`,
      '-v',
      `super_admin_password_hash=${passwordHash}`,
      '-v',
      `super_admin_first_name=${normalizedPayload.superAdmin?.firstName ?? ''}`,
      '-v',
      `super_admin_last_name=${normalizedPayload.superAdmin?.lastName ?? ''}`,
      '-f',
      seedFilePath,
    ];

    await new Promise<void>((resolve, reject) => {
      execFile(
        'psql',
        psqlArgs,
        {
          env: {
            ...process.env,
          },
          maxBuffer: 10 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (!error) {
            this.logger.log(
              `psql seed completed successfully for ${new URL(databaseUrl).hostname}`,
            );

            if (stdout?.trim()) {
              this.logger.log(`psql seed stdout: ${stdout.trim()}`);
            }
            resolve();
            return;
          }

          const output = [stderr, stdout, error.message]
            .filter((value) => Boolean(value && value.trim()))
            .join('\n')
            .trim();

          const enrichedOutput = this.enrichPrismaConnectionError(
            output,
            databaseUrl,
          );

          this.logger.error(
            `psql seed failed for ${databaseUrl}: ${enrichedOutput}`,
          );

          reject(
            new InternalServerErrorException(
              `psql seed failed: ${enrichedOutput}`,
            ),
          );
        },
      );
    });
  }

  private async waitForDatabaseReady(
    databaseUrl: string,
    attempt: number,
  ): Promise<void> {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = Number(url.port || 5432);

    this.logger.log(
      `Checking database readiness for ${host}:${port} before attempt ${attempt}/${RETRY_ATTEMPTS}`,
    );

    await this.waitForTcpConnection(host, port);
  }

  private async waitForTcpConnection(
    host: string,
    port: number,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const socket = new Socket();
      let settled = false;

      const cleanup = () => {
        socket.removeAllListeners();
        socket.destroy();
      };

      const succeed = () => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve();
      };

      const fail = (error: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        reject(
          new InternalServerErrorException(
            `Database host ${host}:${port} is not reachable yet: ${error.message}`,
          ),
        );
      };

      socket.setTimeout(DB_READINESS_TIMEOUT_MS);
      socket.once('connect', succeed);
      socket.once('timeout', () =>
        fail(
          new Error(`connection timed out after ${DB_READINESS_TIMEOUT_MS}ms`),
        ),
      );
      socket.once('error', fail);
      socket.connect(port, host);
    });
  }

  private async runPrismaCommand(
    args: string[],
    databaseUrl: string,
    extraEnv: Record<string, string> = {},
  ): Promise<void> {
    const databasePackageDir = await this.getDatabasePackageDir();
    const schemaPath = await this.resolveTenantSchemaPath(databasePackageDir);
    const prismaCliPath = require.resolve('prisma/build/index.js', {
      paths: [databasePackageDir],
    });
    const prismaConfigPath = path.join(databasePackageDir, 'prisma.config.ts');

    await new Promise<void>((resolve, reject) => {
      execFile(
        process.execPath,
        [
          prismaCliPath,
          ...args,
          '--schema',
          schemaPath,
          '--config',
          prismaConfigPath,
        ],
        {
          cwd: databasePackageDir,
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
            TENANT_DATABASE_URL: databaseUrl,
            ...extraEnv,
          },
          maxBuffer: 10 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (!error) {
            this.logger.log(
              `${args.join(' ')} completed successfully for ${new URL(databaseUrl).hostname}`,
            );

            if (stdout?.trim()) {
              this.logger.log(`${args.join(' ')} stdout: ${stdout.trim()}`);
            }
            resolve();
            return;
          }

          const output = [stderr, stdout, error.message]
            .filter((value) => Boolean(value && value.trim()))
            .join('\n')
            .trim();
          const enrichedOutput = this.enrichPrismaConnectionError(
            output,
            databaseUrl,
          );

          this.logger.error(
            `${args.join(' ')} failed for ${databaseUrl}: ${enrichedOutput}`,
          );

          reject(
            new InternalServerErrorException(
              `${args.join(' ')} failed: ${enrichedOutput}`,
            ),
          );
        },
      );
    });
  }

  private async withRetry(
    task: (attempt: number) => Promise<void>,
    label: string,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
      try {
        await task(attempt);
        return;
      } catch (error) {
        lastError = error;

        if (attempt === RETRY_ATTEMPTS) {
          break;
        }

        const backoffMs = Math.min(
          INITIAL_BACKOFF_MS * 2 ** (attempt - 1),
          MAX_BACKOFF_MS,
        );

        const message =
          error instanceof Error ? error.message : 'Unknown retry error';

        this.logger.warn(
          `${label} failed on attempt ${attempt}/${RETRY_ATTEMPTS}. Retrying in ${backoffMs}ms. Reason: ${message}`,
        );

        await delay(backoffMs);
      }
    }

    throw lastError;
  }

  private async resolveTenantSchemaPath(
    databasePackageDir: string,
  ): Promise<string> {
    const prismaDir = path.join(databasePackageDir, 'prisma');
    const preferredSchemaPaths = [
      path.join(prismaDir, 'schema.tenant.prisma'),
      path.join(prismaDir, 'tenant-schema.prisma'),
      path.join(prismaDir, 'schema.prisma'),
    ];

    for (const schemaPath of preferredSchemaPaths) {
      try {
        await access(schemaPath, constants.F_OK);
        return schemaPath;
      } catch {
        // continue
      }
    }

    try {
      const prismaEntries = await readdir(prismaDir);
      const prismaSchemaFile = prismaEntries.find((entry) =>
        entry.endsWith('.prisma'),
      );

      if (prismaSchemaFile) {
        return path.join(prismaDir, prismaSchemaFile);
      }
    } catch {
      // fall through to the final error below
    }

    throw new InternalServerErrorException(
      `Could not locate a Prisma schema file in ${prismaDir}`,
    );
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

    if (
      output.includes('Command failed') ||
      output.includes('tsx: not found') ||
      output.includes('ts-node: not found') ||
      output.includes('Cannot find module')
    ) {
      return `${output}\n\nThe tenant seed command was started, but the runtime image is missing the seed runner or one of its files/dependencies. In production this usually means the Docker image does not contain prisma/seed.ts, the compiled seed file, or the tsx/ts-node runtime needed by the configured Prisma seed command.`;
    }

    return `${output}\n\nDokploy returned the internal hostname ${hostname}. This hostname usually works only from containers in the Dokploy network. If apps/api is running locally, configure an external Dokploy database port or run the provisioning worker inside Dokploy.`;
  }
}
