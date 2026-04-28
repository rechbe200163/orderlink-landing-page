import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  private tenants: any[] = [];
  private idCounter = 1;

  async createNew(tenant: any, address: any) {
    const newTenant = {
      id: this.idCounter++,
      ...tenant,
      address,
      createdAt: new Date(),
    };

    this.tenants.push(newTenant);

    return newTenant;
  }

  async create(createTenantDto: CreateTenantDto) {
    const newTenant = {
      id: this.idCounter++,
      ...createTenantDto,
      createdAt: new Date(),
    };

    this.tenants.push(newTenant);

    return newTenant;
  }

  async findAll() {
    return this.tenants;
  }

  async findOne(id: number) {
    const tenant = this.tenants.find((t) => t.id === id);

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    return tenant;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.findOne(id);

    Object.assign(tenant, updateTenantDto, {
      updatedAt: new Date(),
    });

    return tenant;
  }

  async remove(id: number) {
    const index = this.tenants.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    const deleted = this.tenants[index];
    this.tenants.splice(index, 1);

    return deleted;
  }
}
