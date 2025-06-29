import request from 'supertest';
import { TestSetup } from './test-setup.js';
import User from '../../../models/User.js';
import Role from '../../../models/Role.js';
import { logger } from '../../../infrastructure/utils/logger.js';
import Category from '../../../models/Category.js';
import ProducerProfile from '../../../models/ProducerProfile.js';
import Product from '../../../models/Product.js';
import Contact from '../../../models/Contact.js';
import Review from '../../../models/Review.js';
import SellerRating from '../../../models/SellerRating.js';
import Cart from '../../../models/Cart.js';
import CartItem from '../../../models/CartItem.js';
import Insignia from '../../../models/Insignia.js';
import UsuarioInsignia from '../../../models/UsuarioInsignia.js';
import { authService } from '../../../application/services/auth.service.js';
import { TestTokenService } from '../services/test-token.service.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../../../config/database.js';

// Clase base para datos de prueba (SRP: Responsabilidad única para datos)
export class TestData {
  static generateTimestamp() {
    return new Date().getTime();
  }

  static generateUniqueEmail(prefix = 'test') {
    const timestamp = this.generateTimestamp();
    return `${prefix}${timestamp}@example.com`;
  }

  static getValidUserData(overrides = {}) {
    return {
      email: this.generateUniqueEmail(),
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    };
  }

  static getInvalidUserData() {
    return {
      email: 'invalid-email',
      password: '123',
      firstName: '',
      lastName: ''
    };
  }

  static getValidProducerProfileData(overrides = {}) {
    // Alineado con la tabla PERFIL_PRODUCTOR
    return {
      nombre_negocio: `Negocio Test ${this.generateTimestamp()}`,
      ubicacion: 'Ciudad Test',
      bio: 'Perfil de productor de prueba',
      telefono: '+593900000000',
      whatsapp: '+593900000000',
      facebook_url: 'https://facebook.com/test',
      instagram_url: 'https://instagram.com/test',
      tiktok_url: 'https://tiktok.com/@test',
      sitio_web: 'https://test.com',
      logo_url: '',
      ...overrides
    };
  }

  static getValidProductData(overrides = {}) {
    // For API calls - aligned with ProductValidator
    return {
      name: `Producto Test ${this.generateTimestamp()}`,
      description: 'Descripción de producto de prueba',
      price: 99.99,
      stock: 10,
      unit: 'kg',
      type: 'producto',
      slug: `producto-test-${this.generateTimestamp()}`,
      categoryId: 1, // Se debe crear una categoría real y pasar el id
      producerProfileId: '', // Se debe crear un perfil real y pasar el id
      ...overrides
    };
  }

  static getValidProductDataForDB(overrides = {}) {
    // For direct database creation - aligned with table schema
    return {
      nombre: `Producto Test ${this.generateTimestamp()}`,
      descripcion: 'Descripción de producto de prueba',
      precio: 99.99,
      stock: 10,
      unidad: 'kg',
      tipo: 'producto',
      slug: `producto-test-${this.generateTimestamp()}`,
      categoria_id: 1, // Se debe crear una categoría real y pasar el id
      perfil_productor_id: '', // Se debe crear un perfil real y pasar el id
      ...overrides
    };
  }

  static getValidCategoryData(overrides = {}) {
    // For API calls - aligned with CategoryValidator
    const timestamp = this.generateTimestamp();
    return {
      name: `Categoría Test ${timestamp}`,
      description: 'Categoría de prueba',
      slug: `categoria-test-${timestamp}`,
      isActive: true,
      order: 0,
      ...overrides
    };
  }

  static getValidCategoryDataForDB(overrides = {}) {
    // For direct database creation - aligned with table schema
    const timestamp = this.generateTimestamp();
    return {
      nombre: `Categoría Test ${timestamp}`,
      descripcion: 'Categoría de prueba',
      slug: `categoria-test-${timestamp}`,
      activo: 1,
      orden: 0,
      ...overrides
    };
  }

  static getValidCartData(overrides = {}) {
    // Alineado con la tabla CARRITOS
    return {
      usuario_id: '', // Se debe pasar el ID del usuario
      estado: 'activo',
      ...overrides
    };
  }

