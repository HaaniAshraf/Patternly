import { Schema, model, Types, type InferSchemaType, type HydratedDocument } from 'mongoose';

const dailyEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    date: { type: Date, required: true },

    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    energy: { type: Number, required: true, min: 1, max: 10 },
    mood: { type: Number, required: true, min: 1, max: 10 },
    productivity: { type: Number, required: true, min: 1, max: 10 },
    exercise: { type: Boolean, required: true, default: false },

    note: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true },
);

dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export type DailyEntryDoc = HydratedDocument<InferSchemaType<typeof dailyEntrySchema>> & {
  userId: Types.ObjectId;
};

export const DailyEntry = model('DailyEntry', dailyEntrySchema);
