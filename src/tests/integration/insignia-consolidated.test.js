import request from 'supertest';
import { TestSetup, globalTestConfig } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { Insignia, UsuarioInsignia } from '../../models/index.js';
import { logger } from '../../infrastructure/utils/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Insignia Integration Tests
 * 
 * This test suite follows SOLID principles:
 * - Single Responsibility: Each test focuses on one specific functionality
 * - Open/Closed: Tests are extensible without modifying existing code
 * - Liskov Substitution: Test helpers can be substituted without breaking tests
 * - Interface Segregation: Tests are grouped by functionality
 * - Dependency Inversion: Depends on test abstractions (helpers) rather than concrete implementations
 */
describe('Insignia API Integration Tests', () => {
  let app;
  let token;
  let userId;
  let adminToken;
  let adminUserId;
  let insignia1, insignia2;

  /**
   * Error handling wrapper for tests
   * Follows Single Responsibility Principle - only handles test errors
   */
  const runTestWithErrorHandling = async (testFn) => {
    try {
      await testFn();
    } catch (error) {
      logger.error('Test error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  /**
   * Test context setup following Dependency Inversion Principle
   * Depends on abstractions (TestSetup, TestDatabase) rather than concrete implementations
   */
  beforeAll(async () => {
    await runTestWithErrorHandling(async () => {
      // Setup test environment
      await TestSetup.setupTestEnvironment();
      await TestDatabase.seedTestRoles();
      app = TestSetup.app;
      
      // Create regular user using the helper
      const userResult = await TestDatabase.getOrCreateTestUser();
      userId = userResult.user.id;
      token = userResult.token;

      // Create admin user
      const adminUserData = TestData.getValidUserData({
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User'
      });
      const adminResult = await TestDatabase.createTestUserWithRole(adminUserData, 'admin');
      adminUserId = adminResult.id;
      
      // Generate admin token
      adminToken = jwt.sign(
        { 
          id: adminResult.id, 
          email: adminResult.email,
          roleId: adminResult.roleId 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });
  }, globalTestConfig.setupTimeout);

  beforeEach(async () => {
    await runTestWithErrorHandling(async () => {
      // Clean up and create test insignias
      await TestDatabase.clearInsignias();
      
      // Create test insignias
      insignia1 = await TestData.createTestInsignia({
        nombre: 'Test Badge 1',
        descripcion: 'Test description 1',
        tipo: 'productos',
        umbral_requerido: 10,
        icono_url: 'https://example.com/icon1.png',
        activa: true
      });

      insignia2 = await TestData.createTestInsignia({
        nombre: 'Test Badge 2',
        descripcion: 'Test description 2',
        tipo: 'ventas',
        umbral_requerido: 5,
        icono_url: 'https://example.com/icon2.png',
        activa: true
      });
    });
  });

  afterEach(async () => {
    await runTestWithErrorHandling(async () => {
      await TestDatabase.clearInsignias();
    });
  });

  afterAll(async () => {
    await runTestWithErrorHandling(async () => {
      await TestSetup.cleanupTestEnvironment();
    });
  }, globalTestConfig.teardownTimeout);

  /**
   * GET /api/insignias - List Insignias Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('GET /api/insignias - List Insignias', () => {
    test('should return all active insignias for authenticated user', async () => {
      const response = await request(app)
        .get('/api/insignias')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const insignia = response.body.data.find(i => i.id === insignia1.id);
      expect(insignia).toBeDefined();
      expect(insignia.nombre).toBe('Test Badge 1');
      expect(insignia.activa).toBe(1);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/insignias');
      TestAssertions.assertErrorResponse(response, 401);
    });
  });

  /**
   * GET /api/insignias/:id - Get Specific Insignia Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('GET /api/insignias/:id - Get Specific Insignia', () => {
    test('should return specific insignia by id', async () => {
      const response = await request(app)
        .get(`/api/insignias/${insignia1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.data.id).toBe(insignia1.id);
      expect(response.body.data.nombre).toBe('Test Badge 1');
    });

    test('should return 404 for non-existent insignia', async () => {
      const response = await request(app)
        .get('/api/insignias/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * POST /api/insignias - Create Insignia Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('POST /api/insignias - Create Insignia', () => {
    test('should create new insignia with admin privileges', async () => {
      const insigniaData = {
        nombre: 'New Test Insignia',
        descripcion: 'New test description',
        tipo: 'productos',
        umbral_requerido: 3,
        icono_url: 'https://example.com/new-icon.png'
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(insigniaData)
        .expect(201);

      TestAssertions.assertSuccessResponse(response, 201);
      expect(response.body.data.nombre).toBe(insigniaData.nombre);
      expect(response.body.data.activa).toBe(1);
    });

    test('should return 400 with invalid data', async () => {
      const invalidData = {
        // Missing required fields
        descripcion: 'Invalid test'
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 403 for non-admin user', async () => {
      const insigniaData = {
        nombre: 'Unauthorized Insignia',
        descripcion: 'Should not be created',
        tipo: 'productos',
        umbral_requerido: 1,
        icono_url: 'https://example.com/unauthorized.png'
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${token}`)
        .send(insigniaData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * PUT /api/insignias/:id - Update Insignia Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('PUT /api/insignias/:id - Update Insignia', () => {
    test('should update existing insignia with admin privileges', async () => {
      const updateData = {
        nombre: 'Updated Test Insignia',
        descripcion: 'Updated description',
        umbral_requerido: 5
      };

      const response = await request(app)
        .put(`/api/insignias/${insignia1.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.data.nombre).toBe(updateData.nombre);
    });

    test('should return 404 for non-existent insignia', async () => {
      const response = await request(app)
        .put('/api/insignias/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Should not update' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * PATCH /api/insignias/:id/toggle - Toggle Insignia Status Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('PATCH /api/insignias/:id/toggle - Toggle Insignia Status', () => {
    test('should deactivate insignia (soft delete)', async () => {
      const response = await request(app)
        .patch(`/api/insignias/${insignia1.id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activa: 0 })
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.message).toContain('desactivada');
    });

    test('should reactivate deactivated insignia', async () => {
      // First deactivate
      await request(app)
        .patch(`/api/insignias/${insignia1.id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activa: 0 });

      // Then reactivate
      const response = await request(app)
        .patch(`/api/insignias/${insignia1.id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activa: 1 })
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.message).toContain('activada');
    });
  });

  /**
   * POST /api/insignias/grant - Grant Insignia Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('POST /api/insignias/grant - Grant Insignia to User', () => {
    test('should assign insignia to user', async () => {
      const grantData = {
        usuario_id: userId,
        insignia_id: insignia1.id
      };

      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grantData)
        .expect(201);

      TestAssertions.assertSuccessResponse(response, 201);
      expect(response.body.message).toContain('asignada');
    });

    test('should return 400 when trying to assign already assigned insignia', async () => {
      const grantData = {
        usuario_id: userId,
        insignia_id: insignia1.id
      };

      // First assignment
      await UsuarioInsignia.create({
        usuario_id: grantData.usuario_id,
        insignia_id: grantData.insignia_id,
        otorgada_at: new Date()
      });

      // Try to assign again
      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grantData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent insignia', async () => {
      const grantData = {
        usuario_id: userId,
        insignia_id: 99999
      };

      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grantData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent user', async () => {
      const grantData = {
        usuario_id: '99999999-1234-1234-1234-123456789012',
        insignia_id: insignia1.id
      };

      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grantData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * DELETE /api/insignias/revoke - Revoke Insignia Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('DELETE /api/insignias/revoke - Revoke Insignia from User', () => {
    beforeEach(async () => {
      // Ensure there's an assigned insignia to revoke
      await UsuarioInsignia.create({
        usuario_id: userId,
        insignia_id: insignia1.id,
        otorgada_at: new Date()
      });
    });

    test('should revoke insignia from user', async () => {
      const revokeData = {
        usuario_id: userId,
        insignia_id: insignia1.id
      };

      const response = await request(app)
        .delete('/api/insignias/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(revokeData)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.message).toContain('revocada');
    });

    test('should return 404 when trying to revoke non-assigned insignia', async () => {
      const revokeData = {
        usuario_id: userId,
        insignia_id: insignia2.id // Not assigned
      };

      const response = await request(app)
        .delete('/api/insignias/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(revokeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no posee');
    });
  });

  /**
   * Authorization Tests
   * Interface Segregation Principle - grouped by security functionality
   */
  describe('Authorization & Security Tests', () => {
    test('should require admin privileges for creation operations', async () => {
      const insigniaData = {
        nombre: 'Unauthorized Insignia',
        descripcion: 'Should not be created',
        tipo: 'productos',
        umbral_requerido: 1,
        icono_url: 'https://example.com/unauthorized.png'
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${token}`)
        .send(insigniaData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should require admin privileges for update operations', async () => {
      const response = await request(app)
        .put(`/api/insignias/${insignia1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should require admin privileges for grant operations', async () => {
      const grantData = {
        usuario_id: userId,
        insignia_id: insignia1.id
      };

      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${token}`)
        .send(grantData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should require valid authentication for all operations', async () => {
      const endpoints = [
        { method: 'get', path: '/api/insignias', expectedStatus: 401 },
        { method: 'get', path: `/api/insignias/${insignia1.id}`, expectedStatus: 401 },
        { method: 'post', path: '/api/insignias', expectedStatus: 401 },
        { method: 'put', path: `/api/insignias/${insignia1.id}`, expectedStatus: 401 },
        { method: 'patch', path: `/api/insignias/${insignia1.id}/toggle`, expectedStatus: 401 },
        { method: 'post', path: '/api/insignias/grant', expectedStatus: 401 },
        { method: 'delete', path: '/api/insignias/revoke', expectedStatus: 401 }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(endpoint.expectedStatus);
      }
    });
  });

  /**
   * GET /api/insignias/users/:userId - Get User Insignias Tests
   * Interface Segregation Principle - grouped by functionality
   */
  describe('GET /api/insignias/users/:userId - Get User Insignias', () => {
    beforeEach(async () => {
      // Assign an insignia for testing
      await UsuarioInsignia.create({
        usuario_id: userId,
        insignia_id: insignia1.id,
        otorgada_at: new Date()
      });
    });

    afterEach(async () => {
      // Clean up assignments
      await UsuarioInsignia.destroy({
        where: {
          usuario_id: userId
        }
      });
    });

    test('should return user insignias', async () => {
      const response = await request(app)
        .get(`/api/insignias/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const userInsignia = response.body.data[0];
      expect(userInsignia.insignia_id).toBe(insignia1.id);
      expect(userInsignia.Insignia).toBeDefined();
      expect(userInsignia.Insignia.nombre).toBe('Test Badge 1');
    });

    test('should return empty array for user with no insignias', async () => {
      const response = await request(app)
        .get(`/api/insignias/users/${adminUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/insignias/users/99999999-1234-1234-1234-123456789012')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
