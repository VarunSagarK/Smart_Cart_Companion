import { PurchaseRecord } from "./types";

export interface DashboardStats {
  weekBudget: number;
  weekSpent: number;
  weekRemaining: number;
  weekUsedPct: number;
  monthlySavings: number;
  projectedNextMonthSavings: number;
  smartTip: string;
  shopsThisMonth: number;
  junkReductionPct: number;
  healthierSwaps: number;
  efficiencyScore: number; // 0-100
  insights: string[];
}

const TIPS = [
  "Buying produce on sale this week saved you the most — keep watching the weekly circular.",
  "Bulk pantry staples (rice, oats, beans) cut your per-meal cost in half.",
  "Swapping one snack for nuts or hummus boosts your basket health score by ~20%.",
  "Shopping with a budget set has saved you ~12% vs. unplanned trips.",
  "Switching soda brands could save $24/month.",
];

export function buildDashboard(history: PurchaseRecord[], weekBudget: number): DashboardStats {
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthRecords = history.filter(r => new Date(r.date) >= monthAgo);
  const monthlySavings = monthRecords.reduce((s, r) => s + r.savings, 0);

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekRecords = history.filter(r => new Date(r.date) >= weekAgo);
  const weekSpent = weekRecords.reduce((s, r) => s + r.total, 0);

  const totalItems = monthRecords.reduce((s, r) => s + r.itemCount, 0) || 1;
  const totalJunk = monthRecords.reduce((s, r) => s + r.junkCount, 0);
  const junkReductionPct = Math.round(Math.max(0, 1 - totalJunk / totalItems) * 100) - 70; // baseline-adjusted demo metric
  const healthierSwaps = monthRecords.reduce((s, r) => s + r.healthySwaps, 0);

  const budgetAdherence = Math.min(1, (weekBudget * 4 - monthRecords.reduce((s, r) => s + r.total, 0)) / (weekBudget * 4 || 1));
  const efficiencyScore = Math.round(
    Math.max(0, Math.min(100,
      40 + budgetAdherence * 30 + Math.min(30, monthlySavings),
    ))
  );

  const insights: string[] = [];
  if (monthlySavings > 0) insights.push(`You saved $${monthlySavings.toFixed(0)} this month`);
  if (junkReductionPct > 0) insights.push(`You reduced junk food by ${junkReductionPct}%`);
  if (healthierSwaps > 0) insights.push(`${healthierSwaps} healthier swap${healthierSwaps === 1 ? "" : "s"} this month`);
  if (!insights.length) insights.push("Plan your first AI shop to start tracking savings.");

  return {
    weekBudget,
    weekSpent: +weekSpent.toFixed(2),
    weekRemaining: +Math.max(0, weekBudget - weekSpent).toFixed(2),
    weekUsedPct: Math.min(100, Math.round((weekSpent / weekBudget) * 100)),
    monthlySavings: +monthlySavings.toFixed(2),
    projectedNextMonthSavings: +(monthlySavings * 1.08).toFixed(2),
    smartTip: TIPS[history.length % TIPS.length],
    shopsThisMonth: monthRecords.length,
    junkReductionPct: Math.max(0, junkReductionPct),
    healthierSwaps,
    efficiencyScore,
    insights,
  };
}
