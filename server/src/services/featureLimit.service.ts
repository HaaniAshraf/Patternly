import type { UserDoc } from '../models/User';

export interface PlanLimits {
  maxActivePatterns: number | null;
  maxActiveExperiments: number | null;
  historyDays: number | null;
  weeklyReports: boolean;
  personalInsights: boolean;
  dataExport: boolean;
}

const FREE_LIMITS: PlanLimits = {
  maxActivePatterns: 3,
  maxActiveExperiments: 1,
  historyDays: 14,
  weeklyReports: false,
  personalInsights: false,
  dataExport: true,
};

const PRO_LIMITS: PlanLimits = {
  maxActivePatterns: null,
  maxActiveExperiments: null,
  historyDays: null,
  weeklyReports: true,
  personalInsights: true,
  dataExport: true,
};

export function isProUser(user: Pick<UserDoc, 'plan'>): boolean {
  return user.plan === 'pro';
}

export function getPlanLimits(user: Pick<UserDoc, 'plan'>): PlanLimits {
  return isProUser(user) ? PRO_LIMITS : FREE_LIMITS;
}

export function getAllowedExperimentPeriods(user: Pick<UserDoc, 'plan'>): number[] {
  return isProUser(user) ? [7, 14, 21, 30] : [7, 14];
}

export function isUnderLimit(count: number, limit: number | null): boolean {
  return limit === null || count < limit;
}

export function historyCutoffDate(user: Pick<UserDoc, 'plan'>): Date | null {
  const limits = getPlanLimits(user);
  if (limits.historyDays === null) return null;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - limits.historyDays);
  return cutoff;
}
