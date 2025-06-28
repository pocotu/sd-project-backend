// Test Token Service - SRP: Single Responsibility for test token management
import jwt from 'jsonwebtoken';
import { config } from '../../../config/index.js';

export class TestTokenService {
  
  // Get JWT secret with fallback for tests
  static getJwtSecret() {
    // Use the same config as the main application
    return config.jwt.secret || process.env.JWT_SECRET || 'test-jwt-secret-key-for-tests-only-do-not-use-in-production';
  }
  
  static createAdminToken(userId, email = 'admin@test.com', roleId) {
    return jwt.sign(
      { 
        id: userId,  // Changed from userId to id to match auth service
        email,
        roleId      // Include roleId to match auth service payload
      },
      this.getJwtSecret(),
      { expiresIn: '24h' }
    );
  }

  static createUserToken(userId, email = 'user@test.com', roleId) {
    return jwt.sign(
      { 
        id: userId,  // Changed from userId to id to match auth service
        email,
        roleId      // Include roleId to match auth service payload
      },
      this.getJwtSecret(),
      { expiresIn: '24h' }
    );
  }

  static createCustomToken(payload) {
    return jwt.sign(
      payload,
      this.getJwtSecret(),
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, this.getJwtSecret());
    } catch (error) {
      throw new Error('Invalid test token');
    }
  }
}
