import BackupManager from '../utils/backupManager';
import logger from '../utils/logger';

const backupDir = process.env.BACKUP_DIR || '/path/to/backups';
const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);

async function runBackup() {
  const backupManager = new BackupManager(backupDir);

  try {
    await backupManager.createDatabaseBackup();
    await backupManager.pruneOldBackups(retentionDays);
    logger.info('Backup process completed successfully');
  } catch (error) {
    logger.error('Backup process failed', { error });
  }
}

runBackup();