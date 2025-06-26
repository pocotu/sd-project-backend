import request from 'supertest';
import { TestSetup } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { logger } from '../../infrastructure/utils/logger.js';

describe('Seller Rating Integration Tests', () => {
  let app;
  let token;
  let sellerProfileId;

  // Eliminado bloque duplicado de beforeAll
  beforeAll(async () => {
    await TestSetup.setupTestEnvironment();
    await TestSetup.setupTestDatabase();
    app = TestSetup.app;
    
    // Crear usuario usando el helper corregido
    const userResult = await TestDatabase.getOrCreateTestUser();
    token = userResult.token;
    
    // Crear perfil de productor usando el helper corregido
    const profile = await TestDatabase.createTestProducerProfile({ 
      usuario_id: userResult.user.id,
      nombre_negocio: 'Negocio Test de Calificaciones',
      ubicacion: 'Ubicación Test',
      verificado: 0,
      activo: 1
    }, token);
    sellerProfileId = profile.id;
    
    console.log('Seller profile created with ID:', sellerProfileId);
  });

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  });

  it('should create a seller rating', async () => {
    const data = {
      perfil_productor_id: sellerProfileId,
      calificacion: 4,
      comentario: 'Buen vendedor',
    };
    
    const response = await request(app)
      .post('/api/seller-ratings')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    if (response.status !== 201) {
      console.log('Error creating seller rating:', response.body);
    }
    
    TestAssertions.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.calificacion).toBe(4);
  });

  it('should not allow rating out of range', async () => {
    const data = {
      perfil_productor_id: sellerProfileId,
      calificacion: 0,
      comentario: 'No válido',
    };
    
    const response = await request(app)
      .post('/api/seller-ratings')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    TestAssertions.validateErrorResponse(response, 400);
  });
});
