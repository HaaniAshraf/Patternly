import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const periodSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const resultSchema = new Schema(
  {
    baselineValue: { type: Number },
    experimentValue: { type: Number },
    absoluteChange: { type: Number },
    percentageChange: { type: Number },
    baselineSampleSize: { type: Number },
    experimentSampleSize: { type: Number },
    confidence: { type: String, enum: ['strong', 'moderate', 'weak', 'insufficient'] },
    conclusion: { type: String },
    caveats: { type: [String], default: [] },
    nextExperiment: { type: String },
    aiStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  },
  { _id: false },
);

const experimentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patternId: { type: Schema.Types.ObjectId, ref: 'Pattern', default: null },

    title: { type: String, required: true },
    hypothesis: { type: String, required: true },

    baseline: { type: periodSchema, required: true },
    experimentPeriod: { type: periodSchema, required: true },
    baselineDays: { type: Number, enum: [7, 14], required: true },
    experimentDays: { type: Number, enum: [7, 14, 21, 30], required: true },

    primaryMetric: {
      type: String,
      enum: ['productivity', 'mood', 'energy', 'sleepHours'],
      required: true,
    },
    secondaryMetrics: {
      type: [String],
      enum: ['productivity', 'mood', 'energy', 'sleepHours'],
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'baseline', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },

    result: { type: resultSchema, default: undefined },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type ExperimentDoc = HydratedDocument<InferSchemaType<typeof experimentSchema>>;

export const Experiment = model('Experiment', experimentSchema);
