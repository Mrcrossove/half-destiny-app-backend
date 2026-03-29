import { connectDatabase, sequelize } from '../config/database';
import '../models';
import { executeDueDeletionRequests } from '../services/user/deletionService';

async function main() {
  try {
    await connectDatabase();
    const summary = await executeDueDeletionRequests();
    console.log('[deletion] due deletion run complete');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await sequelize.close();
  }
}

main().catch((error) => {
  console.error('[deletion] run failed', error);
  process.exit(1);
});
