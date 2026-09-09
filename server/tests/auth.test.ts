import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, disconnectTestDB, clearTestDB } from './helpers/testDb';

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

const validUser = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

describe('POST /api/auth/register', () => {
  it('creates a new account and sets an auth cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/patternly_token=/);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('EMAIL_IN_USE');
  });

  it('rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short', confirmPassword: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects mismatched password confirmation', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, confirmPassword: 'somethingElse123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('auth middleware', () => {
  it('rejects /api/auth/me without a session cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows /api/auth/me with a valid session cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(validUser);

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});
