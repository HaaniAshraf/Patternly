import { compareGroups, analyzeCandidates, MIN_TOTAL_DAYS } from '../src/services/patternEngine.service';

function makeEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    sleepHours: 7,
    energy: 5,
    mood: 5,
    productivity: 5,
    exercise: false,
    ...overrides,
  } as any;
}

describe('compareGroups', () => {
  it('returns null when a group is too small', () => {
    const result = compareGroups([7, 8], [6, 6, 6], 'A', 'B');
    expect(result).toBeNull();
  });

  it('computes a strong, clearly-different comparison', () => {
    const groupA = [8, 8.5, 9, 8, 8.5, 9, 8.5, 9, 8, 8.5];
    const groupB = [5, 5.5, 6, 5, 5.5, 6, 5, 5.5, 6, 5];

    const result = compareGroups(groupA, groupB, 'Exercise days', 'Non-exercise days');

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe('strong');
    expect(result!.statistics.difference).toBeGreaterThan(0);
    expect(result!.statistics.sampleSize).toBe(20);
  });

  it('reports insufficient confidence when groups have the same mean', () => {
    const groupA = [4, 6, 8, 5, 7];
    const groupB = [5, 7, 4, 8, 6];

    const result = compareGroups(groupA, groupB, 'A', 'B');
    expect(result!.confidence).toBe('insufficient');
  });
});

describe('analyzeCandidates', () => {
  it('marks every pair as insufficient_data below the minimum day count', () => {
    const entries = Array.from({ length: MIN_TOTAL_DAYS - 1 }, () => makeEntry());
    const results = analyzeCandidates(entries);

    expect(results.every((r) => r.status === 'insufficient_data')).toBe(true);
  });

  it('detects a real exercise -> productivity relationship', () => {
    const entries = Array.from({ length: 20 }, (_, i) => {
      const exercise = i % 2 === 0;
      return makeEntry({
        exercise,
        productivity: exercise ? 8 + (i % 2) : 5,
        sleepHours: 7,
        energy: 6,
      });
    });

    const results = analyzeCandidates(entries);
    const exerciseToProductivity = results.find((r) => r.variableA === 'exercise' && r.variableB === 'productivity');

    expect(exerciseToProductivity?.status).toBe('ok');
    expect(exerciseToProductivity?.candidate?.statistics.difference).toBeGreaterThan(0);
  });

  it('does not fabricate a pattern out of pure noise', () => {
    const seedValues = [5, 6, 4, 5, 6, 4, 5, 6, 4, 5, 6, 4, 5, 6, 4, 5, 6, 4, 5, 6];
    const entries = seedValues.map((v, i) =>
      makeEntry({
        exercise: i % 2 === 0,
        mood: v,
        sleepHours: 7,
        energy: 5,
        productivity: 5,
      }),
    );

    const results = analyzeCandidates(entries);
    const exerciseToMood = results.find((r) => r.variableA === 'exercise' && r.variableB === 'mood');
    expect(exerciseToMood?.status).toBe('insufficient_data');
  });
});
