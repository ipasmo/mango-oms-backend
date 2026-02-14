const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'Password@123',
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with weak password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'weak',
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'Password@123',
      };

      // Create first user
      await request(app).post('/api/auth/signup').send(userData);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '+1234567890',
        password: 'Password@123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'jane@example.com',
        password: 'Password@123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', credentials.email);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with incorrect password', async () => {
      const credentials = {
        email: 'jane@example.com',
        password: 'WrongPassword@123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password@123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      // Register and get token
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'Password@123',
      };

      const res = await request(app).post('/api/auth/signup').send(userData);
      token = res.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/profile').expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
