import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import logger from './logger';

const execAsync = promisify(exec);

class BackupManager {
  private backupDir: string;

  constructor(backupDir: string) {
    this.backupDir = backupDir;
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createDatabaseBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `db_backup_${timestamp}.gz`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      await execAsync(`mongodump --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupPath}`);
      logger.info(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Error creating database backup', { error });
      throw error;
    }
  }

  async restoreDatabase(backupPath: string): Promise<void> {
    try {
      await execAsync(`mongorestore --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupPath}`);
      logger.info(`Database restored from backup: ${backupPath}`);
    } catch (error) {
      logger.error('Error restoring database', { error });
      throw error;
    }
  }

  async pruneOldBackups(retentionDays: number): Promise<void> {
    const files = fs.readdirSync(this.backupDir);
    const now = new Date().getTime();

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (fileAge > retentionDays) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${filePath}`);
      }
    }
  }
}

export default BackupManager;