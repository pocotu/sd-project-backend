import { jest } from '@jest/globals';
import { logger } from '../infrastructure/utils/logger.js';
import dotenv from 'dotenv';
import DatabaseSetup from './integration/config/database-setup.js';

// Load test environment variables first
dotenv.config({ path: '.env.test', override: true });

// Global database setup instance
let dbSetup = null;

// Función de ayuda para suprimir console.log durante los tests
const suppressConsoleOutput = () => {
  const originalLog = console.log;
  const originalInfo = console.info;
  
  beforeAll(() => {
    console.log = jest.fn();
    console.info = jest.fn();
    logger.level = process.env.DEBUG ? 'debug' : 'error';
  });
  
  afterAll(() => {
    console.log = originalLog;
    console.info = originalInfo;
  });
};

// Global database setup
beforeAll(async () => {
  // Configurar timeouts más largos para Windows
  jest.setTimeout(30000);
  
  // Setup test database
  try {
    dbSetup = new DatabaseSetup();
    await dbSetup.setupDatabase();
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Suprimir logs si no estamos en modo debug
if (!process.env.DEBUG) {
  suppressConsoleOutput();
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection in tests:', error);
});

// Configurar limpieza después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar limpieza después de todos los tests
afterAll(async () => {
  if (dbSetup) {
    await dbSetup.cleanup();
  }
  await new Promise(resolve => setTimeout(resolve, 500));
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.SUPPRESS_TEST_LOGS = 'true';