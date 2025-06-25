import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  'config': resolve(__dirname, 'database.config.js'),
  'models-path': resolve(__dirname, '../models'),
  'seeders-path': resolve(__dirname, '../database/seeders'),
  'migrations-path': resolve(__dirname, '../database/migrations')
}; 