export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/src/tests/integration/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  // Configuración específica para tests de integración
  setupFilesAfterEnv: ['<rootDir>/src/tests/integration/config/test-setup.js'],
  // No ejecutar tests unitarios
  testPathIgnorePatterns: [
    '<rootDir>/src/tests/unit/',
    '<rootDir>/node_modules/'
  ],
  // Configuración de coverage para tests de integración
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/database/**',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  // Configuración de logging
  silent: false,
  // Configuración de timeouts
  testTimeout: 30000,
  // Configuración de workers
  maxWorkers: 1, // Ejecutar tests secuencialmente para evitar conflictos de BD
}; 