import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from '@workspace/database';

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code === 'P2002'
  );
}

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {}

  async findOne(tenantId: string) {
    return this.prisma.db.tenant.findUnique({
      where: { tenantId },
    });
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.prisma.db.tenant.findUnique({
      where: { subdomain },
    });
  }

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.findBySubdomain(createTenantDto.subdomain);

    if (existing) {
      return this.ensureRetryCompatible(existing, createTenantDto);
    }

    const { addressId, dbUrl, ...rest } = createTenantDto;

    if (!addressId || !dbUrl) {
      throw new InternalServerErrorException(
        'Tenant persistence requires addressId and dbUrl after provisioning',
      );
    }

    try {
      const tenant = await this.prisma.db.tenant.create({
        data: {
          ...rest,
          addressId,
          dbUrl,
          isConfigured: true,
        },
      });
      return tenant;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const concurrentTenant = await this.findBySubdomain(
          createTenantDto.subdomain,
        );

        if (concurrentTenant) {
          return this.ensureRetryCompatible(concurrentTenant, createTenantDto);
        }
      }

      throw error;
    }
  }

  async update(tenantId: string, data: any) {}

  async delete(tenantId: string) {}

  private ensureRetryCompatible(existing: Tenant, next: CreateTenantDto): Tenant {
    const hasConflict =
      existing.addressId !== next.addressId ||
      existing.dbUrl !== next.dbUrl ||
      existing.companyName !== next.companyName ||
      existing.description !== (next.description ?? null);

    if (hasConflict) {
      throw new BadRequestException(
        `Tenant with subdomain ${next.subdomain} already exists with different data`,
      );
    }

    return existing;
  }
}
