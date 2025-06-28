import request from 'supertest';
import app from '../../app.js';
import { sequelize } from '../../models/index.js';
import { TestDatabaseService } from './services/test-database.service.js';
import { TestTokenService } from './services/test-token.service.js';

describe('RBAC System Integration Tests', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeAll(async () => {
    try {
      // Setup test environment using dedicated services (SRP)
      await TestDatabaseService.setupDatabase();
      await TestDatabaseService.cleanDatabase();
      
      const seedData = await TestDatabaseService.seedBasicData();
      adminUser = seedData.adminUser;
      regularUser = seedData.regularUser;
      
      // Create tokens using dedicated service (SRP) with proper roleId
      adminToken = TestTokenService.createAdminToken(adminUser.id, adminUser.email, adminUser.roleId);
      userToken = TestTokenService.createUserToken(regularUser.id, regularUser.email, regularUser.roleId);
      
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    try {
      await TestDatabaseService.cleanDatabase();
      await TestDatabaseService.closeConnection();
    } catch (error) {
      console.error('Test cleanup failed:', error);
    }
  }, 30000);

  describe('Permission Management', () => {
    describe('GET /api/permissions', () => {
      it('should allow admin to get all permissions', async () => {
        const response = await request(app)
          .get('/api/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.permissions).toBeDefined();
        expect(Array.isArray(response.body.data.permissions)).toBe(true);
      });

      it('should deny access to regular user', async () => {
        await request(app)
          .get('/api/permissions')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should deny access without authentication', async () => {
        await request(app)
          .get('/api/permissions')
          .expect(401);
      });
    });

    describe('POST /api/permissions', () => {
      it('should allow admin to create permission', async () => {
        const permissionData = {
          accion: 'test_action',
          recurso: 'test_resource',
          descripcion: 'Test permission'
        };

        const response = await request(app)
          .post('/api/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(permissionData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.accion).toBe(permissionData.accion);
        expect(response.body.data.recurso).toBe(permissionData.recurso);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          accion: '', // Empty action
          recurso: 'test_resource'
        };

        await request(app)
          .post('/api/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should prevent duplicate permissions', async () => {
        const permissionData = {
          accion: 'duplicate_action',
          recurso: 'test_resource',
          descripcion: 'Duplicate test'
        };

        // Crear el primer permiso
        await request(app)
          .post('/api/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(permissionData)
          .expect(201);

        // Intentar crear el mismo permiso
        await request(app)
          .post('/api/permissions')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(permissionData)
          .expect(400);
      });
    });

    describe('GET /api/permissions/by-resource', () => {
      it('should group permissions by resource', async () => {
        const response = await request(app)
          .get('/api/permissions/by-resource')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(typeof response.body.data).toBe('object');
      });
    });

    describe('POST /api/permissions/initialize', () => {
      it('should initialize default permissions', async () => {
        const response = await request(app)
          .post('/api/permissions/initialize')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.totalPermissions).toBeGreaterThan(0);
      });

      it('should deny access to regular user', async () => {
        await request(app)
          .post('/api/permissions/initialize')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });
  });

  describe('Role Management', () => {
    let testRoleId;

    describe('POST /api/roles', () => {
      it('should allow admin to create role', async () => {
        const roleData = {
          nombre: 'test_role',
          descripcion: 'Test role description',
          permisos: [] // IDs de permisos se añadirían aquí
        };

        const response = await request(app)
          .post('/api/roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(roleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.nombre).toBe(roleData.nombre);
        testRoleId = response.body.data.id;
      });

      it('should validate role name', async () => {
        const invalidData = {
          nombre: 'a', // Too short
          descripcion: 'Test'
        };

        await request(app)
          .post('/api/roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('GET /api/roles', () => {
      it('should get all roles with pagination', async () => {
        const response = await request(app)
          .get('/api/roles?page=1&limit=10')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.roles).toBeDefined();
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter by active status', async () => {
        const response = await request(app)
          .get('/api/roles?active=true')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('PUT /api/roles/:id', () => {
      it('should update role', async () => {
        const updateData = {
          descripcion: 'Updated description'
        };

        const response = await request(app)
          .put(`/api/roles/${testRoleId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.descripcion).toBe(updateData.descripcion);
      });

      it('should return 404 for non-existent role', async () => {
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        
        await request(app)
          .put(`/api/roles/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ descripcion: 'Test' })
          .expect(404);
      });
    });

    describe('Role Assignment', () => {
      it('should assign role to user', async () => {
        const assignmentData = {
          userId: regularUser.id,
          roleId: testRoleId
        };

        const response = await request(app)
          .post('/api/roles/assign')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(assignmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should prevent duplicate role assignment', async () => {
        const assignmentData = {
          userId: regularUser.id,
          roleId: testRoleId
        };

        await request(app)
          .post('/api/roles/assign')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(assignmentData)
          .expect(400);
      });

      it('should remove role from user', async () => {
        const response = await request(app)
          .delete(`/api/roles/remove/${regularUser.id}/${testRoleId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/roles/users/with-roles', () => {
      it('should get users with their roles', async () => {
        const response = await request(app)
          .get('/api/roles/users/with-roles')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeDefined();
        expect(Array.isArray(response.body.data.users)).toBe(true);
      });
    });

    describe('DELETE /api/roles/:id', () => {
      it('should soft delete role', async () => {
        const response = await request(app)
          .delete(`/api/roles/${testRoleId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('RBAC Middleware', () => {
    it('should enforce permission-based access control', async () => {
      // Test que un usuario sin permisos no pueda acceder a rutas protegidas
      await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow access with proper permissions', async () => {
      // Admin debe tener acceso a todas las rutas
      await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
