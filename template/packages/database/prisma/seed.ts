async function main() {
  throw new Error(
    'The Prisma-based tenant seed has been retired. Tenant provisioning now runs tenant-seed.sql through psql.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
