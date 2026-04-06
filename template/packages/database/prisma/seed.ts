import { runTenantSeed } from './tenant-seed';

async function main() {
  if (process.env.PRISMA_SCHEMA_TARGET === 'tenant') {
    await runTenantSeed();
    return;
  }
}

main().catch((error) => {
  console.error('Failed to seed database', error);
  process.exitCode = 1;
});
