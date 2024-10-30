import DisasterRecovery from '../utils/disasterRecovery';
import logger from '../utils/logger';

const backupDir = process.env.BACKUP_DIR || '/path/to/backups';
const testBackupPath = process.env.TEST_BACKUP_PATH || '/path/to/test/backup.gz';

async function runDisasterRecoveryTest() {
  const disasterRecovery = new DisasterRecovery(backupDir);

  try {
    logger.info('Starting disaster recovery test');

    // Step 1: Perform database recovery
    await disasterRecovery.performDatabaseRecovery(testBackupPath);

    // Step 2: Clear Redis cache
    await disasterRecovery.clearRedisCache();

    // Step 3: Verify system integrity
    const isSystemIntact = await disasterRecovery.verifySystemIntegrity();

    if (isSystemIntact) {
      logger.info('Disaster recovery test completed successfully');
    } else {
      throw new Error('System integrity check failed after recovery');
    }
  } catch (error) {
    logger.error('Disaster recovery test failed', { error });
  }
}

runDisasterRecoveryTest();