import request from 'supertest';
import { createApp } from '../src/app';
import { connectTestDB, disconnectTestDB, clearTestDB } from './helpers/testDb';
import { createOnboardedAgent } from './helpers/authAgent';

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

const entryPayload = {
  date: '2024-05-01',
  sleepHours: 7.5,
  energy: 7,
  mood: 6,
  productivity: 8,
  exercise: true,
  note: 'Felt great',
};

describe('POST /api/entries', () => {
  it('creates a daily entry for the authenticated user', async () => {
    const { agent } = await createOnboardedAgent(app);

    const res = await agent.post('/api/entries').send(entryPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.entry.date).toBe('2024-05-01');
    expect(res.body.data.entry.sleepHours).toBe(7.5);
  });

  it('prevents duplicate entries for the same user/date', async () => {
    const { agent } = await createOnboardedAgent(app);

    await agent.post('/api/entries').send(entryPayload);
    const res = await agent.post('/api/entries').send(entryPayload);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_ENTRY');
  });

  it('allows the same date for two different users', async () => {
    const { agent: agentA } = await createOnboardedAgent(app);
    const { agent: agentB } = await createOnboardedAgent(app);

    const resA = await agentA.post('/api/entries').send(entryPayload);
    const resB = await agentB.post('/api/entries').send(entryPayload);

    expect(resA.status).toBe(201);
    expect(resB.status).toBe(201);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/entries').send(entryPayload);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/entries/today', () => {
  it('returns null when no entry exists for the given date', async () => {
    const { agent } = await createOnboardedAgent(app);
    const res = await agent.get('/api/entries/today').query({ date: '2024-05-01' });

    expect(res.status).toBe(200);
    expect(res.body.data.entry).toBeNull();
  });

  it('returns the entry once created', async () => {
    const { agent } = await createOnboardedAgent(app);
    await agent.post('/api/entries').send(entryPayload);

    const res = await agent.get('/api/entries/today').query({ date: '2024-05-01' });
    expect(res.body.data.entry.sleepHours).toBe(7.5);
  });
});
