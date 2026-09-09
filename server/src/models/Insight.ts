import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const evidenceSchema = new Schema(
  {
    sampleSize: { type: Number, required: true },
    relatedPatternIds: { type: [Schema.Types.ObjectId], ref: 'Pattern', default: [] },
    relatedExperimentIds: { type: [Schema.Types.ObjectId], ref: 'Experiment', default: [] },
  },
  { _id: false },
);

const insightSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    category: {
      type: String,
      enum: ['productivity', 'mood', 'sleep', 'energy'],
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    evidence: { type: evidenceSchema, required: true },

    confidence: {
      type: String,
      enum: ['strong', 'moderate', 'weak', 'insufficient'],
      required: true,
    },

    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true },
);

export type InsightDoc = HydratedDocument<InferSchemaType<typeof insightSchema>>;

export const Insight = model('Insight', insightSchema);
