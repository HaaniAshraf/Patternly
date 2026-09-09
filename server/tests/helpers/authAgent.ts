import request from 'supertest';
import type { Application } from 'express';

let counter = 0;

export async function createOnboardedAgent(app: Application) {
  counter += 1;
  const agent = request.agent(app);
  const email = `user${counter}@example.com`;

  await agent.post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
    confirmPassword: 'password123',
  });

  await agent.post('/api/onboarding').send({
    goals: ['productivity'],
    curiosities: ['What affects my productivity?'],
  });

  return { agent, email };
}
