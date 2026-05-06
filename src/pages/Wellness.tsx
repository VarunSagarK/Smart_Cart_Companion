import { Lightbulb, PiggyBank, TrendingUp, Wallet, Leaf, Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildDashboard } from "@/lib/dashboardEngine";

/** Simple progress ring — no charts, per design rules. */
const Ring = ({ value, label }: { value: number; label: string }) => {
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle cx="40" cy="40" r={r} stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
        <circle
          cx="40" cy="40" r={r}
          stroke="hsl(var(--walmart-blue))"
          strokeWidth="6" fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-walmart-blue leading-none">{value}%</span>
        <span className="text-[9px] text-muted-foreground mt-0.5">{label}</span>
      </div>
    </div>
  );
};

const Wellness = () => {
  const { state } = useDemoStore();
  const s = buildDashboard(state.history, state.prefs.weeklyBudget);

  return (
    <Screen title="Savings & Wellness" subtitle="Your money & habits">
      {/* This week's budget */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-walmart-blue" />
            <p className="text-sm font-semibold">This week's budget</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-walmart-blue">${s.weekSpent.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">of ${s.weekBudget}</span>
          </div>
          <Progress value={s.weekUsedPct} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{s.weekUsedPct}% used</span>
            <span className="text-success font-semibold">${s.weekRemaining.toFixed(2)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Dual stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <PiggyBank className="size-4 text-walmart-blue mb-1" />
            <p className="text-xs text-muted-foreground">Monthly savings</p>
            <p className="text-xl font-bold">${s.monthlySavings.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="size-4 text-success mb-1" />
            <p className="text-xs text-muted-foreground">Projected next month</p>
            <p className="text-xl font-bold text-success">${s.projectedNextMonthSavings.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Wellness ring row */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <Ring value={s.efficiencyScore} label="Efficiency" />
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-success" />
              <span className="text-muted-foreground">Junk reduced</span>
              <span className="ml-auto font-semibold">{s.junkReductionPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Repeat className="size-4 text-walmart-blue" />
              <span className="text-muted-foreground">Healthier swaps</span>
              <span className="ml-auto font-semibold">{s.healthierSwaps}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardContent className="p-4 space-y-1.5">
          <p className="text-sm font-semibold mb-1">Smart insights</p>
          {s.insights.map((i, idx) => (
            <p key={idx} className="text-sm text-foreground/80">• {i}</p>
          ))}
        </CardContent>
      </Card>

      {/* Tip */}
      <Card className="bg-walmart-yellow/20 border-walmart-yellow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="size-4 text-walmart-blue-dark" />
            <p className="text-sm font-semibold text-walmart-blue-dark">Smart tip</p>
          </div>
          <p className="text-sm text-foreground/80">{s.smartTip}</p>
        </CardContent>
      </Card>
    </Screen>
  );
};

export default Wellness;
