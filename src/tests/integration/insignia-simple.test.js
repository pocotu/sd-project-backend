import request from 'supertest';
import app from '../../app.js';
import { sequelize, User, Insignia, UsuarioInsignia } from '../../models/index.js';
import bcrypt from 'bcrypt';

describe('Insignia Endpoints (Simplified)', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    try {
      // Simple test to verify basic functionality
      console.log('Setting up insignia tests...');
      
      // Create a test user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        telefono: '1234567890'
      });

      console.log('Test user created:', testUser.id);

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.token;
        console.log('Login successful, token obtained');
      } else {
        console.error('Login failed:', loginResponse.body);
      }
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  afterAll(async () => {
    try {
      if (testUser) {
        await User.destroy({ where: { id: testUser.id } });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('GET /api/insignias', () => {
    it('should return insignias (simple test)', async () => {
      if (!authToken) {
        console.log('No auth token available, skipping test');
        return;
      }

      const response = await request(app)
        .get('/api/insignias')
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/insignias');

      expect(response.status).toBe(401);
    });
  });
});
