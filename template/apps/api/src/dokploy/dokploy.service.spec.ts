import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DokployService } from './dokploy.service';

describe('DokployService', () => {
  let service: DokployService;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DokployService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                DOKPLOY_API_URL: 'https://dokploy.example.com',
                ENVIRONMENT_ID: 'env-1',
                POSTGRES_DOCKER_IMAGE: 'postgres:16',
                DOKPLOY_API_KEY: 'secret',
              };

              return values[key];
            }),
            get: jest.fn(() => undefined),
          },
        },
      ],
    }).compile();

    service = module.get<DokployService>(DokployService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns the created database URL', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ items: [], total: 0 })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ appName: 'tenant-app' })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ items: [], total: 0 })),
      });

    const result = await service.createPostgressDatabase({
      subdomain: 'tenant',
      companyName: 'Tenant GmbH',
    });

    expect(result.databaseUrl).toContain('@tenant-app:5432/tenant-db');
  });

  it('reuses an existing database before trying to create a new one', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            items: [
              {
                postgresId: 'pg-1',
                name: 'tenant',
                appName: 'tenant-app',
                createdAt: '2026-04-06T08:20:04.660Z',
              },
            ],
            total: 1,
          }),
        ),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            postgresId: 'pg-1',
            name: 'tenant',
            appName: 'tenant-app',
            databaseName: 'tenant-db',
            databaseUser: 'tenant-user',
            databasePassword: 'tenant-password',
            externalPort: 55432,
          }),
        ),
      });

    const result = await service.createPostgressDatabase({
      subdomain: 'tenant',
      companyName: 'Tenant GmbH',
    });

    expect(result.databaseUrl).toBe(
      'postgresql://tenant-user:tenant-password@dokploy.example.com:55432/tenant-db',
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('reuses an existing database when Dokploy reports a duplicate', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ items: [], total: 0 })),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ message: 'Database already exists' })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            items: [
              {
                postgresId: 'pg-2',
                name: 'tenant',
                appName: 'tenant-app',
                createdAt: '2026-04-06T08:20:04.660Z',
              },
            ],
            total: 1,
          }),
        ),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(
          JSON.stringify({
            postgresId: 'pg-2',
            name: 'tenant',
            appName: 'tenant-app',
            databaseName: 'tenant-db',
            databaseUser: 'tenant-user',
            databasePassword: 'tenant-password',
            externalPort: 55432,
          }),
        ),
      });

    const result = await service.createPostgressDatabase({
      subdomain: 'tenant',
      companyName: 'Tenant GmbH',
    });

    expect(result.databaseUrl).toBe(
      'postgresql://tenant-user:tenant-password@dokploy.example.com:55432/tenant-db',
    );
  });

  it('throws when Dokploy creation fails without a reusable database', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify({ items: [], total: 0 })),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ message: 'dokploy unavailable' })),
      });

    await expect(
      service.createPostgressDatabase({
        subdomain: 'tenant',
        companyName: 'Tenant GmbH',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
