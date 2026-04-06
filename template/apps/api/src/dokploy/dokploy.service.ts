import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { CreateTenantDto } from 'src/tenant/dto/create-tenant.dto';

interface DokployCreateDatabasePayload {
  name: string;
  appName: string;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  dockerImage: string;
  environmentId: string;
  description: string;
}

interface DokploySearchResponse {
  items?: unknown[];
  total?: number;
}

interface DokployConnectionCandidate {
  postgresId?: string;
  name?: string;
  appName?: string;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  databaseUrl?: string;
  externalPort?: number;
  createdAt?: string;
}

@Injectable()
export class DokployService {
  private readonly logger = new Logger(DokployService.name);
  dokployURl: string;
  environmentId: string;
  dockerImage: string;
  dokployApiKey: string;

  constructor(private readonly config: ConfigService) {
    this.dokployURl = this.config.getOrThrow<string>('DOKPLOY_API_URL');
    this.environmentId = this.config.getOrThrow<string>('ENVIRONMENT_ID');
    this.dockerImage = this.config.getOrThrow<string>('POSTGRES_DOCKER_IMAGE');
    this.dokployApiKey = this.config.getOrThrow<string>('DOKPLOY_API_KEY');
  }

  async createPostgressDatabase(
    createTenantDto: CreateTenantDto,
  ): Promise<{ databaseUrl: string }> {
    const existingDatabase = await this.findExistingDatabase(
      createTenantDto.subdomain,
    );

    if (existingDatabase) {
      this.logger.log(
        `Reusing existing Dokploy database for tenant ${createTenantDto.subdomain} before creating a new one.`,
      );

      return existingDatabase;
    }

    const requestPayload = this.buildCreatePayload(createTenantDto);
    const resp = await fetch(`${this.dokployURl}/postgres.create`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestPayload),
    });
    const data = await this.parseResponseBody(resp);

    if (!resp.ok) {
      if (this.isAlreadyExistsError(data)) {
        const duplicateDatabase = await this.findExistingDatabase(
          createTenantDto.subdomain,
        );

        if (duplicateDatabase) {
          this.logger.log(
            `Reusing existing Dokploy database for tenant ${createTenantDto.subdomain} after duplicate create response.`,
          );

          return duplicateDatabase;
        }
      }

      throw new InternalServerErrorException(
        `Failed to create database: ${this.extractErrorMessage(data)}`,
      );
    }

    const createdCandidate = this.extractConnectionCandidate(data);
    const createdDatabase =
      (createdCandidate?.databaseUrl || createdCandidate?.externalPort
        ? this.resolveDatabaseUrl(createdCandidate, requestPayload)
        : null) ??
      (await this.findExistingDatabase(createTenantDto.subdomain))?.databaseUrl ??
      this.resolveDatabaseUrl(createdCandidate, requestPayload);

    if (!createdDatabase) {
      throw new InternalServerErrorException(
        'Dokploy created the database, but no databaseUrl could be resolved',
      );
    }

    this.logger.log(
      `Successfully resolved Dokploy database URL for tenant ${createTenantDto.subdomain}.`,
    );

    return { databaseUrl: createdDatabase };
  }

  private buildCreatePayload(
    createTenantDto: CreateTenantDto,
  ): DokployCreateDatabasePayload {
    const dbPassword = randomBytes(18).toString('base64url').slice(0, 24);

    return {
      name: createTenantDto.subdomain,
      appName: `${createTenantDto.subdomain}-app`,
      databaseName: `${createTenantDto.subdomain}-db`,
      databaseUser: `${createTenantDto.subdomain}-user`,
      databasePassword: dbPassword,
      dockerImage: this.dockerImage,
      environmentId: this.environmentId,
      description: `Database for tenant ${createTenantDto.subdomain}`,
    };
  }

  private async findExistingDatabase(
    subdomain: string,
  ): Promise<{ databaseUrl: string } | null> {
    const response = await fetch(
      `${this.dokployURl}/postgres.search?name=${encodeURIComponent(subdomain)}&limit=50`,
      {
        method: 'GET',
        headers: this.buildHeaders(),
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await this.parseResponseBody(
      response,
    )) as DokploySearchResponse | null;
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const matches = items
      .map((item) => this.extractConnectionCandidate(item))
      .filter(
        (item): item is DokployConnectionCandidate =>
          item !== null && this.matchesSubdomain(item, subdomain),
      )
      .sort((left, right) =>
        (right.createdAt ?? '').localeCompare(left.createdAt ?? ''),
      );

    if (matches.length === 0) {
      return null;
    }

    if (matches.length > 1) {
      this.logger.warn(
        `Found ${matches.length} Dokploy databases for tenant ${subdomain}. Reusing the newest one.`,
      );
    }

    const selected = matches[0];

    if (!selected) {
      return null;
    }

    if (!selected.postgresId) {
      const databaseUrl = this.resolveDatabaseUrl(selected);
      return databaseUrl ? { databaseUrl } : null;
    }

    const details = await this.fetchPostgresById(selected.postgresId);

    if (!details) {
      return null;
    }

    const databaseUrl = this.resolveDatabaseUrl(details);

    return databaseUrl ? { databaseUrl } : null;
  }

  private async fetchPostgresById(
    postgresId: string,
  ): Promise<DokployConnectionCandidate | null> {
    const response = await fetch(
      `${this.dokployURl}/postgres.one?postgresId=${encodeURIComponent(postgresId)}`,
      {
        method: 'GET',
        headers: this.buildHeaders(),
      },
    );

    if (!response.ok) {
      return null;
    }

    return this.extractConnectionCandidate(await this.parseResponseBody(response));
  }

  private extractConnectionCandidate(
    payload: unknown,
  ): DokployConnectionCandidate | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const data = payload as Record<string, unknown>;
    const candidate: DokployConnectionCandidate = {
      postgresId: this.asString(data.postgresId),
      name: this.asString(data.name),
      appName: this.asString(data.appName),
      databaseName: this.asString(data.databaseName),
      databaseUser: this.asString(data.databaseUser),
      databasePassword: this.asString(data.databasePassword),
      externalPort:
        typeof data.externalPort === 'number' ? data.externalPort : undefined,
      createdAt: this.asString(data.createdAt),
      databaseUrl:
        this.asString(data.databaseUrl) ??
        this.asString(data.internalUrl) ??
        this.asString(data.connectionString) ??
        this.asString(data.postgresUrl),
    };

    if (
      !candidate.databaseUrl &&
      !(
        candidate.appName &&
        candidate.databaseName &&
        candidate.databaseUser &&
        candidate.databasePassword
      ) &&
      !candidate.postgresId
    ) {
      return null;
    }

    return candidate;
  }

  private resolveDatabaseUrl(
    candidate: DokployConnectionCandidate | null,
    fallback?: DokployCreateDatabasePayload,
  ): string | null {
    if (candidate?.databaseUrl) {
      return candidate.databaseUrl;
    }

    const databaseName = candidate?.databaseName ?? fallback?.databaseName;
    const databaseUser = candidate?.databaseUser ?? fallback?.databaseUser;
    const databasePassword =
      candidate?.databasePassword ?? fallback?.databasePassword;

    if (!databaseName || !databaseUser || !databasePassword) {
      return null;
    }

    if (candidate?.externalPort) {
      const externalHost = this.getDokployDatabaseHost();

      return `postgresql://${encodeURIComponent(databaseUser)}:${encodeURIComponent(databasePassword)}@${externalHost}:${candidate.externalPort}/${databaseName}`;
    }

    const appName = candidate?.appName ?? fallback?.appName;

    if (!appName) {
      return null;
    }

    return `postgresql://${encodeURIComponent(databaseUser)}:${encodeURIComponent(databasePassword)}@${appName}:5432/${databaseName}`;
  }

  private getDokployDatabaseHost(): string {
    const explicitHost = this.config.get<string>('DOKPLOY_DB_HOST');

    if (explicitHost) {
      return explicitHost;
    }

    return new URL(this.dokployURl).hostname;
  }

  private matchesSubdomain(
    candidate: DokployConnectionCandidate,
    subdomain: string,
  ): boolean {
    const expectedValues = new Set([
      subdomain,
      `${subdomain}-app`,
      `${subdomain}-db`,
      `${subdomain}-user`,
    ]);

    return [
      candidate.name,
      candidate.appName,
      candidate.databaseName,
      candidate.databaseUser,
    ].some((value) => value !== undefined && expectedValues.has(value));
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.dokployApiKey,
    };
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  private extractErrorMessage(payload: unknown): string {
    if (typeof payload === 'string' && payload.length > 0) {
      return payload;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) {
      return payload.message;
    }

    return 'Unknown error';
  }

  private isAlreadyExistsError(payload: unknown): boolean {
    const message = this.extractErrorMessage(payload).toLowerCase();

    return (
      message.includes('already exists') ||
      message.includes('duplicate') ||
      message.includes('unique')
    );
  }

  private asString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
