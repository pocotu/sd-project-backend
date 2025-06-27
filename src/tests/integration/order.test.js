import request from 'supertest';
import app from '../../app.js';
import { createTestUser, createTestCategory, createTestProduct, createTestProducerProfile, generateTokenForUser, cleanupTestData } from './config/test-helpers.js';

describe('Order Integration Tests', () => {
  let authToken;
  let testUser;
  let testCategory;
  let testProducerProfile;
  let testProduct;

  beforeAll(async () => {
    // Create test data
    testUser = await createTestUser();
    testCategory = await createTestCategory();
    testProducerProfile = await createTestProducerProfile();
    testProduct = await createTestProduct(testCategory.id, testProducerProfile.id);
    authToken = generateTokenForUser(testUser);
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Add product to cart before each order test
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          cantidad: 2
        });
    });

    afterEach(async () => {
      // Clear cart after each test
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should create order from cart successfully', async () => {
      const orderData = {
        direccionEntrega: 'Calle Test 123, Ciudad Test',
        telefonoContacto: '+1234567890',
        notasEspeciales: 'Entregar en la mañana'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.estado).toBe('pendiente');
      expect(response.body.data.direccionEntrega).toBe(orderData.direccionEntrega);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].cantidad).toBe(2);
    });

    it('should fail to create order without items in cart', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('carrito');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    let testOrder;

    beforeAll(async () => {
      // Create test order
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          cantidad: 1
        });

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          direccionEntrega: 'Test Address'
        });

      testOrder = orderResponse.body.data;
    });

    it('should get user orders successfully', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should get orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?estado=pendiente')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(order => {
        expect(order.estado).toBe('pendiente');
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    let testOrder;

    beforeAll(async () => {
      // Create test order
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          cantidad: 1
        });

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      testOrder = orderResponse.body.data;
    });

    it('should get specific order successfully', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrder.id);
      expect(response.body.data.items).toBeDefined();
    });

    it('should fail to get non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid order ID', async () => {
      const response = await request(app)
        .get('/api/orders/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/orders/:id/cancel', () => {
    let testOrder;

    beforeEach(async () => {
      // Create test order for each cancel test
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          cantidad: 1
        });

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      testOrder = orderResponse.body.data;
    });

    it('should cancel order successfully', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('cancelado');
    });

    it('should fail to cancel non-existent order', async () => {
      const response = await request(app)
        .patch('/api/orders/99999/cancel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin Routes', () => {
    let testOrder;

    beforeAll(async () => {
      // Create test order
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProduct.id,
          cantidad: 1
        });

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      testOrder = orderResponse.body.data;
    });

    it('should get all orders (admin endpoint)', async () => {
      const response = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update order status (admin endpoint)', async () => {
      const response = await request(app)
        .patch(`/api/orders/admin/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'confirmado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('confirmado');
    });

    it('should fail to update with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/orders/admin/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/orders')

      expect(response.status).toBe(401);
    });

    it('should fail with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
});
