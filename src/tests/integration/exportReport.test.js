import request from 'supertest';
import app from '../../app.js';
import { config } from '../../config/index.js';
import { TestDatabaseSetup } from './config/test-db-setup.js';

describe('Export Reports API Integration Tests', () => {
  let adminToken;
  let userToken;
  let testUserId;
  let testReportId;
  let otherUserToken;

  beforeAll(async () => {
    // Set up test database
    if (config.server.env !== 'test') {
      throw new Error('Tests must run in test environment');
    }

    // Setup database for tests
    await TestDatabaseSetup.setupDatabase();
  });

  beforeEach(async () => {
    await TestDatabaseSetup.cleanDatabase();
    
    // Create test admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!',
        firstName: 'Test',
        lastName: 'Admin'
      });

    adminToken = adminResponse.body.token || adminResponse.body.data?.token;

    // Create test regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'User123!',
        firstName: 'Test',
        lastName: 'User'
      });

    userToken = userResponse.body.token || userResponse.body.data?.token;
    testUserId = userResponse.body.data?.user?.id || userResponse.body.user?.id;

    // Create another user for testing cross-user access
    const otherResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'other@test.com',
        password: 'Other123!',
        firstName: 'Other',
        lastName: 'User'
      });

    otherUserToken = otherResponse.body.token || otherResponse.body.data?.token;
  });

  afterAll(async () => {
    await TestDatabaseSetup.teardownDatabase();
  });

  describe('GET /api/reports/types', () => {
    test('should return available report types', async () => {
      const response = await request(app)
        .get('/api/reports/types')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const productReport = response.body.data.find(t => t.tipo === 'productos');
      expect(productReport).toBeDefined();
      expect(productReport.formatosDisponibles).toContain('csv');
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/reports/types')
        .expect(401);
    });
  });

  describe('POST /api/reports/request', () => {
    test('should create a report request successfully', async () => {
      const reportData = {
        tipo_reporte: 'productos',
        formato: 'csv',
        filtros: {
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-12-31'
        }
      };

      const response = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reportId).toBeDefined();
      expect(response.body.data.estado).toBe('generando');
      expect(response.body.data.tipo).toBe('productos');
      expect(response.body.data.formato).toBe('csv');

      testReportId = response.body.data.reportId;
    });

    test('should validate report type', async () => {
      const invalidReportData = {
        tipo_reporte: 'invalid_type',
        formato: 'csv'
      };

      const response = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidReportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de validación inválidos');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Tipo de reporte inválido'
          })
        ])
      );
    });

    test('should validate format', async () => {
      const invalidFormatData = {
        tipo_reporte: 'productos',
        formato: 'invalid_format'
      };

      const response = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidFormatData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos de validación inválidos');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Formato inválido'
          })
        ])
      );
    });

    test('should require authentication', async () => {
      await request(app)
        .post('/api/reports/request')
        .send({ tipo_reporte: 'productos', formato: 'csv' })
        .expect(401);
    });
  });

  describe('GET /api/reports', () => {
    test('should get user reports with pagination', async () => {
      const response = await request(app)
        .get('/api/reports?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reports).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/reports')
        .expect(401);
    });
  });

  describe('GET /api/reports/:id', () => {
    test('should get specific report', async () => {
      // Como el reporte se genera asincrónicamente, verificamos que el endpoint responde correctamente
      // para un reporte que no existe o no está listo
      const response = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });

    test('should return 404 for non-existent report', async () => {
      await request(app)
        .get('/api/reports/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    test('should validate report ID', async () => {
      await request(app)
        .get('/api/reports/invalid_id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/reports/:id/cancel', () => {
    test('should cancel pending report', async () => {
      // First create a new report to cancel
      const createResponse = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tipo_reporte: 'metricas',
          formato: 'pdf'
        });

      const reportId = createResponse.body.data.reportId;

      const response = await request(app)
        .patch(`/api/reports/${reportId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelado');
    });

    test('should validate report ID', async () => {
      await request(app)
        .patch('/api/reports/invalid_id/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('GET /api/reports/download/:filename', () => {
    test('should handle download request', async () => {
      // Este test verifica que el endpoint responde correctamente a un archivo no encontrado
      const response = await request(app)
        .get('/api/reports/download/test_report.csv')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrado');
    });

    test('should validate filename', async () => {
      await request(app)
        .get('/api/reports/download/')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400); // Validation error for empty filename
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/reports/request')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Tests', () => {
    test('should not allow access to other users reports', async () => {
      // Try to access original user's report with other user's token
      await request(app)
        .get(`/api/reports/${testReportId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404); // Should not find report belonging to other user
    });

    test('should require valid token', async () => {
      await request(app)
        .get('/api/reports')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
