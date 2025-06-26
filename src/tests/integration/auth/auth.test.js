import { TestSetup, globalTestConfig } from '../config/test-setup.js';
import { TestData, TestAssertions, TestDatabase, TestHttpClient } from '../config/test-helpers.js';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await TestSetup.setupTestEnvironment();
    await TestSetup.setupTestDatabase();
    await TestDatabase.seedRoles();
  }, globalTestConfig.testTimeout);

  afterAll(async () => {
    await TestSetup.cleanupTestEnvironment();
  }, globalTestConfig.testTimeout);

  beforeEach(async () => {
    await TestDatabase.cleanupUsers();
  }, globalTestConfig.testTimeout);

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = TestData.getValidUserData();
      const response = await TestHttpClient.registerUser(userData);
      TestAssertions.validateUserResponse(response);
    }, globalTestConfig.testTimeout);

    it('should not register a user with invalid data', async () => {
      const userData = TestData.getInvalidUserData();
      const response = await TestHttpClient.registerUser(userData);
      
      // El mensaje puede ser específico sobre la contraseña o formato de email
      TestAssertions.validateErrorResponse(response, 400);
      // Solo verificamos que el estado sea error, no el mensaje exacto
    }, globalTestConfig.testTimeout);

    it('should not register a user with existing email', async () => {
      const userData = TestData.getValidUserData();
      await TestHttpClient.registerUser(userData);
      const response = await TestHttpClient.registerUser(userData);
      TestAssertions.validateErrorResponse(response, 400, 'El email ya está registrado');
    }, globalTestConfig.testTimeout);

    it('should not register a user with weak password', async () => {
      const userData = TestData.getValidUserData({
        password: '123'
      });
      const response = await TestHttpClient.registerUser(userData);
      // Validar que el error sea por contraseña débil, no solo 'Datos de usuario inválidos'
      TestAssertions.validateErrorResponse(response, 400);
      expect(response.body.message).toContain('contraseña');
    }, globalTestConfig.testTimeout);

    it('should not register a user with invalid email format', async () => {
      const userData = TestData.getValidUserData({
        email: 'invalid-email-format'
      });
      const response = await TestHttpClient.registerUser(userData);
      TestAssertions.validateErrorResponse(response, 400, 'Datos de usuario inválidos');
    }, globalTestConfig.testTimeout);
  });

  describe('POST /api/auth/login', () => {
    let userData;

    beforeEach(async () => {
      userData = TestData.getValidUserData();
      await TestHttpClient.registerUser(userData);
    }, globalTestConfig.testTimeout);

    it('should login with valid credentials', async () => {
      const response = await TestHttpClient.loginUser({
        email: userData.email,
        password: userData.password
      });

      TestAssertions.validateSuccessResponse(response, 200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
    }, globalTestConfig.testTimeout);

    it('should not login with invalid password', async () => {
      const response = await TestHttpClient.loginUser({
        email: userData.email,
        password: 'wrongpassword'
      });
      TestAssertions.validateErrorResponse(response, 401, 'Credenciales inválidas');
    }, globalTestConfig.testTimeout);

    it('should not login with non-existent email', async () => {
      const response = await TestHttpClient.loginUser({
        email: 'nonexistent@example.com',
        password: userData.password
      });
      TestAssertions.validateErrorResponse(response, 401, 'Credenciales inválidas');
    }, globalTestConfig.testTimeout);

    it('should not login with empty credentials', async () => {
      const response = await TestHttpClient.loginUser({
        email: '',
        password: ''
      });
      TestAssertions.validateErrorResponse(response, 400);
    }, globalTestConfig.testTimeout);
  });

  describe('POST /api/auth/logout', () => {
    let authToken = '';

    beforeEach(async () => {
      const userData = TestData.getValidUserData();
      await TestHttpClient.registerUser(userData);
      const loginResponse = await TestHttpClient.loginUser({
        email: userData.email,
        password: userData.password
      });
      authToken = loginResponse.body.data.token;
    }, globalTestConfig.testTimeout);

    it('should logout successfully with valid token', async () => {
      const response = await TestHttpClient.logoutUser(authToken);

      TestAssertions.validateSuccessResponse(response, 200);
      expect(response.body.message).toBe('Sesión cerrada exitosamente');
    }, globalTestConfig.testTimeout);

    it('should not logout without token', async () => {
      const response = await TestHttpClient.logoutUser('');
      TestAssertions.validateErrorResponse(response, 401, 'No se proporcionó token de autenticación');
    }, globalTestConfig.testTimeout);

    it('should not logout with invalid token', async () => {
      const response = await TestHttpClient.logoutUser('invalid-token');
      TestAssertions.validateErrorResponse(response, 401);
    }, globalTestConfig.testTimeout);
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return not implemented status', async () => {
      const response = await TestHttpClient.postWithAuth('/api/auth/forgot-password', {}, '');
      TestAssertions.validateErrorResponse(response, 501, 'Endpoint en construcción');
    }, globalTestConfig.testTimeout);
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return not implemented status', async () => {
      const response = await TestHttpClient.postWithAuth('/api/auth/reset-password', {}, '');
      TestAssertions.validateErrorResponse(response, 501, 'Endpoint en construcción');
    }, globalTestConfig.testTimeout);
  });
});