import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { DailyEntry } from '../models/DailyEntry';
import { Pattern } from '../models/Pattern';
import { Experiment } from '../models/Experiment';
import { Insight } from '../models/Insight';
import { WeeklyReport } from '../models/WeeklyReport';
import { addDays } from '../utils/date';
import { analyzeAndStoreUserPatterns } from '../services/pattern.service';
import { refreshInsights } from '../services/insight.service';

const SEED_EMAIL = 'demo@patternly.app';
const SEED_PASSWORD = 'Demo1234!';
const DAYS = 30;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, step: number): number {
  return Math.round(value / step) * step;
}

async function seed(): Promise<void> {
  if (env.isProduction) {
    throw new Error('Refusing to run seed script against a production environment');
  }

  await connectDB();

  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    console.log('[seed] removing existing demo user and data');
    await Promise.all([
      DailyEntry.deleteMany({ userId: existing._id }),
      Pattern.deleteMany({ userId: existing._id }),
      Experiment.deleteMany({ userId: existing._id }),
      Insight.deleteMany({ userId: existing._id }),
      WeeklyReport.deleteMany({ userId: existing._id }),
    ]);
    await existing.deleteOne();
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const user = await User.create({
    name: 'Demo User',
    email: SEED_EMAIL,
    passwordHash,
    goals: ['productivity', 'energy'],
    curiosities: ['What affects my productivity?', 'What affects my energy?'],
    onboardingCompleted: true,
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDate = addDays(today, -(DAYS - 1));

  const entries = [];
  for (let i = 0; i < DAYS; i += 1) {
    const date = addDays(startDate, i);

    // Exercise pattern: roughly every third day, with a real productivity boost.
    const exercise = i % 3 === 0 || Math.random() < 0.15;

    // Sleep/energy pattern: sleep genuinely drives energy.
    const sleepHours = round(clamp(randomBetween(5.5, 8.5), 4, 9.5), 0.5);
    const energy = Math.round(clamp(3.5 + (sleepHours - 5.5) * 1.3 + randomBetween(-1, 1), 1, 10));

    // Productivity: boosted by exercise, mildly by energy, plus noise.
    const productivity = Math.round(
      clamp(5 + (exercise ? 2 : 0) + (energy - 5) * 0.2 + randomBetween(-1, 1), 1, 10),
    );

    // Mood: intentionally noisy / unrelated to anything else — the "weak pattern" case.
    const mood = Math.round(clamp(randomBetween(4, 8), 1, 10));

    entries.push({
      userId: user._id,
      date,
      sleepHours,
      energy,
      mood,
      productivity,
      exercise,
      note: '',
    });
  }

  await DailyEntry.insertMany(entries);
  console.log(`[seed] created ${entries.length} daily entries`);

  const patterns = await analyzeAndStoreUserPatterns(user._id.toString());
  await refreshInsights(user._id.toString());
  console.log(`[seed] detected ${patterns.length} pattern(s)`);

  console.log('\n[seed] Demo account ready:');
  console.log(`  email:    ${SEED_EMAIL}`);
  console.log(`  password: ${SEED_PASSWORD}`);
}

seed()
  .then(() => disconnectDB())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed', err);
    process.exit(1);
  });
