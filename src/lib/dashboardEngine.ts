import { PurchaseRecord, Preferences } from "./types";

export interface DashboardStats {
  periodLabel: string;   // "This week" | "This bi-week" | "This month"
  periodBudget: number;  // the budget for that period
  periodSpent: number;   // total spent in matching orders
  periodRemaining: number;
  periodUsedPct: number;
  monthlySavings: number;
  projectedNextMonthSavings: number;
  smartTip: string;
  shopsThisMonth: number;
  junkReductionPct: number;
  healthierSwaps: number;
  efficiencyScore: number; // 0-100
  insights: string[];
  // kept for backwards compat
  weekBudget: number;
  weekSpent: number;
  weekRemaining: number;
  weekUsedPct: number;
}

const TIPS = [
  "Buying produce on sale this week saved you the most — keep watching the weekly circular.",
  "Bulk pantry staples (rice, oats, beans) cut your per-meal cost in half.",
  "Swapping one snack for nuts or hummus boosts your basket health score by ~20%.",
  "Shopping with a budget set has saved you ~12% vs. unplanned trips.",
  "Switching soda brands could save $24/month.",
];

export function buildDashboard(
  history: PurchaseRecord[],
  weekBudget: number,
  prefs?: Pick<Preferences, "duration" | "rawBudget">,
): DashboardStats {
  const now = new Date();
  const duration = prefs?.duration ?? "weekly";
  const rawBudget = prefs?.rawBudget ?? weekBudget;

  // Period window depends on duration
  const daysBack = duration === "monthly" ? 30 : duration === "biweekly" ? 14 : 7;
  const periodLabel = duration === "monthly" ? "This month" : duration === "biweekly" ? "This bi-week" : "This week";
  const periodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const periodRecords = history.filter(r => new Date(r.date) >= periodStart);
  const periodSpent = periodRecords.reduce((s, r) => s + r.total, 0);
  const periodBudget = rawBudget > 0 ? rawBudget : weekBudget;

  // Monthly always looks at calendar month
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRecords = history.filter(r => new Date(r.date) >= monthAgo);
  const monthlySavings = monthRecords.reduce((s, r) => s + r.savings, 0);

  const totalItems = monthRecords.reduce((s, r) => s + r.itemCount, 0) || 1;
  const totalJunk = monthRecords.reduce((s, r) => s + r.junkCount, 0);
  const junkReductionPct = Math.round(Math.max(0, 1 - totalJunk / totalItems) * 100) - 70;
  const healthierSwaps = monthRecords.reduce((s, r) => s + r.healthySwaps, 0);

  const budgetAdherence = periodBudget > 0
    ? Math.min(1, (periodBudget - periodSpent) / periodBudget)
    : 0;
  const efficiencyScore = Math.round(
    Math.max(0, Math.min(100, 40 + budgetAdherence * 30 + Math.min(30, monthlySavings)))
  );

  const insights: string[] = [];
  if (monthlySavings > 0) insights.push(`You saved $${monthlySavings.toFixed(0)} this month`);
  if (junkReductionPct > 0) insights.push(`You reduced junk food by ${junkReductionPct}%`);
  if (healthierSwaps > 0) insights.push(`${healthierSwaps} healthier swap${healthierSwaps === 1 ? "" : "s"} this month`);
  if (!insights.length) insights.push("Plan your first AI shop to start tracking savings.");

  return {
    periodLabel,
    periodBudget: +periodBudget.toFixed(2),
    periodSpent: +periodSpent.toFixed(2),
    periodRemaining: +Math.max(0, periodBudget - periodSpent).toFixed(2),
    periodUsedPct: periodBudget > 0 ? Math.min(100, Math.round((periodSpent / periodBudget) * 100)) : 0,
    monthlySavings: +monthlySavings.toFixed(2),
    projectedNextMonthSavings: +(monthlySavings * 1.08).toFixed(2),
    smartTip: TIPS[history.length % TIPS.length],
    shopsThisMonth: monthRecords.length,
    junkReductionPct: Math.max(0, junkReductionPct),
    healthierSwaps,
    efficiencyScore,
    insights,
    // backwards compat aliases
    weekBudget: periodBudget,
    weekSpent: +periodSpent.toFixed(2),
    weekRemaining: +Math.max(0, periodBudget - periodSpent).toFixed(2),
    weekUsedPct: periodBudget > 0 ? Math.min(100, Math.round((periodSpent / periodBudget) * 100)) : 0,
  };
}
