import * as bcrypt from 'bcrypt';
import { ModuleEnum, PrismaClient } from '../generated/tenant/client';

type SeedPayload = {
  subdomain?: string;
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  iban?: string;
  companyNumber?: string;
  address?: {
    addressId?: string;
    city?: string;
    country?: string;
    postCode?: string;
    state?: string;
    streetName?: string;
    streetNumber?: string;
  };
  superAdmin?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
};

const prisma = new PrismaClient();
const SUPER_ADMIN_PASSWORD = 'kennwort1';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
  }

  return databaseUrl;
}

function parsePayload(): SeedPayload {
  const raw = process.env.TENANT_SEED_PAYLOAD;

  if (!raw) {
    throw new Error('TENANT_SEED_PAYLOAD is missing');
  }

  return JSON.parse(raw) as SeedPayload;
}

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const payload = parsePayload();

  console.log('SEED DATABASE_URL:', databaseUrl);
  console.log('TENANT_SEED_PAYLOAD:', process.env.TENANT_SEED_PAYLOAD);

  const subdomain = payload.subdomain?.trim() || 'tenant';
  const companyName = payload.companyName?.trim() || subdomain;
  const domain = `${subdomain}.admin.local`;

  const siteEmail = payload.email?.trim() || `office@${domain}`;
  const sitePhone = payload.phoneNumber?.trim() || '+430000000000';
  const siteIban = payload.iban?.trim() || 'AT000000000000000000';
  const siteCompanyNumber = payload.companyNumber?.trim() || 'PENDING';

  const superAdminEmail =
    payload.superAdmin?.email?.trim() || `admin@${domain}`;
  const superAdminFirstName = payload.superAdmin?.firstName?.trim() || 'Super';
  const superAdminLastName = payload.superAdmin?.lastName?.trim() || 'Admin';
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const addressData = {
    city: payload.address?.city?.trim() || 'Unknown City',
    country: payload.address?.country?.trim() || 'Unknown Country',
    postCode: payload.address?.postCode?.trim() || '0000',
    state: payload.address?.state?.trim() || 'Unknown State',
    streetName: payload.address?.streetName?.trim() || 'Unknown Street',
    streetNumber: payload.address?.streetNumber?.trim() || '0',
  };

  const existingAddress = await prisma.address.findFirst({
    where: addressData,
  });

  const address = existingAddress
    ? await prisma.address.update({
        where: {
          addressId: existingAddress.addressId,
        },
        data: {
          ...addressData,
          deleted: false,
        },
      })
    : await prisma.address.create({
        data: addressData,
      });

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      description: 'Default administrator role',
      deleted: false,
    },
    create: {
      name: 'Admin',
      description: 'Default administrator role',
    },
  });

  const actions = await Promise.all(
    ['create', 'read', 'update', 'delete'].map((key) =>
      prisma.action.upsert({
        where: { key },
        update: {
          description: `${key} action`,
          deleted: false,
        },
        create: {
          key,
          description: `${key} action`,
        },
      }),
    ),
  );

  const resources = await Promise.all(
    [
      'employees',
      'roles',
      'permissions',
      'products',
      'categories',
      'customers',
      'orders',
      'routes',
      'site-config',
      'modules',
    ].map((key) =>
      prisma.resource.upsert({
        where: { key },
        update: {
          description: `${key} resource`,
          deleted: false,
        },
        create: {
          key,
          description: `${key} resource`,
        },
      }),
    ),
  );

  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: {
          roleId_resourceId_actionId: {
            roleId: adminRole.roleId,
            resourceId: resource.id,
            actionId: action.id,
          },
        },
        update: {
          allowed: true,
        },
        create: {
          roleId: adminRole.roleId,
          resourceId: resource.id,
          actionId: action.id,
          allowed: true,
        },
      });
    }
  }

  await prisma.employees.upsert({
    where: { email: superAdminEmail },
    update: {
      password: hashedPassword,
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      deleted: false,
      superAdmin: true,
      roleId: adminRole.roleId,
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      firstName: superAdminFirstName,
      lastName: superAdminLastName,
      deleted: false,
      superAdmin: true,
      roleId: adminRole.roleId,
    },
  });

  const seededEmployee = await prisma.employees.findUnique({
    where: { email: superAdminEmail },
    select: {
      employeeId: true,
      email: true,
      superAdmin: true,
      deleted: true,
      roleId: true,
    },
  });

  console.log('SEEDED SUPER ADMIN:', JSON.stringify(seededEmployee, null, 2));

  await prisma.siteConfig.upsert({
    where: {
      email: siteEmail,
    },
    update: {
      companyName,
      phoneNumber: sitePhone,
      iban: siteIban,
      companyNumber: siteCompanyNumber,
      addressId: address.addressId,
      deleted: false,
    },
    create: {
      companyName,
      email: siteEmail,
      phoneNumber: sitePhone,
      iban: siteIban,
      companyNumber: siteCompanyNumber,
      addressId: address.addressId,
      logoPath: '',
    },
  });

  const defaultModules = [
    {
      name: ModuleEnum.CUSTOM_ROLES,
      description: 'Custom roles and permissions',
      priceCents: 0,
    },
    {
      name: ModuleEnum.STATISTICS,
      description: 'Statistics module',
      priceCents: 0,
    },
    {
      name: ModuleEnum.NAVIGATION,
      description: 'Navigation module',
      priceCents: 0,
    },
  ];

  for (const module of defaultModules) {
    await prisma.module.upsert({
      where: { name: module.name },
      update: {
        description: module.description,
        priceCents: module.priceCents,
      },
      create: module,
    });

    await prisma.enabledModule.upsert({
      where: { moduleName: module.name },
      update: {},
      create: {
        moduleName: module.name,
      },
    });
  }

  console.log('Tenant seed completed successfully.');
  console.log(
    JSON.stringify(
      {
        subdomain,
        superAdmin: {
          email: superAdminEmail,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error('Tenant seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
