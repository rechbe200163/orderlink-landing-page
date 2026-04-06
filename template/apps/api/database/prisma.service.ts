import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@workspace/database';

function instantiatePrisma(databaseUrl: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

type PrismaWithPagination = PrismaClient;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly db: PrismaWithPagination;

  constructor(config: ConfigService) {
    const databaseUrl = config.getOrThrow<string>('DATABASE_URL');
    this.db = instantiatePrisma(databaseUrl);
  }

  async onModuleInit() {
    await this.db.$connect();
  }

  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}
