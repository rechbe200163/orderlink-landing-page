BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TEMP TABLE IF NOT EXISTS seed_address_row (
  "addressId" uuid PRIMARY KEY
) ON COMMIT DROP;

TRUNCATE seed_address_row;

WITH existing_address AS (
  SELECT "addressId"
  FROM "addresses"
  WHERE "city" = :'address_city'
    AND "country" = :'address_country'
    AND "postCode" = :'address_post_code'
    AND "state" = :'address_state'
    AND "streetName" = :'address_street_name'
    AND "streetNumber" = :'address_street_number'
  LIMIT 1
),
updated_address AS (
  UPDATE "addresses"
  SET "city" = :'address_city',
      "country" = :'address_country',
      "postCode" = :'address_post_code',
      "state" = :'address_state',
      "streetName" = :'address_street_name',
      "streetNumber" = :'address_street_number',
      "deleted" = false
  WHERE "addressId" IN (SELECT "addressId" FROM existing_address)
  RETURNING "addressId"
),
inserted_address AS (
  INSERT INTO "addresses" (
    "addressId",
    "city",
    "country",
    "postCode",
    "state",
    "streetName",
    "streetNumber"
  )
  SELECT
    gen_random_uuid(),
    :'address_city',
    :'address_country',
    :'address_post_code',
    :'address_state',
    :'address_street_name',
    :'address_street_number'
  WHERE NOT EXISTS (SELECT 1 FROM existing_address)
  RETURNING "addressId"
),
address_row AS (
  SELECT "addressId" FROM updated_address
  UNION ALL
  SELECT "addressId" FROM inserted_address
  UNION ALL
  SELECT "addressId" FROM existing_address
  LIMIT 1
)
INSERT INTO seed_address_row ("addressId")
SELECT "addressId"
FROM address_row
ON CONFLICT ("addressId") DO NOTHING;

INSERT INTO "roles" ("roleId", "name", "description")
VALUES (gen_random_uuid(), 'Admin', 'Full access role')
ON CONFLICT ("name") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "actions" ("id", "key", "description")
VALUES
  (gen_random_uuid(), 'create', 'create action'),
  (gen_random_uuid(), 'read', 'read action'),
  (gen_random_uuid(), 'update', 'update action'),
  (gen_random_uuid(), 'delete', 'delete action')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "resources" ("id", "key", "description")
VALUES
  (gen_random_uuid(), 'employees', 'employees resource'),
  (gen_random_uuid(), 'roles', 'roles resource'),
  (gen_random_uuid(), 'permissions', 'permissions resource'),
  (gen_random_uuid(), 'products', 'products resource'),
  (gen_random_uuid(), 'categories', 'categories resource'),
  (gen_random_uuid(), 'customers', 'customers resource'),
  (gen_random_uuid(), 'orders', 'orders resource'),
  (gen_random_uuid(), 'routes', 'routes resource'),
  (gen_random_uuid(), 'site-config', 'site-config resource'),
  (gen_random_uuid(), 'modules', 'modules resource')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "employees" (
  "employeeId",
  "email",
  "password",
  "firstName",
  "lastName",
  "deleted",
  "superAdmin",
  "roleId"
)
SELECT
  gen_random_uuid(),
  COALESCE(NULLIF(:'super_admin_email', ''), 'admin@admin.com'),
  COALESCE(NULLIF(:'super_admin_password_hash', ''), 'changeMe'),
  COALESCE(NULLIF(:'super_admin_first_name', ''), 'Admin'),
  COALESCE(NULLIF(:'super_admin_last_name', ''), 'User'),
  false,
  true,
  role_row."roleId"
FROM "roles" AS role_row
WHERE role_row."name" = 'Admin'
ON CONFLICT ("email") DO UPDATE
SET "password" = EXCLUDED."password",
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "deleted" = false,
    "superAdmin" = true,
    "roleId" = EXCLUDED."roleId";

INSERT INTO "permissions" ("id", "roleId", "resourceId", "actionId", "allowed")
SELECT gen_random_uuid(), role_row."roleId", resource_row."id", action_row."id", true
FROM "roles" AS role_row
CROSS JOIN "resources" AS resource_row
CROSS JOIN "actions" AS action_row
WHERE role_row."name" = 'Admin'
ON CONFLICT ("roleId", "resourceId", "actionId") DO UPDATE
SET "allowed" = EXCLUDED."allowed";

INSERT INTO "siteConfigs" (
  "siteConfigId",
  "companyName",
  "logoPath",
  "email",
  "phoneNumber",
  "iban",
  "companyNumber",
  "addressId"
)
SELECT
  gen_random_uuid(),
  :'company_name',
  '',
  COALESCE(NULLIF(:'site_email', ''), 'admin@admin.com'),
  :'phone_number',
  :'iban',
  :'company_number',
  address_row."addressId"
FROM seed_address_row AS address_row
ON CONFLICT ("email") DO UPDATE
SET "companyName" = EXCLUDED."companyName",
    "logoPath" = EXCLUDED."logoPath",
    "phoneNumber" = EXCLUDED."phoneNumber",
    "iban" = EXCLUDED."iban",
    "companyNumber" = EXCLUDED."companyNumber",
    "addressId" = EXCLUDED."addressId",
    "deleted" = false;

INSERT INTO "Module" ("name", "description", "priceCents")
VALUES
  ('CUSTOM_ROLES', 'Custom roles and permissions', 0),
  ('STATISTICS', 'Statistics module', 0),
  ('NAVIGATION', 'Navigation module', 0)
ON CONFLICT ("name") DO UPDATE
SET "description" = EXCLUDED."description",
    "priceCents" = EXCLUDED."priceCents";

INSERT INTO "EnabledModule" ("id", "moduleName")
VALUES
  (gen_random_uuid(), 'CUSTOM_ROLES'),
  (gen_random_uuid(), 'STATISTICS'),
  (gen_random_uuid(), 'NAVIGATION')
ON CONFLICT ("moduleName") DO NOTHING;

COMMIT;