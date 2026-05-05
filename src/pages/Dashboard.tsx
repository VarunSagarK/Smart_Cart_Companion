import { Lightbulb, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildDashboard } from "@/lib/dashboardEngine";

const Dashboard = () => {
  const { state } = useDemoStore();
  const s = buildDashboard(state.history, state.prefs.weeklyBudget);
  const usedPct = Math.min(100, (s.weekSpent / s.weekBudget) * 100);

  return (
    <Screen title="Wellness Dashboard" subtitle="Your money & habits">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-walmart-blue" />
            <p className="text-sm font-semibold">This week's budget</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-walmart-blue">
              ${s.weekSpent.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">of ${s.weekBudget}</span>
          </div>
          <Progress value={usedPct} className="h-2" />
          <p className="text-xs text-success font-semibold">
            ${s.weekRemaining.toFixed(2)} remaining
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="size-4 text-walmart-blue" />
            <p className="text-sm font-semibold">Monthly savings</p>
          </div>
          <p className="text-2xl font-bold">${s.monthlySavings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Across {s.shopsThisMonth} shop{s.shopsThisMonth === 1 ? "" : "s"} this month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-walmart-yellow/20 border-walmart-yellow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="size-4 text-walmart-blue-dark" />
            <p className="text-sm font-semibold text-walmart-blue-dark">
              Smart tip of the month
            </p>
          </div>
          <p className="text-sm text-foreground/80">{s.smartTip}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-success" />
            <p className="text-sm font-semibold">Projected next-month savings</p>
          </div>
          <p className="text-2xl font-bold text-success">
            ${s.projectedNextMonthSavings.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            If you keep planning shops with AI.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Junk reduction & healthier swaps
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Coming soon — wellness scoring engine in the next release.
          </p>
        </CardContent>
      </Card>
    </Screen>
  );
};

export default Dashboard;
