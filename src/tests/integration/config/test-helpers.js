import request from 'supertest';
import { TestSetup } from './test-setup.js';
import { User } from '../../../domain/models/user.model.js';
import { Role } from '../../../domain/models/role.model.js';
import { logger } from '../../../infrastructure/utils/logger.js';

// Clase base para datos de prueba (SRP: Responsabilidad única para datos)
export class TestData {
  static generateTimestamp() {
    return new Date().getTime();
  }

  static generateUniqueEmail(prefix = 'test') {
    const timestamp = this.generateTimestamp();
    return `${prefix}${timestamp}@example.com`;
  }

  static getValidUserData(overrides = {}) {
    return {
      email: this.generateUniqueEmail(),
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    };
  }

  static getInvalidUserData() {
    return {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: ''
    };
  }

  static getValidProductData(overrides = {}) {
    return {
      name: `Test Product ${this.generateTimestamp()}`,
      description: 'This is a test product description',
      price: 99.99,
      stock: 10,
      categoryId: 1,
      ...overrides
    };
  }

  static getValidCategoryData(overrides = {}) {
    return {
      name: `Test Category ${this.generateTimestamp()}`,
      description: 'This is a test category description',
      ...overrides
    };
  }
}

// Clase para validaciones de respuestas (SRP: Responsabilidad única para validaciones)
export class TestAssertions {
  static validateSuccessResponse(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.status).toBe('success');
  }

  static validateErrorResponse(response, statusCode, message = null) {
    expect(response.status).toBe(statusCode);
    expect(response.body.status).toBe('error');
    if (message) {
      expect(response.body.message).toBe(message);
    } else {
      expect(response.body.message).toBeDefined();
    }
  }

  static validateUserResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user).toHaveProperty('email');
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data).toHaveProperty('token');
  }

  static validateProductResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('price');
    expect(response.body.data).toHaveProperty('stock');
  }

  static validateCategoryResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('description');
  }
}

// Clase para operaciones de base de datos (SRP: Responsabilidad única para BD)
export class TestDatabase {
  static async seedRoles() {
    try {
      // Crear roles básicos si no existen
      await Role.findOrCreate({
        where: { nombre: 'user' },
        defaults: { 
          id: '89af88db-4e1d-11f0-918d-244bfe6df6f7',
          descripcion: 'Usuario regular'
        }
      });
      
      await Role.findOrCreate({
        where: { nombre: 'admin' },
        defaults: { 
          id: '2c81729c-5e83-40aa-a059-839b75390978',
          descripcion: 'Administrador del sistema'
        }
      });
      
      logger.info('Roles seeded successfully');
    } catch (error) {
      logger.error('Error seeding roles:', error);
      throw error;
    }
  }

  static async cleanupUsers() {
    try {
      await User.destroy({ where: {}, truncate: true, cascade: true });
      logger.info('Users cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up users:', error);
      throw error;
    }
  }

  static async createTestUser(userData = null) {
    try {
      const data = userData || TestData.getValidUserData();
      const user = await User.create(data);
      return user;
    } catch (error) {
      logger.error('Error creating test user:', error);
      throw error;
    }
  }

  static async getAuthToken(userData = null) {
    try {
      const data = userData || TestData.getValidUserData();
      
      // Registrar usuario
      const registerResponse = await request(TestSetup.app)
        .post('/api/auth/register')
        .send(data);
      
      if (registerResponse.status === 201) {
        return registerResponse.body.data.token;
      }
      
      // Si el registro falla, intentar login
      const loginResponse = await request(TestSetup.app)
        .post('/api/auth/login')
        .send({
          email: data.email,
          password: data.password
        });
      
      return loginResponse.body.data.token;
    } catch (error) {
      logger.error('Error getting auth token:', error);
      throw error;
    }
  }
}

// Clase para operaciones HTTP (SRP: Responsabilidad única para HTTP)
export class TestHttpClient {
  static async registerUser(userData) {
    return request(TestSetup.app)
      .post('/api/auth/register')
      .send(userData);
  }

  static async loginUser(credentials) {
    return request(TestSetup.app)
      .post('/api/auth/login')
      .send(credentials);
  }

  static async logoutUser(token) {
    return request(TestSetup.app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
  }

  static async getWithAuth(endpoint, token) {
    return request(TestSetup.app)
      .get(endpoint)
      .set('Authorization', `Bearer ${token}`);
  }

  static async postWithAuth(endpoint, data, token) {
    return request(TestSetup.app)
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  static async putWithAuth(endpoint, data, token) {
    return request(TestSetup.app)
      .put(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  static async deleteWithAuth(endpoint, token) {
    return request(TestSetup.app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${token}`);
  }
} 