  static getValidCartItemData(overrides = {}) {
    // Alineado con la tabla CARRITO_ITEMS
    return {
      carrito_id: '', // Se debe pasar el ID del carrito
      producto_id: '', // Se debe pasar el ID del producto
      cantidad: 1,
      precio_unitario: 99.99,
      ...overrides
    };
  }

  static getValidInsigniaData(overrides = {}) {
    // Alineado con la tabla INSIGNIAS
    const timestamp = this.generateTimestamp();
    return {
      nombre: `Insignia Test ${timestamp}`,
      descripcion: 'Descripción de insignia de prueba',
      tipo: 'productos',
      umbral_requerido: 10,
      icono_url: 'https://example.com/icon.png',
      activa: true,
      ...overrides
    };
  }

  // Test Data Helper Class - Updated to use service layer
  static async createTestUser(userData = null) {
    try {
      userData = userData || this.getValidUserData();
      
      // Try to register using auth service
      try {
        const result = await authService.register(userData);
        const user = await User.findOne({ where: { email: userData.email } });
        return user;
      } catch (registerError) {
        // If registration fails due to existing user, try to find the user
        if (registerError.message && registerError.message.includes('email ya está registrado')) {
          const existingUser = await User.findOne({ where: { email: userData.email } });
          if (existingUser) {
            return existingUser;
          }
        }
        
        // If registration fails for other reasons, create user directly
        logger.warn('Auth service register failed, creating user directly:', registerError.message);
        
        // Create user directly
        const directUserData = {
          id: uuidv4(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
          roleId: '19e959e4-5239-11f0-8ed1-244bfe6df6f7', // Default user role
          isActive: true,
          failedLoginAttempts: 0,
          forcePasswordChange: false
        };
        
        const user = await User.create(directUserData);
        return user;
      }
    } catch (error) {
      logger.error('Error creating test user:', error);
      throw error;
    }
  }

  static async createTestProducerProfile(userId, profileData = null) {
    try {
      const data = profileData || this.getValidProducerProfileData();
      const profile = await ProducerProfile.create({
        ...data,
        PRODUCTOR_ID: userId
      });
      return profile;
    } catch (error) {
      logger.error('Error creating test producer profile:', error);
      throw error;
    }
}

  // Helper to create category directly in database (for cart tests)
  static async createTestCategory(categoryData = null) {
    try {
      const data = categoryData || TestData.getValidCategoryDataForDB();
      const category = await Category.create(data);
      return category;
    } catch (error) {
      logger.error('Error creating test category in database:', error);
      throw error;
    }
  }

  // Helper to create product directly in database (for cart tests)
  static async createTestProduct(categoryId, producerProfileId, productData = null) {
    try {
      const data = productData || TestData.getValidProductDataForDB({
        categoria_id: categoryId,
        perfil_productor_id: producerProfileId
      });
      
      const product = await Product.create({
        ...data,
        activo: 1,
        destacado: 0,
        vistas: 0,
        created_at: new Date(),
        updated_at: new Date()
      });
      return product;
    } catch (error) {
      logger.error('Error creating test product in database:', error);
      throw error;
    }
  }

  // Helper to create insignia directly in database (for insignia tests)
  static async createTestInsignia(insigniaData = null) {
    try {
      const data = insigniaData || TestData.getValidInsigniaData();
      const insignia = await Insignia.create(data);
      return insignia;
    } catch (error) {
      logger.error('Error creating test insignia in database:', error);
      throw error;
    }
  }
}

// Clase para validaciones de respuestas (SRP: Responsabilidad única para validaciones)
export class TestAssertions {
  static validateSuccessResponse(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.status).toBe('success');
  }

  static validateErrorResponse(response, statusCode, message = null) {
    expect(response.status).toBe(statusCode);
    expect(response.body.status).toBe('error');
    if (message) {
      expect(response.body.message).toBe(message);
    } else {
      expect(response.body.message).toBeDefined();
    }
  }

