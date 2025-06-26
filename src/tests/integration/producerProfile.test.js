import request from 'supertest';
import { TestSetup, globalTestConfig } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
// import { clearProducerProfiles } from './config/test-helpers.js';
import { logger } from '../../infrastructure/utils/logger.js';

describe('ProducerProfile Integration Tests', () => {
  let app;
  let token;
  let userId;
  let producerProfile;

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
      // Crear usuario usando el helper corregido
      const userResult = await TestDatabase.getOrCreateTestUser();
      userId = userResult.user.id;
      token = userResult.token;
    });
  }, globalTestConfig.setupTimeout);

  beforeEach(async () => {
    await runTestWithErrorHandling(async () => {
      // Limpiar perfiles existentes para tener un estado limpio
      await TestDatabase.clearProducerProfiles();
      // Crear producer profile usando el helper corregido que garantiza la existencia del usuario
      producerProfile = await TestDatabase.createTestProducerProfile({ usuario_id: userId }, token);
    });
  });

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  });

  it('should not allow creating a second profile for the same user', async () => {
    const data = {
      nombre_negocio: 'Otro Negocio',
      ubicacion: 'Otra ciudad'
    };
    const response = await request(app)
      .post('/api/producer-profile')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('El usuario ya tiene un perfil de productor');
  });

  it('should get the producer profile for the user', async () => {
    const response = await request(app)
      .get('/api/producer-profile/me')
      .set('Authorization', `Bearer ${token}`);
    
    if (response.status !== 200) {
      logger.error('Error getting profile:', response.body);
    }
    
    TestAssertions.validateSuccessResponse(response, 200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('nombre_negocio');
  });

  it('should update the producer profile', async () => {
    const data = {
      nombre_negocio: 'Negocio Actualizado',
      telefono: '+593888888888'
    };
    
    const response = await request(app)
      .put('/api/producer-profile')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    if (response.status !== 200) {
      logger.error('Error updating profile:', response.body);
    }
    
    TestAssertions.validateSuccessResponse(response, 200);
    expect(response.body.data.nombre_negocio).toBe(data.nombre_negocio);
    expect(response.body.data.telefono).toBe(data.telefono);
  });

  describe('GET /api/producer-profile', () => {
    it('should get producer profile when authenticated', async () => {
      await runTestWithErrorHandling(async () => {
        const response = await request(app)
          .get('/api/producer-profile')
          .set('Authorization', `Bearer ${token}`);

        TestAssertions.assertSuccessResponse(response);
        TestAssertions.assertValidProducerProfileResponse(response.body.data);
        expect(response.body.data.PRODUCTOR_ID).toBe(userId);
      });
    });

    it('should return 401 when not authenticated', async () => {
      await runTestWithErrorHandling(async () => {
        const response = await request(app)
          .get('/api/producer-profile');

        TestAssertions.assertErrorResponse(response, 401);
      });
    });
  });

  describe('POST /api/producer-profile', () => {
    beforeEach(async () => {
      // Clear existing profile for this test
      await TestDatabase.clearProducerProfiles();
    });

    it('should create producer profile when authenticated', async () => {
      const profileData = TestData.getValidProducerProfileData();
      const response = await request(app)
        .post('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData);

      TestAssertions.assertSuccessResponse(response, 201);
      TestAssertions.assertValidProducerProfileResponse(response.body.data);
      expect(response.body.data.PRODUCTOR_ID).toBe(userId);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      TestAssertions.assertErrorResponse(response, 400);
    });
  });

  describe('PUT /api/producer-profile', () => {
    it('should update producer profile when authenticated', async () => {
      const updateData = {
        nombre_negocio: 'Updated Business Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      TestAssertions.assertSuccessResponse(response);
      expect(response.body.data.nombre_negocio).toBe(updateData.nombre_negocio);
      expect(response.body.data.bio).toBe(updateData.bio);
    });

    it('should return 404 when profile does not exist', async () => {
      await TestDatabase.clearProducerProfiles();
      
      const response = await request(app)
        .put('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre_negocio: 'New Name' });

      TestAssertions.assertErrorResponse(response, 404);
    });
  });

  describe('DELETE /api/producer-profile', () => {
    it('should delete producer profile when authenticated', async () => {
      const response = await request(app)
        .delete('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`);

      TestAssertions.assertSuccessResponse(response);
    });

    it('should return 404 when profile does not exist', async () => {
      await TestDatabase.clearProducerProfiles();
      
      const response = await request(app)
        .delete('/api/producer-profile')
        .set('Authorization', `Bearer ${token}`);

      TestAssertions.assertErrorResponse(response, 404);
    });
  });
});
