import { Lightbulb, PiggyBank, TrendingUp, Wallet, Leaf, Repeat, Trophy, AlertCircle, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Screen } from "@/components/Screen";
import { useStore } from "@/contexts/DemoStoreContext";
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
  const { state } = useStore();
  const s = buildDashboard(state.history, state.prefs.weeklyBudget);

  // Tiny wins (lightweight, supportive copy)
  const wins: string[] = [];
  if (s.weekUsedPct < 100 && s.shopsThisMonth >= 2) wins.push("You stayed within budget two weeks in a row.");
  if (s.junkReductionPct >= 5) wins.push(`You reduced junk food by ${s.junkReductionPct}%.`);
  if (s.monthlySavings >= 10) wins.push(`You saved $${s.monthlySavings.toFixed(0)} using flyer deals.`);
  if (!wins.length) wins.push("Your first plan kicks off your savings streak — nice start.");

  // End-of-month survival contextual prompt
  const today = new Date();
  const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
  const trendingOver = s.weekUsedPct >= 80;
  const showEom = trendingOver || daysLeftInMonth <= 7;

  return (
    <Screen title="Savings & Wellness" subtitle="Your money & habits">
      {/* End-of-month contextual AI helper */}
      {showEom && (
        <Card className="border-walmart-yellow bg-walmart-yellow/15">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="size-5 text-walmart-blue-dark mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-walmart-blue-dark">
                {trendingOver ? "Want help stretching this week's budget?" : "Let's comfortably finish the month within budget."}
              </p>
              <p className="text-xs text-foreground/70 mt-1">
                {daysLeftInMonth} day{daysLeftInMonth === 1 ? "" : "s"} left · we'll suggest cheaper swaps and bulk basics.
              </p>
              <Button asChild size="sm" className="mt-2 bg-walmart-blue text-primary-foreground h-8">
                <Link to="/ai">Open AI Planner</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Tiny wins */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-walmart-yellow" />
            <p className="text-sm font-semibold">Small wins</p>
          </div>
          <div className="space-y-1.5">
            {wins.map((w, i) => (
              <p key={i} className="text-sm text-foreground/80">• {w}</p>
            ))}
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

      {/* Payment / Order history */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-walmart-blue" />
            <p className="text-sm font-semibold">Order history</p>
          </div>
          {state.history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No orders yet. Complete a checkout to see your history here.
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {state.history.map((rec, i) => (
                <div key={rec.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">Order #{rec.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(rec.date).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{rec.itemCount} item{rec.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-walmart-blue">${rec.total.toFixed(2)}</p>
                      <p className="text-[11px] text-green-600 font-semibold">−${rec.savings.toFixed(2)} saved</p>
                    </div>
                  </div>
                  {i < state.history.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Screen>
  );
};

export default Wellness;
