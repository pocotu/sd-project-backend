export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  maxWorkers: 1,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/database/**',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};