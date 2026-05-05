import { Sparkles, TrendingUp, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { StatCard } from "@/components/StatCard";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildDashboard } from "@/lib/dashboardEngine";

const Index = () => {
  const { state } = useDemoStore();
  const stats = buildDashboard(state.history, state.prefs.weeklyBudget);
  const last = state.history[0];

  return (
    <Screen title="Walmart AI" subtitle="Your grocery budget assistant">
      <Card className="bg-walmart-blue text-primary-foreground border-0">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-walmart-yellow text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="size-4" /> AI Budget Plan
          </div>
          <h2 className="text-xl font-bold mt-2 leading-snug">
            Plan this week's groceries in under a minute
          </h2>
          <p className="text-sm text-white/80 mt-1">
            Set your budget. We'll build a healthy basket from this week's deals.
          </p>
          <Button
            asChild
            className="mt-4 bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 font-semibold"
          >
            <Link to="/budget">Start Planning</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Weekly Budget"
          value={`$${state.prefs.weeklyBudget}`}
          hint={`Household of ${state.prefs.household}`}
          accent
        />
        <StatCard
          label="Last Shop"
          value={last ? `$${last.total.toFixed(0)}` : "—"}
          hint={last ? `Saved $${last.savings.toFixed(2)}` : "No shops yet"}
        />
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-walmart-blue" />
            <p className="text-sm font-semibold">This month</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saved</span>
            <span className="font-semibold">${stats.monthlySavings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shops</span>
            <span className="font-semibold">{stats.shopsThisMonth}</span>
          </div>
        </CardContent>
      </Card>

      <Link
        to="/dashboard"
        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="size-5 text-walmart-blue" />
          <span className="text-sm font-medium">View wellness dashboard</span>
        </div>
        <span className="text-walmart-blue text-sm font-semibold">Open →</span>
      </Link>
    </Screen>
  );
};

export default Index;
