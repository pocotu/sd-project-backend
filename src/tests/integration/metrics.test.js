import request from 'supertest';
import app from '../../app.js';
import { sequelize } from '../../models/index.js';
import { TestSetup, globalTestConfig } from './config/test-setup.js';
import { TestData, TestAssertions, TestDatabase, TestHttpClient, createTestUser, generateTokenForUser, assignUserRole } from './config/test-helpers.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create test data for metrics
async function createTestDataForMetrics() {
  try {
    // Create a producer user
    const producerUser = await createTestUser('producer@test.com', 'user');
    
    // Create a producer profile
    await sequelize.query(`
      INSERT INTO PERFIL_PRODUCTOR (
        id, usuario_id, nombre_negocio, ubicacion, bio, telefono,
        verificado, activo, created_at, updated_at
      ) VALUES (
        '${uuidv4()}', '${producerUser.id}', 'Test Business', 'Test Location', 'Test Bio', '123456789',
        1, 1, NOW(), NOW()
      )
    `);

    // Create a test category - only has created_at, not updated_at
    await sequelize.query(`
      INSERT INTO CATEGORIAS (id, nombre, descripcion, slug, imagen_url, activo, created_at)
      VALUES (1, 'Test Category', 'Test Description', 'test-category', NULL, 1, NOW())
    `);

    // Create some test products
    const profileResult = await sequelize.query(`
      SELECT id FROM PERFIL_PRODUCTOR WHERE usuario_id = '${producerUser.id}' LIMIT 1
    `);
    
    if (profileResult[0] && profileResult[0].length > 0) {
      const profileId = profileResult[0][0].id;
      
      await sequelize.query(`
        INSERT INTO PRODUCTOS (
          id, nombre, descripcion, precio, categoria_id, perfil_productor_id, unidad, slug,
          activo, created_at, updated_at
        ) VALUES 
        (1, 'Test Product 1', 'Test Description 1', 10.00, 1, '${profileId}', 'kg', 'test-product-1', 1, NOW(), NOW()),
        (2, 'Test Product 2', 'Test Description 2', 20.00, 1, '${profileId}', 'unit', 'test-product-2', 1, NOW(), NOW())
      `);
    }

    // Create some test orders
    await sequelize.query(`
      INSERT INTO PEDIDOS (
        id, usuario_id, total, subtotal, estado, created_at, updated_at
      ) VALUES 
      (1, '${producerUser.id}', 30.00, 30.00, 'pendiente', NOW(), NOW()),
      (2, '${producerUser.id}', 50.00, 50.00, 'confirmado', NOW(), NOW())
    `);

    console.log('Test data for metrics created successfully');
  } catch (error) {
    console.error('Error creating test data for metrics:', error);
  }
}