  static validateUserResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).not.toHaveProperty('password');
  }

  static validateProductResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('nombre');
    expect(response.body.data).toHaveProperty('precio');
  }

  static validateCategoryResponse(response) {
    this.validateSuccessResponse(response, 201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('nombre');
    expect(response.body.data).toHaveProperty('descripcion');
  }

  // Test Assertions Helper class
  static assertSuccessResponse(response, status = 200) {
    expect(response.status).toBe(status);
    // Check for either 'status' or 'success' property depending on the API response format
    if (response.body.hasOwnProperty('status')) {
      expect(response.body).toHaveProperty('status', 'success');
    } else if (response.body.hasOwnProperty('success')) {
      expect(response.body).toHaveProperty('success', true);
    } else {
      throw new Error('Response must have either "status" or "success" property');
    }
    return response.body;
  }

  static assertErrorResponse(response, status = 400) {
    expect(response.status).toBe(status);
    expect(response.body).toHaveProperty('status', 'error');
    return response.body;
  }

  static assertValidProducerProfileResponse(profile) {
    expect(profile).toBeDefined();
    expect(profile).toHaveProperty('PRODUCTOR_ID');
    expect(profile).toHaveProperty('nombre_negocio');
    expect(profile).toHaveProperty('ubicacion');
    expect(profile).toHaveProperty('bio');
    expect(profile).toHaveProperty('telefono');
  }

  static assertValidAuthResponse(response) {
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('email');
    expect(response.body.user).toHaveProperty('roleId');
  }
}

// Clase para operaciones de base de datos (SRP: Responsabilidad única para BD)
export class TestDatabase {
  // Limpia todos los perfiles de productor (para tests)
  static async clearProducerProfiles() {
    try {
      await ProducerProfile.destroy({ where: {}, force: true });
      // También puede limpiar dependencias si es necesario (reviews, ratings, etc.)
      // await Review.destroy({ where: {}, force: true });
      // await SellerRating.destroy({ where: {}, force: true });
    } catch (error) {
      logger.error('Error clearing producer profiles:', error);
      throw error;
    }
  }

