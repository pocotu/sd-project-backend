/**
 * Test Configuration Service
 * 
 * This service follows SOLID principles:
 * - SRP: Single responsibility for test environment configuration
 * - OCP: Open for extension, closed for modification
 * - LSP: Substitutable for any configuration interface
 * - ISP: Interface segregation with specific configuration interfaces
 * - DIP: Depends on abstractions, not concretions
 */

import dotenv from 'dotenv';
import path from 'path';

/**
 * Interface for test configuration
 */
export class ITestConfiguration {
  getDatabaseConfig() {
    throw new Error('Method must be implemented');
  }
  
  getServerConfig() {
    throw new Error('Method must be implemented');
  }
  
  getAuthConfig() {
    throw new Error('Method must be implemented');
  }
  
  getTestConfig() {
    throw new Error('Method must be implemented');
  }
}

/**
 * Environment configuration loader
 * SRP: Single responsibility for loading environment variables
 */
export class EnvironmentLoader {
  static loadTestEnvironment() {
    // Load test environment variables and override existing ones
    const testEnvPath = path.resolve(process.cwd(), '.env.test');
    dotenv.config({ path: testEnvPath, override: true });
    
    // Ensure NODE_ENV is set to test
    process.env.NODE_ENV = 'test';
  }
  
  static validateRequiredVars(requiredVars) {
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * Test configuration implementation
 * Implements the test configuration interface
 */
export class TestConfiguration extends ITestConfiguration {
  constructor() {
    super();
    EnvironmentLoader.loadTestEnvironment();
    this.validateConfiguration();
  }
  
  validateConfiguration() {
    const requiredVars = [
      'DB_HOST',
      'DB_USER', 
      'DB_PASSWORD',
      'DB_NAME',
      'DB_TEST_NAME',
      'JWT_SECRET'
    ];
    
    EnvironmentLoader.validateRequiredVars(requiredVars);
  }
  
  getDatabaseConfig() {
    // Validate required DB environment variables
    const requiredDbVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_TEST_NAME'];
    const missingDbVars = requiredDbVars.filter(varName => !process.env[varName]);
    
    if (missingDbVars.length > 0) {
      throw new Error(`Missing required database environment variables: ${missingDbVars.join(', ')}`);
    }

    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      testDatabase: process.env.DB_TEST_NAME,
      port: parseInt(process.env.DB_PORT),
      dialect: 'mysql',
      logging: false, // Disable logging in tests
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };
  }
  
  getServerConfig() {
    return {
      port: parseInt(process.env.PORT) || 3001,
      env: process.env.NODE_ENV || 'test',
      corsOrigin: process.env.CORS_ORIGIN || '*'
    };
  }
  
  getAuthConfig() {
    return {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
      bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@test.com',
      adminPassword: process.env.ADMIN_INITIAL_PASSWORD || 'Admin123!',
      adminFirstName: process.env.ADMIN_FIRST_NAME || 'Pedro',
      adminLastName: process.env.ADMIN_LAST_NAME || 'Gomez'
    };
  }
  
  getTestConfig() {
    return {
      timeout: 30000,
      setupTimeout: 30000,
      logLevel: process.env.LOG_LEVEL || 'error'
    };
  }
}

/**
 * Configuration factory
 * DIP: Provides abstraction for configuration creation
 */
export class ConfigurationFactory {
  static createTestConfiguration() {
    return new TestConfiguration();
  }
}

/**
 * Singleton configuration manager
 * Ensures single instance of configuration across tests
 */
export class TestConfigurationManager {
  static instance = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = ConfigurationFactory.createTestConfiguration();
    }
    return this.instance;
  }
  
  static reset() {
    this.instance = null;
  }
}

// Export default configuration instance
export const testConfig = TestConfigurationManager.getInstance();
