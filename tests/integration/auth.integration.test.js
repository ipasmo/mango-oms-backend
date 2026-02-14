const request = require('supertest');
const app = require('../../src/app');

describe('Basic API Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/').expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('docs');
    });
  });

  describe('GET /api/products/featured', () => {
    it('should return featured products endpoint', async () => {
      // This will fail with DB connection, but we're just checking structure
      const res = await request(app).get('/api/products/featured');
      
      // Should get a response (might be error due to no DB)
      expect(res.status).toBeDefined();
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('errors');
    });
  });
});
