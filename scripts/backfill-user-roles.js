require('dotenv').config();
const { listUsers, getUserRoles, assignRole } = require('../services/auth0Management');

const DRY_RUN = process.argv.includes('--dry-run');
const PER_PAGE = 100;

async function run() {
  let page = 1;
  let total = Infinity;
  let checked = 0, assigned = 0, skipped = 0, failed = 0;
  const failures = [];

  while ((page - 1) * PER_PAGE < total) {
    const result = await listUsers(page, PER_PAGE);
    total = result.total;
    if (!result.users.length) break;

    for (const user of result.users) {
      checked++;

      try {
        const roles = await getUserRoles(user.user_id);

        if (roles.length > 0) {
          skipped++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`[dry-run] would assign User -> ${user.email} (${user.user_id})`);
        } else {
          await assignRole(user.user_id, 'User');
          console.log(`assigned User -> ${user.email} (${user.user_id})`);
        }
        assigned++;
      } catch (err) {
        failed++;
        failures.push({ user_id: user.user_id, email: user.email, error: err.message });
        console.error(`FAILED -> ${user.email} (${user.user_id}): ${err.message}`);
      }
    }

    page++;
  }

  console.log(`\nDone. checked=${checked} assigned=${assigned} skipped=${skipped} failed=${failed} dryRun=${DRY_RUN}`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((f) => console.log(`  ${f.email} (${f.user_id}): ${f.error}`));
  }
}

run().catch((err) => {
  console.error('Backfill crashed:', err);
  process.exit(1);
});