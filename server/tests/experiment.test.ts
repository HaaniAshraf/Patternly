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

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

describe('experiment lifecycle', () => {
  it('creates, starts, and calculates a completed experiment result', async () => {
    const { agent } = await createOnboardedAgent(app);

    const createRes = await agent.post('/api/experiments').send({
      title: 'Exercise -> Productivity',
      hypothesis: 'Exercising before work improves my productivity.',
      baselineDays: 7,
      experimentDays: 7,
      primaryMetric: 'productivity',
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.experiment.status).toBe('draft');

    const experimentId = createRes.body.data.experiment.id;
    const startRes = await agent.post(`/api/experiments/${experimentId}/start`);
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.experiment.status).toBe('baseline');

    const { baseline, experimentPeriod } = startRes.body.data.experiment;
    const baselineStart = new Date(baseline.startDate);
    const experimentStart = new Date(experimentPeriod.startDate);

    // Log lower productivity during baseline, higher during the experiment period.
    for (let i = 0; i < 7; i += 1) {
      await agent.post('/api/entries').send({
        date: isoDate(addDays(baselineStart, i)),
        sleepHours: 7,
        energy: 5,
        mood: 5,
        productivity: 5,
        exercise: false,
      });
    }
    for (let i = 0; i < 7; i += 1) {
      await agent.post('/api/entries').send({
        date: isoDate(addDays(experimentStart, i)),
        sleepHours: 7,
        energy: 6,
        mood: 6,
        productivity: 8,
        exercise: true,
      });
    }

    const completeRes = await agent.post(`/api/experiments/${experimentId}/complete`);
    expect(completeRes.status).toBe(200);

    const { result } = completeRes.body.data.experiment;
    expect(result.baselineValue).toBeCloseTo(5, 1);
    expect(result.experimentValue).toBeCloseTo(8, 1);
    expect(result.percentageChange).toBeGreaterThan(0);
    expect(completeRes.body.data.experiment.status).toBe('completed');
  });

  it('enforces the free plan active-experiment limit', async () => {
    const { agent } = await createOnboardedAgent(app);

    const first = await agent.post('/api/experiments').send({
      title: 'First experiment',
      hypothesis: 'Testing something.',
      baselineDays: 7,
      experimentDays: 7,
      primaryMetric: 'productivity',
    });
    await agent.post(`/api/experiments/${first.body.data.experiment.id}/start`);

    const second = await agent.post('/api/experiments').send({
      title: 'Second experiment',
      hypothesis: 'Testing something else.',
      baselineDays: 7,
      experimentDays: 7,
      primaryMetric: 'mood',
    });

    expect(second.status).toBe(403);
    expect(second.body.code).toBe('EXPERIMENT_LIMIT_REACHED');
  });
});
