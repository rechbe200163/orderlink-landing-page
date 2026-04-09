BEGIN;

WITH existing_address AS (
  SELECT "addressId"
  FROM "Address"
  WHERE "city" = :'address_city'
    AND "country" = :'address_country'
    AND "postCode" = :'address_post_code'
    AND "state" = :'address_state'
    AND "streetName" = :'address_street_name'
    AND "streetNumber" = :'address_street_number'
  LIMIT 1
),
updated_address AS (
  UPDATE "Address"
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
  INSERT INTO "Address" (
    "city",
    "country",
    "postCode",
    "state",
    "streetName",
    "streetNumber"
  )
  SELECT
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
INSERT INTO "Role" ("name", "description")
VALUES ('Admin', 'Default administrator role')
ON CONFLICT ("name") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "Action" ("key", "description")
VALUES
  ('create', 'create action'),
  ('read', 'read action'),
  ('update', 'update action'),
  ('delete', 'delete action')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "Resource" ("key", "description")
VALUES
  ('employees', 'employees resource'),
  ('roles', 'roles resource'),
  ('permissions', 'permissions resource'),
  ('products', 'products resource'),
  ('categories', 'categories resource'),
  ('customers', 'customers resource'),
  ('orders', 'orders resource'),
  ('routes', 'routes resource'),
  ('site-config', 'site-config resource'),
  ('modules', 'modules resource')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description",
    "deleted" = false;

INSERT INTO "Permission" ("roleId", "resourceId", "actionId", "allowed")
SELECT role_row."roleId", resource_row."id", action_row."id", true
FROM "Role" AS role_row
CROSS JOIN "Resource" AS resource_row
CROSS JOIN "Action" AS action_row
WHERE role_row."name" = 'Admin'
  AND resource_row."key" IN (
    'employees',
    'roles',
    'permissions',
    'products',
    'categories',
    'customers',
    'orders',
    'routes',
    'site-config',
    'modules'
  )
  AND action_row."key" IN ('create', 'read', 'update', 'delete')
ON CONFLICT ("roleId", "resourceId", "actionId") DO UPDATE
SET "allowed" = EXCLUDED."allowed";

INSERT INTO "Employees" (
  "email",
  "password",
  "firstName",
  "lastName",
  "deleted",
  "superAdmin",
  "roleId"
)
SELECT
  :'super_admin_email',
  :'super_admin_password_hash',
  :'super_admin_first_name',
  :'super_admin_last_name',
  false,
  true,
  role_row."roleId"
FROM "Role" AS role_row
WHERE role_row."name" = 'Admin'
ON CONFLICT ("email") DO UPDATE
SET "password" = EXCLUDED."password",
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "deleted" = false,
    "superAdmin" = true,
    "roleId" = EXCLUDED."roleId";

INSERT INTO "SiteConfig" (
  "companyName",
  "email",
  "phoneNumber",
  "iban",
  "companyNumber",
  "addressId",
  "logoPath"
)
SELECT
  :'company_name',
  :'site_email',
  :'phone_number',
  :'iban',
  :'company_number',
  address_row."addressId",
  ''
FROM address_row
ON CONFLICT ("email") DO UPDATE
SET "companyName" = EXCLUDED."companyName",
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

INSERT INTO "EnabledModule" ("moduleName")
VALUES
  ('CUSTOM_ROLES'),
  ('STATISTICS'),
  ('NAVIGATION')
ON CONFLICT ("moduleName") DO NOTHING;

COMMIT;