  // Limpia todos los carritos de compras (para tests)
  static async clearCarts() {
    try {
      // First try to clear cart items, then carts
      await CartItem.destroy({ where: {}, force: true });
      await Cart.destroy({ where: {}, force: true });
      logger.info('Carts and cart items cleared successfully');
    } catch (error) {
      // If tables don't exist, that's okay for tests
      if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_NO_SUCH_TABLE') {
        logger.info('Cart tables do not exist, skipping cleanup');
        return;
      }
      logger.error('Error clearing carts:', error);
      throw error;
    }
  }

  // Limpia todas las insignias (para tests)
  static async clearInsignias() {
    try {
      // First clear user-insignia associations, then insignias
      await UsuarioInsignia.destroy({ where: {}, force: true });
      await Insignia.destroy({ where: {}, force: true });
      logger.info('Insignias and user associations cleared successfully');
    } catch (error) {
      // If tables don't exist, that's okay for tests
      if (error.name === 'SequelizeDatabaseError' && error.original?.code === 'ER_NO_SUCH_TABLE') {
        logger.info('Insignia tables do not exist, skipping cleanup');
        return;
      }
      logger.error('Error clearing insignias:', error);
      throw error;
    }
  }

  // Dependency Inversion: Use DatabaseSeeder instead of direct role creation
  static async seedRoles() {
    return await DatabaseSeeder.seedRoles();
  }

  // Updated to use DatabaseSeeder
  static async seedTestRoles() {
    return await DatabaseSeeder.seedRoles();
  }

  static async cleanupUsers() {
    try {
      await User.destroy({ where: {}, truncate: true, cascade: true });
      logger.info('Users cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up users:', error);
      throw error;
    }
  }

  // Dependency Inversion: Use factory instead of direct creation
  static async createTestUser(userData = null) {
    try {
      const data = userData || TestData.getValidUserData();
      const result = await TestUserFactory.createUserThroughService(data);
      return result.user;
    } catch (error) {
      logger.error('Error creating test user:', error);
      throw error;
    }
  }

  static async createTestUserWithRole(userData, roleName = 'user') {
    try {
      await this.seedRoles();
      const role = await Role.findOne({ where: { nombre: roleName } });
      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }
      
      const userDataWithRole = {
        ...userData,
        roleId: role.id
      };
      
      const result = await TestUserFactory.createUserThroughService(userDataWithRole);
      
      // Asegurar que el rol esté asignado en la tabla USUARIO_ROLES
      await DatabaseSeeder.assignUserRole(result.user.id, roleName);
      
      return result.user;
    } catch (error) {
      logger.error(`Error creating test user with role ${roleName}:`, error);
      throw error;
    }
  }



  static async getTestRole(roleName = 'user') {
    try {
      const role = await Role.findOne({ where: { nombre: roleName } });
      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }
      return role;
    } catch (error) {
      logger.error('Error getting test role:', error);
      throw error;
    }
  }

  // Single Responsibility: Only handles token creation
  static async getAuthToken(userData = null) {
    try {
      await this.seedTestRoles();
      const testUserData = userData || TestData.getValidUserData();
      
      // Check if user exists first
      let user = await User.findOne({ where: { email: testUserData.email } });
      if (!user) {
        // Create user through service layer (ensures proper validation and hashing)
        const authResponse = await authService.register(testUserData);
        return authResponse.token;
      } else {
        // User exists, login with original password
        try {
          const authResponse = await authService.login(testUserData.email, testUserData.password);
          return authResponse.token;
        } catch (loginError) {
          // If login fails, it might be an existing user from direct DB creation
          // Try with the default test password
          if (testUserData.password !== 'Password123!') {
            const authResponse = await authService.login(testUserData.email, 'Password123!');
            return authResponse.token;
          }
          throw loginError;
        }
      }
    } catch (error) {
      logger.error('Error getting auth token:', error);
      throw error;
    }
  }

  // Single Responsibility: Only handles user creation and retrieval
  static async getOrCreateTestUser(userData = null) {
    try {
      await this.seedTestRoles();
      const testUserData = userData || TestData.getValidUserData();
      
      // Try to find existing user first
      let user = await User.findOne({ where: { email: testUserData.email } });
      if (user) {
        // Generate auth token for existing user
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email,
            roleId: user.roleId 
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        return { user, token, isNew: false };
      }

      // Create new user directly through database using transaction
      const transaction = await sequelize.transaction();
      
      try {
        const hashedPassword = await bcrypt.hash(testUserData.password, 10);
        
        const userRole = await Role.findOne({ where: { nombre: 'user' } });
        if (!userRole) throw new Error('User role not found');
        
        user = await User.create({
          email: testUserData.email,
          password: hashedPassword,
          firstName: testUserData.firstName || 'Test',
          lastName: testUserData.lastName || 'User',
          roleId: userRole.id,
          isActive: true,
          failedLoginAttempts: 0,
          forcePasswordChange: false
        }, { transaction });
        
        // Commit the transaction to ensure the user is persisted
        await transaction.commit();
        
        // Reload the user to ensure we have the latest state
        await user.reload();
        
        // Generate auth token for new user
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email,
            roleId: user.roleId 
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        logger.info(`Test user created and committed in DB: ${user.id} with email: ${user.email}`);
        return { user, token, isNew: true };
        
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      
    } catch (error) {
      logger.error('Error getting or creating test user:', error);
      throw error;
    }
  }

  // Single Responsibility: Only handles producer profile creation
  static async createTestProducerProfile(profileData = null, token = null) {
    try {
      // Get base profile data
      const baseProfileData = TestData.getValidProducerProfileData();
      const customProfileData = profileData || {};
      
      let user;
      let authToken = token;

      if (!authToken) {
        // Create or get a test user with token
        const userResult = await this.getOrCreateTestUser();
        user = userResult.user;
        authToken = userResult.token;
      } else {
        // Extract user info from existing token (JWT verification)
        try {
          const jwt = await import('jsonwebtoken');
          const jwtLib = jwt.default || jwt;
          const decoded = jwtLib.verify(authToken, process.env.JWT_SECRET);
          user = await User.findByPk(decoded.id);
          
          if (!user) {
            logger.info('User from token not found in database, creating new user');
            const userResult = await this.getOrCreateTestUser();
            user = userResult.user;
            authToken = userResult.token;
          }
        } catch (jwtError) {
          logger.info('Invalid token provided, creating new user');
          const userResult = await this.getOrCreateTestUser();
          user = userResult.user;
          authToken = userResult.token;
        }
      }

      // CRITICAL: Force refresh from database and wait for transaction commit
      await user.reload();
      
      // Add explicit delay to ensure DB commit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Triple-check the user exists in the database with raw query
      const [userExists] = await sequelize.query(
        'SELECT id FROM users WHERE id = :userId',
        {
          replacements: { userId: user.id },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (!userExists) {
        logger.error(`User ${user.id} not found in database even after checks, creating new user`);
        const userResult = await this.getOrCreateTestUser();
        user = userResult.user;
        authToken = userResult.token;
        await user.reload();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if profile already exists for this user
      const existingProfile = await ProducerProfile.findOne({ where: { usuario_id: user.id } });
      if (existingProfile) {
        logger.info(`Producer profile already exists for user ${user.id}`);
        return existingProfile;
      }

      // Create the profile with the correct user ID
      const profileToCreate = {
        ...baseProfileData,
        ...customProfileData,
        id: uuidv4(),
        usuario_id: user.id, // Use the actual user ID from database
        verificado: 0,
        activo: 1
      };

      logger.info(`Creating producer profile for verified user: ${user.id}`);
      const profile = await ProducerProfile.create(profileToCreate);
      logger.info(`Producer profile created successfully: ${profile.id} for user: ${user.id}`);
      return profile;

    } catch (error) {
      logger.error('Error creating test producer profile:', error);
      throw error;
    }
  }

  static async createTestCategory(categoryData = null, token = null) {
    try {
      const data = categoryData || TestData.getValidCategoryData();
      const authToken = token || await this.getAuthToken();
      
      // Create a test category
      const categoryResponse = await request(TestSetup.app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data);
      
      if (categoryResponse.status !== 201 || !categoryResponse.body.data) {
        logger.error('Failed to create category:', categoryResponse.body);
        
        // If creation failed, try to use an existing category
        const existingCategoriesResponse = await request(TestSetup.app)
          .get('/api/categories')
          .set('Authorization', `Bearer ${authToken}`);
          
        if (existingCategoriesResponse.status === 200 && 
            existingCategoriesResponse.body.data && 
            existingCategoriesResponse.body.data.length > 0) {
          return existingCategoriesResponse.body.data[0];
        }
        
        // If we still don't have a category, create one directly in the database
        const category = await Category.create(TestData.getValidCategoryDataForDB());
        return category;
      }
      
      return categoryResponse.body.data;
    } catch (error) {
      logger.error('Error creating test category:', error);
      // As a last resort, try to create directly in the database
      try {
        const data = categoryData || TestData.getValidCategoryDataForDB();
        const category = await Category.create(data);
        return category;
      } catch (dbError) {
        logger.error('Error creating category in database:', dbError);
        throw error;
      }
    }
  }

  static async createTestProduct(productData = null, token = null) {
    try {
      // Crea una categoría y un perfil de productor primero si es necesario
      const authToken = token || await this.getAuthToken();
      
      // Get or create a category
      const category = await this.createTestCategory(null, authToken);
      if (!category || !category.id) {
        throw new Error('Failed to create or get category');
      }
      
      // Get or create a producer profile
      const producer = await this.createTestProducerProfile(null, authToken);
      if (!producer || !producer.id) {
        throw new Error('Failed to create or get producer profile');
      }
      
      // Prepare product data with correct IDs
      const data = productData || TestData.getValidProductData({
        categoryId: category.id,
        producerProfileId: producer.id
      });
      
      // Create product
      const productResponse = await request(TestSetup.app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data);
      
      if (productResponse.status !== 201 || !productResponse.body.data) {
        logger.error('Failed to create product:', productResponse.body);
        
        // Try to get an existing product
        const existingProductsResponse = await request(TestSetup.app)
          .get('/api/products')
          .set('Authorization', `Bearer ${authToken}`);
          
        if (existingProductsResponse.status === 200 && 
            existingProductsResponse.body.data && 
            existingProductsResponse.body.data.length > 0) {
          return existingProductsResponse.body.data[0];
        }
        
        // If we still don't have a product, create one directly in the database
        const product = await Product.create({
          ...TestData.getValidProductDataForDB({
            categoria_id: category.id,
            perfil_productor_id: producer.id
          }),
          activo: 1,
          destacado: 0,
          vistas: 0,
          created_at: new Date(),
          updated_at: new Date()
        });
        return product;
      }
      
      return productResponse.body.data;
    } catch (error) {
      logger.error('Error creating test product:', error);
      throw error;
    }
  }

  static async createTestContact(producerProfileId, token = null) {
    try {
      if (!producerProfileId) {
        // Create a producer profile if not provided
        const producer = await this.createTestProducerProfile(null, token);
        if (!producer || !producer.id) {
          throw new Error('Failed to create producer profile for contact');
        }
        producerProfileId = producer.id;
      }
      
      const data = {
        emprendedor_id: producerProfileId,
        nombre_contacto: 'Test Contact',
        email_contacto: TestData.generateUniqueEmail('contact'),
        telefono_contacto: '+593911111111',
        mensaje: 'Mensaje de prueba',
      };
      
      const authToken = token || await this.getAuthToken();
      const contactResponse = await request(TestSetup.app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(data);
      
      if (contactResponse.status !== 201 || !contactResponse.body.data) {
        logger.error('Failed to create contact:', contactResponse.body);
        
        // Create contact directly in the database as a fallback
        const contact = await Contact.create({
          ...data,
          estado: 'nuevo',
          created_at: new Date(),
          updated_at: new Date()
        });
        return contact;
      }
      
      return contactResponse.body.data;
    } catch (error) {
      logger.error('Error creating test contact:', error);
      throw error;
    }
  }

  // Helper to create test cart directly in database
  static async createTestCart(userId, cartData = null) {
    try {
      const data = cartData || TestData.getValidCartData({ usuario_id: userId });
      const cart = await Cart.create({
        ...data,
        id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      });
      return cart;
    } catch (error) {
      logger.error('Error creating test cart in database:', error);
      throw error;
    }
  }

  // Helper to create test cart item directly in database
  static async createTestCartItem(cartId, productId, cartItemData = null) {
    try {
      const data = cartItemData || TestData.getValidCartItemData({
        carrito_id: cartId,
        producto_id: productId
      });
      const cartItem = await CartItem.create({
        ...data,
        id: uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      });
      return cartItem;
    } catch (error) {
      logger.error('Error creating test cart item in database:', error);
      throw error;
    }
  }
}

// Clase para operaciones HTTP (SRP: Responsabilidad única para HTTP)
export class TestHttpClient {
  static async registerUser(userData) {
    const data = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    
    return request(TestSetup.app)
      .post('/api/auth/register')
      .send(data);
  }

  static async loginUser(credentials) {
    const data = {
      email: credentials.email,
      password: credentials.password
    };
    
    return request(TestSetup.app)
      .post('/api/auth/login')
      .send(data);
  }

  static async logoutUser(token) {
    return request(TestSetup.app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
  }

  static async getWithAuth(endpoint, token) {
    return request(TestSetup.app)
      .get(endpoint)
      .set('Authorization', `Bearer ${token}`);
  }

  static async postWithAuth(endpoint, data, token) {
    return request(TestSetup.app)
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  static async putWithAuth(endpoint, data, token) {
    return request(TestSetup.app)
      .put(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  static async deleteWithAuth(endpoint, token) {
    return request(TestSetup.app)
      .delete(endpoint)
      .set('Authorization', `Bearer ${token}`);
  }
}

// Factory Pattern: Centralized user creation following SOLID principles
export class TestUserFactory {
  // Single Responsibility: Only handles user creation logic
  static async createUser(userData) {
    try {
      await TestDatabase.seedTestRoles();
      const userRole = await Role.findOne({ where: { nombre: 'user' } });
      if (!userRole) throw new Error('User role not found');
      
      const userToCreate = {
        ...userData,
        roleId: userRole.id
      };
      
      const user = await User.create(userToCreate);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Single Responsibility: Handles user creation through business layer
  static async createUserThroughService(userData) {
    try {
      const response = await authService.register(userData);
      const user = await User.findOne({ where: { email: userData.email } });
      return { user, authResponse: response };
    } catch (error) {
      logger.error('Error creating user through service:', error);
      throw error;
    }
  }
}

// Single Responsibility: Handles database seeding operations
export class DatabaseSeeder {
  // Use consistent UUIDs for test role seeding to avoid foreign key issues
  static USER_ROLE_ID = '19e959e4-5239-11f0-8ed1-244bfe6df6f7';
  static ADMIN_ROLE_ID = '19e959e4-5239-11f0-8ed1-244bfe6df6f8';
  
  // Open/Closed Principle: Easy to extend with new seed methods
  static async seedRoles() {
    try {
      const existingUserRole = await Role.findOne({ where: { nombre: 'user' } });
      const existingAdminRole = await Role.findOne({ where: { nombre: 'admin' } });

      if (!existingUserRole) {
        await Role.create({
          id: this.USER_ROLE_ID,
          nombre: 'user',
          descripcion: 'Usuario regular',
          activo: 1
        });
      }

      if (!existingAdminRole) {
        await Role.create({
          id: this.ADMIN_ROLE_ID,
          nombre: 'admin',
          descripcion: 'Administrador del sistema',
          activo: 1
        });
      }

      // Seed permissions after roles are created
      await this.seedPermissions();

      logger.info('Roles and permissions seeded successfully');
    } catch (error) {
      logger.error('Error seeding roles:', error);
      throw error;
    }
  }

  // Function to seed permissions and role-permission relationships
  static async seedPermissions() {
    try {
      const Permiso = (await import('../../../models/Permiso.js')).default;
      const RolPermisos = (await import('../../../models/RolPermisos.js')).default;
      const UsuarioRoles = (await import('../../../models/UsuarioRoles.js')).default;
      
      // Basic permissions needed for tests
      const permissions = [
        { accion: 'leer', recurso: 'metricas', descripcion: 'Ver métricas y estadísticas' },
        { accion: 'leer', recurso: 'productos', descripcion: 'Ver productos' },
        { accion: 'leer', recurso: 'usuarios', descripcion: 'Ver usuarios' },
        { accion: 'leer', recurso: 'roles', descripcion: 'Ver roles' },
        { accion: 'crear', recurso: 'roles', descripcion: 'Crear roles' },
        { accion: 'actualizar', recurso: 'roles', descripcion: 'Actualizar roles' },
        { accion: 'eliminar', recurso: 'roles', descripcion: 'Eliminar roles' },
        { accion: 'asignar', recurso: 'roles', descripcion: 'Asignar roles a usuarios' },
        { accion: 'administrar', recurso: 'sistema', descripcion: 'Administración completa del sistema' },
        // Permisos de insignias necesarios para los tests
        { accion: 'crear', recurso: 'insignias', descripcion: 'Crear nuevas insignias' },
        { accion: 'leer', recurso: 'insignias', descripcion: 'Ver insignias' },
        { accion: 'actualizar', recurso: 'insignias', descripcion: 'Actualizar insignias' },
        { accion: 'eliminar', recurso: 'insignias', descripcion: 'Eliminar insignias' },
        { accion: 'asignar', recurso: 'insignias', descripcion: 'Otorgar insignias a usuarios' },
        { accion: 'asignar', recurso: 'roles', descripcion: 'Asignar roles a usuarios' },
        { accion: 'administrar', recurso: 'sistema', descripcion: 'Administración completa del sistema' }
      ];
      
      // Create permissions if they don't exist
      for (const permission of permissions) {
        const [permiso] = await Permiso.findOrCreate({
          where: { accion: permission.accion, recurso: permission.recurso },
          defaults: permission
        });
        
        // Assign all permissions to admin role
        const adminRole = await Role.findOne({ where: { nombre: 'admin' } });
        if (adminRole) {
          await RolPermisos.findOrCreate({
            where: { rol_id: adminRole.id, permiso_id: permiso.id },
            defaults: { rol_id: adminRole.id, permiso_id: permiso.id }
          });
        }
      }
      
      logger.info('Permissions seeded successfully for tests');
    } catch (error) {
      logger.error('Error seeding permissions:', error);
      throw error;
    }
  }

  // Function to assign roles to users correctly
  static async assignUserRole(userId, roleName) {
    try {
      const UsuarioRoles = (await import('../../../models/UsuarioRoles.js')).default;
      
      const role = await Role.findOne({ where: { nombre: roleName } });
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }
      
      // Assign role to user in UsuarioRoles table
      await UsuarioRoles.findOrCreate({
        where: { usuario_id: userId, rol_id: role.id },
        defaults: { usuario_id: userId, rol_id: role.id }
      });
      
      logger.info(`Role ${roleName} assigned to user ${userId}`);
    } catch (error) {
      logger.error('Error assigning user role:', error);
      throw error;
    }
  }

  static async seedTestData() {
    try {
      await this.seedRoles();
      // Can be extended with more seeders
      logger.info('Test data seeded successfully');
    } catch (error) {
      logger.error('Error seeding test data:', error);
      throw error;
    }
  }
}

// Individual function exports for backward compatibility and convenience
export const createTestUser = async (emailOrUserData = null, roleName = 'user') => {
  // Handle backward compatibility for different parameter patterns
  let userData;
  
  if (typeof emailOrUserData === 'string') {
    // Legacy pattern: createTestUser('email@test.com', 'roleName')
    userData = {
      email: emailOrUserData,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };
    // Keep the roleName parameter as passed
  } else {
    // New pattern: createTestUser(userDataObject) or createTestUser()
    userData = emailOrUserData || TestData.getValidUserData();
    // If userData is provided but roleName not explicitly set, use default
    if (emailOrUserData && roleName === 'user') {
      roleName = 'user'; // Keep default for object pattern
    }
  }
  
  return await createTestUserWithRole(userData, roleName);
};

export const createTestUserWithRole = async (userData, roleName = 'user') => {
  return await TestDatabase.createTestUserWithRole(userData, roleName);
};

export const createTestCategory = async (categoryData = null) => {
  try {
    const data = categoryData || {
      nombre: `Test Category ${Date.now()}`,
      descripcion: 'Categoría de prueba',
      slug: `categoria-test-${Date.now()}`,
      activo: 1,
      orden: 0
    };
    const category = await Category.create(data);
    return category;
  } catch (error) {
    logger.error('Error creating test category:', error);
    throw error;
  }
};

export const createTestProducerProfile = async (profileData = null) => {
  try {
    // Create a test user if no specific profile is needed
    const testUser = await createTestUser();
    return await TestDatabase.createTestProducerProfile(testUser.id);
  } catch (error) {
    logger.error('Error in createTestProducerProfile export:', error);
    throw error;
  }
};

export const createTestProduct = async (categoryId = null, producerProfileId = null, productData = null) => {
  try {
    // Create category first if not provided
    let categoriaId = categoryId;
    if (!categoriaId) {
      const testCategory = await createTestCategory();
      categoriaId = testCategory.id;
    }

    // Create producer profile if not provided
    let perfilProductorId = producerProfileId;
    if (!perfilProductorId) {
      const testProfile = await createTestProducerProfile();
      perfilProductorId = testProfile.id;
    }

    const baseData = TestData.getValidProductDataForDB();
    const data = {
      ...baseData,
      categoria_id: categoriaId,
      perfil_productor_id: perfilProductorId,
      activo: 1,
      destacado: 0,
      vistas: 0,
      created_at: new Date(),
      updated_at: new Date(),
      ...productData // Override with any provided data
    };
    
    const product = await Product.create(data);
    return product;
  } catch (error) {
    logger.error('Error creating test product:', error);
    throw error;
  }
};

export const getTestToken = async (userData = null) => {
  try {
    const user = await createTestUser(userData);
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        roleId: user.roleId 
      },
      TestTokenService.getJwtSecret(),
      { expiresIn: '1h' }
    );
    return { token, user };
  } catch (error) {
    logger.error('Error getting test token:', error);
    throw error;
  }
};

export const generateTokenForUser = (user) => {
  try {
    const secret = process.env.JWT_SECRET || 'test_secret_key_emprendimiento_platform_2024_secure';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roleId: user.roleId 
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    return token;
  } catch (error) {
    logger.error('Error generating token for user:', error);
    throw error;
  }
};

export const assignUserRole = async (userId, roleName) => {
  return await DatabaseSeeder.assignUserRole(userId, roleName);
};

// Helper function to clean up test data
export const cleanupTestData = async () => {
  try {
    // Import Order models here to avoid circular dependency issues
    const { default: Order } = await import('../../../models/Order.js');
    const { default: OrderItem } = await import('../../../models/OrderItem.js');
    
    // Clean up in order of dependencies
    await OrderItem.destroy({ where: {}, force: true });
    await Order.destroy({ where: {}, force: true });
    await TestDatabase.clearCarts();
    await Product.destroy({ where: {}, force: true });
    await ProducerProfile.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await Contact.destroy({ where: {}, force: true });
    await Review.destroy({ where: {}, force: true });
    await SellerRating.destroy({ where: {}, force: true });
    await TestDatabase.cleanupUsers();
    
    logger.info('Test data cleaned up successfully');
  } catch (error) {
    // If tables don't exist, that's okay for tests
    if (error.name === 'SequelizeDatabaseError' && 
        (error.original?.code === 'ER_NO_SUCH_TABLE' || error.original?.errno === 1146)) {
      logger.info('Some tables do not exist, skipping cleanup');
      return;
    }
    logger.error('Error cleaning up test data:', error);
    throw error;
  }
};