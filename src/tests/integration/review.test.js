import request from 'supertest';
import { TestSetup } from './config/test-setup.js';
import { TestDatabase, TestData, TestAssertions } from './config/test-helpers.js';
import { logger } from '../../infrastructure/utils/logger.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { v4 as uuidv4 } from 'uuid';

// Este test cubre reseñas de productos
describe('Product Review Integration Tests', () => {
  let app;
  let token;
  let productId;
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
      nombre_negocio: 'Negocio Test de Reseñas',
      ubicacion: 'Ubicación Test',
      verificado: 0,
      activo: 1
    }, token);
    producerProfileId = profile.id;
    // Buscar o crear categoría
    let category = await Category.findOne({ where: { activo: 1 } });
    if (!category) {
      category = await Category.create({
        nombre: 'Categoría Test',
        descripcion: 'Categoría para tests',
        slug: 'categoria-test',
        activo: 1,
        orden: 1
      });
      logger.info(`Created new category for tests: ${category.id}`);
    }
    // Crear producto directamente
    const product = await Product.create({
      nombre: 'Producto Test Reseñas',
      descripcion: 'Producto para pruebas de reseñas',
      precio: 99.99,
      unidad: 'unidad',
      slug: `producto-test-${Date.now()}`,
      tipo: 'producto',
      activo: 1,
      destacado: 0,
      perfil_productor_id: producerProfileId,
      categoria_id: category.id
    });
    productId = product.id;
    logger.info(`Created product for review tests: ${productId}`);
  });

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  });

  it('should create a product review', async () => {
    const data = {
      producto_id: productId,
      calificacion: 5,
      comentario: 'Excelente producto',
    };
    
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    if (response.status !== 201) {
      console.log('Error creating product review:', response.body);
    }
    
    TestAssertions.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.calificacion).toBe(5);
  });

  it('should not allow invalid rating', async () => {
    const data = {
      producto_id: productId,
      calificacion: 7,
      comentario: 'No válido',
    };
    
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    
    TestAssertions.validateErrorResponse(response, 400);
  });
});
