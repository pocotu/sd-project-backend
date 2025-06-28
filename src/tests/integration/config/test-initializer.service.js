/**
 * Test Initialization Service
 * 
 * This service follows SOLID principles:
 * - SRP: Single responsibility for test initialization
 * - OCP: Open for extension with new initialization strategies
 * - LSP: Can be substituted with other initialization services
 * - ISP: Provides focused interfaces for different initialization needs
 * - DIP: Depends on abstractions through configuration services
 */

import { testConfig } from './test-config.service.js';

/**
 * Interface for test initialization
 */
export class ITestInitializer {
  async initialize() {
    throw new Error('Method must be implemented');
  }
  
  async cleanup() {
    throw new Error('Method must be implemented');
  }
}

/**
 * Global test initializer
 * Ensures test environment is properly configured before any tests run
 */
export class GlobalTestInitializer extends ITestInitializer {
  constructor() {
    super();
    this.config = testConfig;
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) {
      return;
    }
    
    try {
      // Ensure environment is loaded
      this.config.validateConfiguration();
      
      // Set global test timeouts
      const testConfig = this.config.getTestConfig();
      if (typeof jest !== 'undefined') {
        jest.setTimeout(testConfig.timeout);
      }
      
      this.initialized = true;
      console.log('Global test environment initialized successfully');
    } catch (error) {
      console.error('Error initializing global test environment:', error);
      throw error;
    }
  }
  
  async cleanup() {
    if (!this.initialized) {
      return;
    }
    
    try {
      this.initialized = false;
      console.log('Global test environment cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up global test environment:', error);
      throw error;
    }
  }
}

/**
 * Test initializer factory
 */
export class TestInitializerFactory {
  static createGlobalInitializer() {
    return new GlobalTestInitializer();
  }
}

/**
 * Auto-initialize global test environment
 * This runs immediately when the module is imported
 */
const globalInitializer = TestInitializerFactory.createGlobalInitializer();

// Initialize immediately
globalInitializer.initialize().catch(error => {
  console.error('Failed to initialize global test environment:', error);
  process.exit(1);
});

// Cleanup on process exit
process.on('exit', () => {
  globalInitializer.cleanup();
});

process.on('SIGINT', () => {
  globalInitializer.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  globalInitializer.cleanup();
  process.exit(0);
});

export { globalInitializer };
