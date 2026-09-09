import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const statisticsSchema = new Schema(
  {
    groupAValue: { type: Number, required: true },
    groupBValue: { type: Number, required: true },
    difference: { type: Number, required: true },
    percentageDifference: { type: Number, required: true },
    sampleSize: { type: Number, required: true },
    groupALabel: { type: String, required: true },
    groupBLabel: { type: String, required: true },
    groupACount: { type: Number, required: true },
    groupBCount: { type: Number, required: true },
    correlationCoefficient: { type: Number, default: null },
  },
  { _id: false },
);

const patternSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    variableA: { type: String, required: true },
    variableB: { type: String, required: true },

    statistics: { type: statisticsSchema, required: true },

    confidence: {
      type: String,
      enum: ['strong', 'moderate', 'weak', 'insufficient'],
      required: true,
    },

    title: { type: String, required: true },
    summary: { type: String, required: true },

    caveats: { type: [String], default: [] },
    suggestedExperiment: { type: String, default: '' },

    aiStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },

    status: { type: String, enum: ['active', 'dismissed'], default: 'active' },
  },
  { timestamps: true },
);

patternSchema.index({ userId: 1, variableA: 1, variableB: 1 }, { unique: true });

export type PatternDoc = HydratedDocument<InferSchemaType<typeof patternSchema>>;

export const Pattern = model('Pattern', patternSchema);
