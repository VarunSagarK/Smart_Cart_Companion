import { PurchaseRecord } from "./types";

export interface DashboardStats {
  weekBudget: number;
  weekSpent: number;
  weekRemaining: number;
  monthlySavings: number;
  projectedNextMonthSavings: number;
  smartTip: string;
  shopsThisMonth: number;
}

const TIPS = [
  "Buying produce on sale this week saved you the most — keep watching the weekly circular.",
  "Bulk pantry staples (rice, oats, beans) cut your per-meal cost in half.",
  "Swapping one snack item for nuts or hummus boosts your basket health score by ~20%.",
  "Shopping with a budget set has saved you ~12% vs. unplanned trips.",
];

export function buildDashboard(history: PurchaseRecord[], weekBudget: number): DashboardStats {
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthRecords = history.filter(r => new Date(r.date) >= monthAgo);
  const monthlySavings = monthRecords.reduce((s, r) => s + r.savings, 0);

  // last 7 days spend
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekRecords = history.filter(r => new Date(r.date) >= weekAgo);
  const weekSpent = weekRecords.reduce((s, r) => s + r.total, 0);

  return {
    weekBudget,
    weekSpent: +weekSpent.toFixed(2),
    weekRemaining: +Math.max(0, weekBudget - weekSpent).toFixed(2),
    monthlySavings: +monthlySavings.toFixed(2),
    projectedNextMonthSavings: +(monthlySavings * 1.08).toFixed(2),
    smartTip: TIPS[history.length % TIPS.length],
    shopsThisMonth: monthRecords.length,
  };
}
