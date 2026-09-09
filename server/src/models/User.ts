import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    provider: { type: String, default: null },
    subscriptionId: { type: String, default: null },
    status: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    plan: { type: String, enum: ['monthly', 'annual', null], default: null },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },

    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    subscription: { type: subscriptionSchema, default: () => ({}) },

    goals: { type: [String], default: [] },
    curiosities: { type: [String], default: [] },

    onboardingCompleted: { type: Boolean, default: false },

    notificationPreferences: {
      dailyReminder: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = model('User', userSchema);
