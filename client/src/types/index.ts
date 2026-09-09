export type Plan = 'free' | 'pro';
export type Confidence = 'strong' | 'moderate' | 'weak' | 'insufficient';
export type ExperimentStatus = 'draft' | 'baseline' | 'active' | 'completed' | 'cancelled';
export type MetricField = 'productivity' | 'mood' | 'energy' | 'sleepHours';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  goals: string[];
  curiosities: string[];
  onboardingCompleted: boolean;
  notificationPreferences: { dailyReminder: boolean; weeklyReport: boolean };
  createdAt: string;
}

export interface DailyEntry {
  id: string;
  date: string;
  sleepHours: number;
  energy: number;
  mood: number;
  productivity: number;
  exercise: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatternStatistics {
  groupAValue: number;
  groupBValue: number;
  difference: number;
  percentageDifference: number;
  sampleSize: number;
  groupALabel: string;
  groupBLabel: string;
  groupACount: number;
  groupBCount: number;
  correlationCoefficient: number | null;
}

export interface Pattern {
  id: string;
  variableA: string;
  variableB: string;
  statistics: PatternStatistics;
  confidence: Confidence;
  title: string;
  summary: string;
  caveats: string[];
  suggestedExperiment: string;
  status: 'active' | 'dismissed';
  aiStatus: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
}

export interface ExperimentResult {
  baselineValue: number;
  experimentValue: number;
  absoluteChange: number;
  percentageChange: number;
  baselineSampleSize: number;
  experimentSampleSize: number;
  confidence: Confidence;
  conclusion: string;
  caveats: string[];
  nextExperiment: string;
  aiStatus: 'pending' | 'succeeded' | 'failed';
}

export interface ExperimentProgress {
  phase: ExperimentStatus;
  currentDay: number;
  totalDays: number;
  readyToComplete: boolean;
}

export interface Experiment {
  id: string;
  patternId: string | null;
  title: string;
  hypothesis: string;
  baseline: { startDate: string; endDate: string };
  experimentPeriod: { startDate: string; endDate: string };
  baselineDays: number;
  experimentDays: number;
  primaryMetric: MetricField;
  secondaryMetrics: MetricField[];
  status: ExperimentStatus;
  result: ExperimentResult | null;
  progress: ExperimentProgress;
  createdAt: string;
  completedAt: string | null;
}

export interface Insight {
  id: string;
  category: 'productivity' | 'mood' | 'sleep' | 'energy';
  title: string;
  description: string;
  evidence: { sampleSize: number; relatedPatternIds: string[]; relatedExperimentIds: string[] };
  confidence: Confidence;
  status: string;
  createdAt: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  metrics: Record<
    'productivity' | 'mood' | 'sleepHours' | 'energy',
    { current: number; previous: number; percentChange: number }
  >;
  whatChanged: string;
  suggestedExperiment: string;
  strongestPatternId: string | null;
}

export interface BillingStatus {
  plan: Plan;
  subscription: {
    provider: string | null;
    subscriptionId: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    plan: 'monthly' | 'annual' | null;
  };
}
