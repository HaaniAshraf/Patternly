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

describe('user data isolation', () => {
  it('never returns another user entry by id', async () => {
    const { agent: userA } = await createOnboardedAgent(app);
    const { agent: userB } = await createOnboardedAgent(app);

    const created = await userA.post('/api/entries').send({
      date: '2024-05-01',
      sleepHours: 7,
      energy: 5,
      mood: 5,
      productivity: 5,
      exercise: false,
    });
    const entryId = created.body.data.entry.id;

    const res = await userB.get(`/api/entries/${entryId}`);
    expect(res.status).toBe(404);
  });

  it('does not leak entries into another user list', async () => {
    const { agent: userA } = await createOnboardedAgent(app);
    const { agent: userB } = await createOnboardedAgent(app);

    await userA.post('/api/entries').send({
      date: '2024-05-01',
      sleepHours: 7,
      energy: 5,
      mood: 5,
      productivity: 5,
      exercise: false,
    });

    const res = await userB.get('/api/entries');
    expect(res.status).toBe(200);
    expect(res.body.data.entries).toHaveLength(0);
  });

  it('cannot delete another user entry', async () => {
    const { agent: userA } = await createOnboardedAgent(app);
    const { agent: userB } = await createOnboardedAgent(app);

    const created = await userA.post('/api/entries').send({
      date: '2024-05-01',
      sleepHours: 7,
      energy: 5,
      mood: 5,
      productivity: 5,
      exercise: false,
    });
    const entryId = created.body.data.entry.id;

    const deleteRes = await userB.delete(`/api/entries/${entryId}`);
    expect(deleteRes.status).toBe(404);

    const stillThere = await userA.get(`/api/entries/${entryId}`);
    expect(stillThere.status).toBe(200);
  });
});
