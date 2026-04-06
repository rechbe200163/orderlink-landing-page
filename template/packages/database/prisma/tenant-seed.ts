import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as bcrypt from 'bcrypt';

type TenantPrismaClient = {
  role: {
    upsert(args: Record<string, unknown>): Promise<{ roleId: string }>;
  };
  action: {
    upsert(args: Record<string, unknown>): Promise<void>;
    findMany(args: Record<string, unknown>): Promise<Array<{ id: string }>>;
  };
  resource: {
    upsert(args: Record<string, unknown>): Promise<void>;
    findMany(args: Record<string, unknown>): Promise<Array<{ id: string }>>;
  };
  permission: {
    upsert(args: Record<string, unknown>): Promise<void>;
  };
  employees: {
    upsert(args: Record<string, unknown>): Promise<void>;
  };
  $disconnect(): Promise<void>;
};

const DEFAULT_ACTIONS = [
  { key: 'create', description: 'Create permission' },
  { key: 'read', description: 'Read permission' },
  { key: 'update', description: 'Update permission' },
  { key: 'delete', description: 'Delete permission' },
  { key: 'manage', description: 'Full management permission' },
] as const;

const DEFAULT_RESOURCES = [
  { key: 'all', description: 'Wildcard resource for superadmin access' },
] as const;
const SUPER_ADMIN_PASSWORD = 'kennwort1';

async function instantiateTenantPrismaClient(): Promise<TenantPrismaClient> {
  const clientModulePath = path.resolve(
    import.meta.dirname,
    '../generated/tenant/client/index.js',
  );
  const clientModuleUrl = pathToFileURL(clientModulePath).href;
  const module = (await import(clientModuleUrl)) as {
    PrismaClient: new () => TenantPrismaClient;
  };

  return new module.PrismaClient();
}

export async function runTenantSeed(): Promise<void> {
  const prisma = await instantiateTenantPrismaClient();
  const roleName = 'SUPERADMIN';
  const tenantSubdomain = process.env.TENANT_SEED_SUBDOMAIN ?? 'tenant';
  const employeeEmail = `superadmin@${tenantSubdomain}.local`;
  const employeePassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  try {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {
        description: 'Tenant superadmin role with full access',
        deleted: false,
      },
      create: {
        name: roleName,
        description: 'Tenant superadmin role with full access',
      },
    });

    for (const action of DEFAULT_ACTIONS) {
      await prisma.action.upsert({
        where: { key: action.key },
        update: {
          description: action.description,
          deleted: false,
        },
        create: action,
      });
    }

    for (const resource of DEFAULT_RESOURCES) {
      await prisma.resource.upsert({
        where: { key: resource.key },
        update: {
          description: resource.description,
          deleted: false,
        },
        create: resource,
      });
    }

    const [actions, resources] = await Promise.all([
      prisma.action.findMany({
        where: { deleted: false },
        select: { id: true },
      }),
      prisma.resource.findMany({
        where: { deleted: false },
        select: { id: true },
      }),
    ]);

    for (const action of actions) {
      for (const resource of resources) {
        await prisma.permission.upsert({
          where: {
            roleId_resourceId_actionId: {
              roleId: role.roleId,
              resourceId: resource.id,
              actionId: action.id,
            },
          },
          update: {
            allowed: true,
          },
          create: {
            roleId: role.roleId,
            resourceId: resource.id,
            actionId: action.id,
            allowed: true,
          },
        });
      }
    }

    await prisma.employees.upsert({
      where: { email: employeeEmail },
      update: {
        password: employeePassword,
        firstName: 'Super',
        lastName: 'Admin',
        deleted: false,
        superAdmin: true,
        roleId: role.roleId,
      },
      create: {
        email: employeeEmail,
        password: employeePassword,
        firstName: 'Super',
        lastName: 'Admin',
        deleted: false,
        superAdmin: true,
        roleId: role.roleId,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
