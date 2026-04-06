import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { AddressesModule } from 'src/addresses/addresses.module';
import { TenantRepository } from './tenant.repository';
import { PrismaService } from 'database/prisma.service';
import { DokployModule } from 'src/dokploy/dokploy.module';
import { TenantProvisioningService } from './tenant-provisioning.service';

@Module({
  imports: [AddressesModule, DokployModule],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantRepository,
    TenantProvisioningService,
    PrismaService,
  ],
})
export class TenantModule {}
