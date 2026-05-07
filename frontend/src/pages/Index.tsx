import { Link } from "react-router-dom";
import { Search, Sparkles, Tag, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { ProductImage } from "@/components/ProductImage";
import { useDemoStore } from "@/hooks/useDemoStore";
import { CATALOG } from "@/lib/mockCatalog";
import { buildDashboard } from "@/lib/dashboardEngine";

const DEPARTMENTS = [
  { name: "Drinks", emoji: "🥤" },
  { name: "Fresh", emoji: "🥬" },
  { name: "Grocery", emoji: "🛒" },
  { name: "Household", emoji: "🧴" },
  { name: "Pantry", emoji: "🥫" },
  { name: "Snacks", emoji: "🍿" },
];

const Index = () => {
  const { state } = useDemoStore();
  const deals = CATALOG.filter(c => c.onSale).slice(0, 6);
  const dash = buildDashboard(state.history, state.prefs.weeklyBudget);
  const today = new Date();
  const daysLeftInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
  const showEom = state.history.length > 0 && (dash.weekUsedPct >= 80 || daysLeftInMonth <= 7);

  return (
    <Screen title="Walmart" subtitle="How do you want to save today?">
      {/* search bar */}
      <Link
        to="/search"
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-secondary text-muted-foreground text-sm"
      >
        <Search className="size-4" /> Search Walmart
      </Link>

      {/* End-of-month contextual helper */}
      {showEom && (
        <Card className="border-walmart-yellow bg-walmart-yellow/15">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertCircle className="size-4 text-walmart-blue-dark mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-walmart-blue-dark">
                Want help stretching this month's grocery budget?
              </p>
              <p className="text-[11px] text-foreground/70">
                {daysLeftInMonth} days left · let's finish comfortably within budget.
              </p>
            </div>
            <Button asChild size="sm" className="bg-walmart-blue text-primary-foreground h-8">
              <Link to="/ai">Plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI hero — emphasized entry to AI grocery planner */}
      <Link to="/ai" className="block">
        <Card className="bg-gradient-to-br from-walmart-blue to-walmart-blue-dark text-primary-foreground border-0 overflow-hidden shadow-lg relative">
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-walmart-yellow/20 blur-2xl" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 text-walmart-yellow text-xs font-bold uppercase tracking-wider">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-walmart-yellow opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-walmart-yellow" />
              </span>
              <Sparkles className="size-4" /> New · AI Grocery Planner
            </div>
            <h2 className="text-xl font-bold mt-2 leading-snug">
              Plan groceries that fit your budget
            </h2>
            <p className="text-sm text-white/85 mt-1">
              Tell us your budget. We'll build a basket from this week's deals.
            </p>
            <Button
              asChild
              className="mt-4 bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 font-bold w-full h-11"
            >
              <Link to="/ai">
                <Sparkles className="size-4 mr-1" />
                {state.onboarded ? "Open AI Planner" : "Start AI Planner"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Link>

      {/* Departments */}
      <div>
        <p className="text-sm font-semibold mb-2">Shop by department</p>
        <div className="grid grid-cols-3 gap-2">
          {DEPARTMENTS.map(d => (
            <div key={d.name} className="aspect-square rounded-lg bg-secondary flex flex-col items-center justify-center text-center">
              <span className="text-2xl">{d.emoji}</span>
              <span className="text-xs font-medium mt-1">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback deals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold flex items-center gap-1">
            <Tag className="size-4 text-walmart-blue" /> Rollback this week
          </p>
          <Link to="/wellness" className="text-xs text-walmart-blue font-semibold flex items-center">
            See savings <ChevronRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {deals.map(d => (
            <Card key={d.id}>
              <CardContent className="p-3">
                <ProductImage item={d} className="size-16 mb-2" />
                <p className="text-xs font-medium leading-tight line-clamp-2">{d.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold text-walmart-blue">${d.price.toFixed(2)}</span>
                  <span className="text-[11px] line-through text-muted-foreground">${d.basePrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Screen>
  );
};

export default Index;
