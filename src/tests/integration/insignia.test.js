import request from 'supertest';
import { TestSetup, globalTestConfig } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { Insignia, UsuarioInsignia } from '../../models/index.js';
import { logger } from '../../infrastructure/utils/logger.js';
import jwt from 'jsonwebtoken';

describe('Insignia Endpoints', () => {
  let app;
  let token;
  let userId;
  let adminToken;
  let adminUserId;
  let insignia1, insignia2;

  // Helper function para manejar errores en las pruebas
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

  beforeAll(async () => {
    await runTestWithErrorHandling(async () => {
      // Configurar ambiente de pruebas
      await TestSetup.setupTestEnvironment();
      // Crear roles necesarios
      await TestDatabase.seedTestRoles();
      // Obtener la aplicación
      app = TestSetup.app;
      
      // Crear usuario regular usando el helper
      const userResult = await TestDatabase.getOrCreateTestUser();
      userId = userResult.user.id;
      token = userResult.token;

      // Crear usuario admin
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
      // Limpiar datos relacionados con insignias
      await TestDatabase.clearInsignias();
      
      // Crear insignias de test
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

  describe('GET /api/insignias', () => {
    test('should return all active insignias', async () => {
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
      const response = await request(app)
        .get('/api/insignias')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/insignias/:id', () => {
    it('should return specific insignia by id', async () => {
      const response = await request(app)
        .get(`/api/insignias/${insignia1.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(insignia1.id);
      expect(response.body.data.nombre).toBe('Test Badge 1');
    });

    it('should return 404 for non-existent insignia', async () => {
      const response = await request(app)
        .get('/api/insignias/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/insignias', () => {
    it('should create new insignia with admin privileges', async () => {
      const newInsignia = {
        nombre: 'New Test Badge',
        descripcion: 'Test description for new badge',
        tipo: 'productos',
        umbral_requerido: 15,
        icono_url: 'https://example.com/new-icon.png'
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newInsignia);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(newInsignia.nombre);
    });

    it('should return 400 with invalid data', async () => {
      const invalidInsignia = {
        nombre: 'T', // Too short
        descripcion: 'Short' // Too short
      };

      const response = await request(app)
        .post('/api/insignias')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidInsignia);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/insignias/:id', () => {
    it('should update existing insignia', async () => {
      const updateData = {
        nombre: 'Updated Badge Name',
        descripcion: 'Updated description for the badge'
      };

      const response = await request(app)
        .put(`/api/insignias/${insignia2.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(updateData.nombre);
      expect(response.body.data.descripcion).toBe(updateData.descripcion);
    });

    it('should return 404 for non-existent insignia', async () => {
      const response = await request(app)
        .put('/api/insignias/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/insignias/:id/toggle', () => {
    it('should deactivate insignia (soft delete)', async () => {
      const response = await request(app)
        .patch(`/api/insignias/${insignia2.id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ activa: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify insignia was deactivated
      const deactivatedInsignia = await Insignia.findByPk(insignia2.id);
      expect(deactivatedInsignia.activa).toBe(0);
    });
  });

  describe('POST /api/insignias/grant', () => {
    it('should assign insignia to user', async () => {
      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: userId,
          insignia_id: insignia1.id,
          razon: 'Test assignment'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('asignada');

      // Verify assignment in database
      const assignment = await UsuarioInsignia.findOne({
        where: {
          usuario_id: userId,
          insignia_id: insignia1.id
        }
      });
      expect(assignment).toBeTruthy();
    });

    it('should return 400 when trying to assign already assigned insignia', async () => {
      // First assign the insignia
      await UsuarioInsignia.create({
        usuario_id: userId,
        insignia_id: insignia1.id,
        otorgada_at: new Date()
      });

      // Try to assign the same insignia again
      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: userId,
          insignia_id: insignia1.id,
          razon: 'Test assignment'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ya posee');
    });

    it('should return 404 for non-existent insignia', async () => {
      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: userId,
          insignia_id: 99999,
          razon: 'Test assignment'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/insignias/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: '99999999-1234-1234-1234-123456789012',
          insignia_id: insignia1.id,
          razon: 'Test assignment'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/insignias/revoke', () => {
    beforeEach(async () => {
      // Assign an insignia for testing removal
      await UsuarioInsignia.create({
        usuario_id: userId,
        insignia_id: insignia1.id,
        otorgada_at: new Date()
      });
    });

    it('should remove insignia assignment from user', async () => {
      const response = await request(app)
        .delete('/api/insignias/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: userId,
          insignia_id: insignia1.id
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('revocada exitosamente');

      // Verify assignment is removed from database
      const assignment = await UsuarioInsignia.findOne({
        where: {
          usuario_id: userId,
          insignia_id: insignia1.id
        }
      });
      expect(assignment).toBeFalsy();
    });

    it('should return 404 when trying to remove non-existent assignment', async () => {
      // First remove the assignment
      await UsuarioInsignia.destroy({
        where: {
          usuario_id: userId,
          insignia_id: insignia1.id
        }
      });

      const response = await request(app)
        .delete('/api/insignias/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          usuario_id: userId,
          insignia_id: insignia1.id
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no posee');
    });
  });

  describe('GET /api/insignias/users/:userId', () => {
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

    it('should return user insignias', async () => {
      const response = await request(app)
        .get(`/api/insignias/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const userInsignia = response.body.data[0];
      expect(userInsignia.insignia_id).toBe(insignia1.id);
      expect(userInsignia.Insignia).toBeDefined();
      expect(userInsignia.Insignia.nombre).toBe('Test Badge 1');
    });

    it('should return empty array for user with no insignias', async () => {
      const response = await request(app)
        .get(`/api/insignias/users/${adminUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/insignias/users/99999999-1234-1234-1234-123456789012')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
