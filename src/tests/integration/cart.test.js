import request from 'supertest';
import { TestSetup, globalTestConfig } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { logger } from '../../infrastructure/utils/logger.js';

describe('Cart Integration Tests', () => {
  let app;
  let token;
  let userId;
  let testProduct;
  let testCategory;
  let testProducerProfile;

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
      // Crear usuario usando el helper
      const userResult = await TestDatabase.getOrCreateTestUser();
      userId = userResult.user.id;
      token = userResult.token;
    });
  }, globalTestConfig.setupTimeout);

  beforeEach(async () => {
    await runTestWithErrorHandling(async () => {
      // Limpiar datos relacionados con carritos
      await TestDatabase.clearCarts();
      
      // Crear datos necesarios para las pruebas usando métodos directos a BD
      testCategory = await TestData.createTestCategory();
      testProducerProfile = await TestDatabase.createTestProducerProfile({ usuario_id: userId }, token);
      testProduct = await TestData.createTestProduct(testCategory.id, testProducerProfile.id);
    });
  });

  afterEach(async () => {
    await runTestWithErrorHandling(async () => {
      await TestDatabase.clearCarts();
    });
  });

  afterAll(async () => {
    await runTestWithErrorHandling(async () => {
      await TestSetup.cleanupTestEnvironment();
    });
  }, globalTestConfig.teardownTimeout);

  describe('GET /api/cart', () => {
    test('should return empty cart for new user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      
      const { data } = response.body;
      expect(data.id).toBe(null);
      expect(data.items).toHaveLength(0);
      expect(data.totalItems).toBe(0);
      expect(data.subtotal).toBe(0);
      expect(data.estado).toBe('activo');
    });
  });

  describe('POST /api/cart/items', () => {
    test('should add product to cart successfully', async () => {
      const cartData = {
        productId: String(testProduct.id),
        cantidad: 2
      };

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send(cartData)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      
      const { data } = response.body;
      expect(data.id).toBeDefined();
      expect(data.usuario_id).toBe(userId);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].producto.id).toBe(testProduct.id);
      expect(data.items[0].cantidad).toBe(2);
      expect(data.totalItems).toBe(2);
      expect(data.subtotal).toBeGreaterThan(0);
    });

    test('should fail to add product without productId', async () => {
      const cartData = {
        cantidad: 1
      };

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send(cartData)
        .expect(400);

      TestAssertions.assertErrorResponse(response);
    });

    test('should fail to add non-existent product', async () => {
      const cartData = {
        productId: '99999',
        cantidad: 1
      };

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send(cartData)
        .expect(400);

      TestAssertions.assertErrorResponse(response);
      expect(response.body.message).toContain('Producto no encontrado');
    });

    test('should update quantity when adding same product twice', async () => {
      const cartData = {
        productId: String(testProduct.id),
        cantidad: 1
      };

      // Add product first time
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send(cartData)
        .expect(200);

      // Add same product again
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send(cartData)
        .expect(200);

      const { data } = response.body;
      expect(data.items).toHaveLength(1);
      expect(data.items[0].cantidad).toBe(1); // CartService.createOrUpdate replaces quantity, doesn't add
      expect(data.totalItems).toBe(1);
    });
  });

  describe('PUT /api/cart/items/:productId', () => {
    beforeEach(async () => {
      // Add a product to cart before each test
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: String(testProduct.id),
          cantidad: 1
        });
    });

    test('should update product quantity successfully', async () => {
      const newQuantity = { cantidad: 3 };

      const response = await request(app)
        .put(`/api/cart/items/${String(testProduct.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newQuantity)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      
      const { data } = response.body;
      expect(data.items).toHaveLength(1);
      expect(data.items[0].cantidad).toBe(3);
      expect(data.totalItems).toBe(3);
    });

    test('should fail to update with invalid quantity', async () => {
      const invalidQuantity = { cantidad: 0 };

      const response = await request(app)
        .put(`/api/cart/items/${String(testProduct.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidQuantity)
        .expect(400);

      TestAssertions.assertErrorResponse(response);
    });

    test('should fail to update non-existent product in cart', async () => {
      const newQuantity = { cantidad: 2 };

      const response = await request(app)
        .put('/api/cart/items/99999')
        .set('Authorization', `Bearer ${token}`)
        .send(newQuantity)
        .expect(400);

      TestAssertions.assertErrorResponse(response);
      expect(response.body.message).toContain('Producto no encontrado en el carrito');
    });
  });

  describe('DELETE /api/cart/items/:productId', () => {
    beforeEach(async () => {
      // Add a product to cart before each test
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: String(testProduct.id),
          cantidad: 2
        });
    });

    test('should remove product from cart successfully', async () => {
      const response = await request(app)
        .delete(`/api/cart/items/${String(testProduct.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      
      const { data } = response.body;
      expect(data.items).toHaveLength(0);
      expect(data.totalItems).toBe(0);
      expect(data.subtotal).toBe(0);
    });

    test('should fail to remove non-existent product from cart', async () => {
      const response = await request(app)
        .delete('/api/cart/items/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      TestAssertions.assertErrorResponse(response);
      expect(response.body.message).toContain('Producto no encontrado en el carrito');
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // Add products to cart before each test
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: String(testProduct.id),
          cantidad: 3
        });
    });

    test('should clear cart successfully', async () => {
      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      TestAssertions.assertSuccessResponse(response);
      
      const { data } = response.body;
      expect(data.items).toHaveLength(0);
      expect(data.totalItems).toBe(0);
      expect(data.subtotal).toBe(0);
    });
  });

  describe('Authentication', () => {
    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(401);

      expect(response.body.message).toContain('No se proporcionó token de autenticación');
    });

    test('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Token inválido');
    });
  });
});
