export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  // Configuración de workers para tests de integración
  maxWorkers: 1,
  // Configuración de coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/database/**',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Suprimir logs durante tests
  silent: false,
  // Configurar setup para suprimir console.log
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
}; 