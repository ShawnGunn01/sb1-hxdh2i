import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app'; // Import your Express app
import { createToken } from '../../utils/auth';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('API Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create a test user and generate a token
    const testUser = { id: 'testuser123', role: 'admin' };
    authToken = createToken(testUser);
  });

  describe('Authentication API', () => {
    test('POST /api/auth/register - Register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    test('POST /api/auth/login - Login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    test('GET /api/auth/profile - Get user profile', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
    });
  });

  describe('Games API', () => {
    let gameId: string;

    test('POST /api/games - Create a new game', async () => {
      const res = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Game',
          description: 'A test game',
          apiEndpoint: 'http://testgame.com/api'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      gameId = res.body.id;
    });

    test('GET /api/games - Get all games', async () => {
      const res = await request(app)
        .get('/api/games')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /api/games/:id - Get a specific game', async () => {
      const res = await request(app)
        .get(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', gameId);
    });

    test('PUT /api/games/:id - Update a game', async () => {
      const res = await request(app)
        .put(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Game'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Test Game');
    });

    test('DELETE /api/games/:id - Delete a game', async () => {
      const res = await request(app)
        .delete(`/api/games/${gameId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Tournaments API', () => {
    let tournamentId: string;

    test('POST /api/tournaments - Create a new tournament', async () => {
      const res = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Tournament',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000), // 1 day from now
          maxParticipants: 100,
          entryFee: 50,
          prize: 1000
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      tournamentId = res.body.id;
    });

    test('GET /api/tournaments - Get all tournaments', async () => {
      const res = await request(app)
        .get('/api/tournaments')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /api/tournaments/:id - Get a specific tournament', async () => {
      const res = await request(app)
        .get(`/api/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', tournamentId);
    });

    test('PUT /api/tournaments/:id - Update a tournament', async () => {
      const res = await request(app)
        .put(`/api/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Tournament'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Test Tournament');
    });

    test('POST /api/tournaments/:id/join - Join a tournament', async () => {
      const res = await request(app)
        .post(`/api/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    test('DELETE /api/tournaments/:id - Delete a tournament', async () => {
      const res = await request(app)
        .delete(`/api/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Payments API', () => {
    test('GET /api/payments/wallet - Get wallet balance', async () => {
      const res = await request(app)
        .get('/api/payments/wallet')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currency');
      expect(res.body).toHaveProperty('tokens');
    });

    test('POST /api/payments/deposit - Make a deposit', async () => {
      const res = await request(app)
        .post('/api/payments/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          processor: 'stripe',
          token: 'tok_visa'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Deposit successful');
    });

    test('POST /api/payments/withdraw - Request a withdrawal', async () => {
      const res = await request(app)
        .post('/api/payments/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50,
          method: 'bank_transfer'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Withdrawal request submitted successfully');
    });
  });

  describe('Reports API', () => {
    test('GET /api/reports - Get report data', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          type: 'overview'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('userGrowth');
      expect(res.body).toHaveProperty('revenueByGame');
      expect(res.body).toHaveProperty('tournamentParticipation');
    });
  });

  describe('Admin API', () => {
    test('GET /api/admin/users - Get all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /api/admin/financial-reports - Get financial reports (admin only)', async () => {
      const res = await request(app)
        .get('/api/admin/financial-reports')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('revenue');
      expect(res.body).toHaveProperty('expenses');
      expect(res.body).toHaveProperty('profit');
    });
  });
});