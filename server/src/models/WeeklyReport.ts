import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const weeklyReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },

    metrics: {
      productivity: { current: Number, previous: Number, percentChange: Number },
      mood: { current: Number, previous: Number, percentChange: Number },
      sleepHours: { current: Number, previous: Number, percentChange: Number },
      energy: { current: Number, previous: Number, percentChange: Number },
    },

    whatChanged: { type: String, default: '' },
    strongestPatternId: { type: Schema.Types.ObjectId, ref: 'Pattern', default: null },
    suggestedExperiment: { type: String, default: '' },

    aiStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  },
  { timestamps: true },
);

weeklyReportSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

export type WeeklyReportDoc = HydratedDocument<InferSchemaType<typeof weeklyReportSchema>>;

export const WeeklyReport = model('WeeklyReport', weeklyReportSchema);
