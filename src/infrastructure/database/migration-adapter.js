import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';

const execAsync = promisify(exec);

class MigrationAdapter {
  constructor() {
    this.commands = {
      migration: 'npx sequelize-cli db:migrate',
      seeder: 'npx sequelize-cli db:seed:all'
    };
  }

  async executeCommand(commandType) {
    try {
      const command = this.commands[commandType];
      if (!command) {
        throw new Error(`Comando no definido para el tipo: ${commandType}`);
      }

      logger.info(i18n.getMessage(`database.${commandType}.executing`));
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        // Filtramos los warnings experimentales que no son críticos
        const filteredStderr = stderr
          .split('\n')
          .filter(line => !line.includes('ExperimentalWarning'))
          .join('\n');

        if (filteredStderr) {
          logger.warn(i18n.getMessage(`database.${commandType}.warnings`), {
            warnings: filteredStderr
          });
        }
      }

      return {
        success: true,
        output: stdout,
        warnings: stderr
      };
    } catch (error) {
      logger.error(i18n.getMessage(`database.${commandType}.failed`), {
        error: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  async migrate() {
    return this.executeCommand('migration');
  }

  async seed() {
    return this.executeCommand('seeder');
  }
}

export const migrationAdapter = new MigrationAdapter(); 