import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),

  mongodbUri: required('MONGODB_URI', 'mongodb://localhost:27017/patternly'),

  jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresInDays: 30,

  aiApiKey: process.env.AI_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'claude-sonnet-5',

  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL ?? 'http://localhost:4000',

  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
};
