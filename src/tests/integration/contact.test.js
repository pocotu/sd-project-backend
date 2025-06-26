import request from 'supertest';
import { TestSetup } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { logger } from '../../infrastructure/utils/logger.js';

// Test de integración para el sistema de contactos
describe('Contact Integration Tests', () => {
  let app;
  let token;
  let producerProfileId;

  // Eliminado bloque duplicado de beforeAll
  beforeAll(async () => {
    await TestSetup.setupTestEnvironment();
    await TestSetup.setupTestDatabase();
    app = TestSetup.app;
    
    // Crear usuario usando el helper corregido
    const user = await TestDatabase.getOrCreateTestUser();
    token = user.token;
    
    // Crear perfil de productor usando el helper corregido
    const profile = await TestDatabase.createTestProducerProfile({ 
      usuario_id: user.id,
      nombre_negocio: 'Negocio Test de Contactos',
      ubicacion: 'Ubicación Test',
      verificado: 0,
      activo: 1
    }, token);
    producerProfileId = profile.id;
  });

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  });

  it('should create a contact message', async () => {
    const data = {
      emprendedor_id: producerProfileId,
      nombre_contacto: 'Juan Cliente',
      email_contacto: 'juan@cliente.com',
      telefono_contacto: '+593912345678',
      mensaje: 'Estoy interesado en su producto',
    };
    
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    if (response.status !== 201) {
      console.log('Error creating contact:', response.body);
    }
    
    TestAssertions.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.estado).toBe('nuevo');
  });

  it('should update contact status to leido', async () => {
    // Crear contacto directamente en la base de datos
    try {
      const contactData = {
        id: 1,
        emprendedor_id: producerProfileId,
        nombre_contacto: 'Contacto Test',
        email_contacto: 'contacto@test.com',
        mensaje: 'Mensaje de prueba',
        estado: 'nuevo'
      };
      
      const contact = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send(contactData);
      
      const contactId = contact.body.data.id;
      
      const response = await request(app)
        .patch(`/api/contacts/${contactId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'leido' });
      
      if (response.status !== 200) {
        console.log('Error updating contact status:', response.body);
      }
      
      TestAssertions.validateSuccessResponse(response, 200);
      expect(response.body.data.estado).toBe('leido');
    } catch (error) {
      logger.error('Error in contact status test:', error);
      throw error;
    }
  });
});