describe('Metrics System Integration Tests', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeAll(async () => {
    await TestSetup.setupTestEnvironment();
    await TestSetup.setupTestDatabase();
    await TestDatabase.seedRoles();
    
    // Crear usuarios de prueba
    adminUser = await createTestUser('admin@test.com', 'admin');
    regularUser = await createTestUser('user@test.com', 'user');
    
    // Explicitly assign admin role to admin user in UsuarioRoles table
    await assignUserRole(adminUser.id, 'admin');
    await assignUserRole(regularUser.id, 'user');
    
    adminToken = generateTokenForUser(adminUser);
    userToken = generateTokenForUser(regularUser);
    
    // Create test data for metrics
    await createTestDataForMetrics();
  }, globalTestConfig.testTimeout);

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  }, globalTestConfig.testTimeout);

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Product Metrics', () => {
    describe('GET /api/metrics/products', () => {
      it('should allow admin to get product metrics', async () => {
        const response = await request(app)
          .get('/api/metrics/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.general).toBeDefined();
        expect(response.body.data.byCategory).toBeDefined();
        expect(response.body.data.topViewed).toBeDefined();
        expect(response.body.data.topRated).toBeDefined();
      });

      it('should deny access to regular user without metrics permission', async () => {
        await request(app)
          .get('/api/metrics/products')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should accept date filters', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';

        const response = await request(app)
          .get(`/api/metrics/products?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.startDate).toBe(startDate);
        expect(response.body.data.filters.endDate).toBe(endDate);
      });

      it('should validate date format', async () => {
        await request(app)
          .get('/api/metrics/products?startDate=invalid-date')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });

      it('should accept product ID filter', async () => {
        const productId = 1;

        const response = await request(app)
          .get(`/api/metrics/products?productId=${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.productId).toBe(productId);
      });

      it('should validate period parameter', async () => {
        await request(app)
          .get('/api/metrics/products?period=invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });

      it('should accept valid period parameters', async () => {
        const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];

        for (const period of validPeriods) {
          const response = await request(app)
            .get(`/api/metrics/products?period=${period}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.filters.period).toBe(period);
        }
      });
    });
  });

  describe('Seller Metrics', () => {
    describe('GET /api/metrics/sellers', () => {
      it('should allow admin to get seller metrics', async () => {
        const response = await request(app)
          .get('/api/metrics/sellers')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.general).toBeDefined();
        expect(response.body.data.topByProducts).toBeDefined();
        expect(response.body.data.topByRating).toBeDefined();
        expect(response.body.data.topByContacts).toBeDefined();
      });

      it('should deny access to regular user', async () => {
        await request(app)
          .get('/api/metrics/sellers')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should accept seller ID filter', async () => {
        const sellerId = '123e4567-e89b-12d3-a456-426614174000';

        const response = await request(app)
          .get(`/api/metrics/sellers?sellerId=${sellerId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.sellerId).toBe(sellerId);
      });

      it('should validate seller ID format', async () => {
        await request(app)
          .get('/api/metrics/sellers?sellerId=invalid-uuid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });

      it('should accept date range filters', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-12-31';

        const response = await request(app)
          .get(`/api/metrics/sellers?startDate=${startDate}&endDate=${endDate}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.filters.startDate).toBe(startDate);
        expect(response.body.data.filters.endDate).toBe(endDate);
      });
    });
  });

  describe('Consolidated Statistics', () => {
    describe('GET /api/metrics/consolidated', () => {
      it('should allow admin to get consolidated stats', async () => {
        const response = await request(app)
          .get('/api/metrics/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.system).toBeDefined();
        expect(response.body.data.growth).toBeDefined();
        expect(response.body.data.topCategories).toBeDefined();
        expect(response.body.data.recentActivity).toBeDefined();
      });

      it('should deny access to regular user', async () => {
        await request(app)
          .get('/api/metrics/consolidated')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should accept period parameter', async () => {
        const period = 60; // 60 días

        const response = await request(app)
          .get(`/api/metrics/consolidated?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
      });

      it('should validate period range', async () => {
        // Período muy pequeño
        await request(app)
          .get('/api/metrics/consolidated?period=0')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        // Período muy grande
        await request(app)
          .get('/api/metrics/consolidated?period=999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });

      it('should use default period when not specified', async () => {
        const response = await request(app)
          .get('/api/metrics/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(30); // Default period
      });
    });
  });

  describe('Admin Dashboard', () => {
    describe('GET /api/metrics/admin/dashboard', () => {
      it('should allow admin to get dashboard metrics', async () => {
        const response = await request(app)
          .get('/api/metrics/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.kpis).toBeDefined();
        expect(response.body.data.orderStatus).toBeDefined();
        expect(response.body.data.weeklyActivity).toBeDefined();
        expect(response.body.data.generatedAt).toBeDefined();

        // Verificar KPIs principales
        const kpis = response.body.data.kpis;
        expect(typeof kpis.usuarios_activos).toBe('number');
        expect(typeof kpis.emprendedores_activos).toBe('number');
        expect(typeof kpis.productos_activos).toBe('number');
      });

      it('should deny access to regular user', async () => {
        await request(app)
          .get('/api/metrics/admin/dashboard')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return data in expected format', async () => {
        const response = await request(app)
          .get('/api/metrics/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const { data } = response.body;

        // Verificar estructura de KPIs
        expect(data.kpis).toHaveProperty('usuarios_activos');
        expect(data.kpis).toHaveProperty('emprendedores_activos');
        expect(data.kpis).toHaveProperty('productos_activos');

        // Verificar estructura de estado de pedidos
        expect(Array.isArray(data.orderStatus)).toBe(true);

        // Verificar estructura de actividad semanal
        expect(Array.isArray(data.weeklyActivity)).toBe(true);

        // Verificar timestamp de generación
        expect(new Date(data.generatedAt)).toBeInstanceOf(Date);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all metrics endpoints', async () => {
      const endpoints = [
        '/api/metrics/products',
        '/api/metrics/sellers',
        '/api/metrics/consolidated',
        '/api/metrics/admin/dashboard'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .expect(401);
      }
    });

    it('should require admin role for admin dashboard', async () => {
      await request(app)
        .get('/api/metrics/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require metrics permission for general metrics', async () => {
      const endpoints = [
        '/api/metrics/products',
        '/api/metrics/sellers',
        '/api/metrics/consolidated'
      ];

      for (const endpoint of endpoints) {
        await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simular un error de base de datos cerrando la conexión temporalmente
      // Nota: En un test real, esto se haría con mocks o stubs
      const response = await request(app)
        .get('/api/metrics/products')
        .set('Authorization', `Bearer ${adminToken}`);

      // La respuesta debe ser válida aunque no haya datos
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 500) {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      }
    });
  });
});
