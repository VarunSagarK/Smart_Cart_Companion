import { Link } from "react-router-dom";
import { Search, Sparkles, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { useDemoStore } from "@/hooks/useDemoStore";
import { CATALOG } from "@/lib/mockCatalog";

const DEPARTMENTS = [
  { name: "Grocery", emoji: "🛒" },
  { name: "Fresh", emoji: "🥬" },
  { name: "Pantry", emoji: "🥫" },
  { name: "Snacks", emoji: "🍿" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Household", emoji: "🧴" },
];

const Index = () => {
  const { state } = useDemoStore();
  const deals = CATALOG.filter(c => c.onSale).slice(0, 6);

  return (
    <Screen title="Walmart" subtitle="How do you want to save today?">
      {/* search bar */}
      <Link
        to="/search"
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-secondary text-muted-foreground text-sm"
      >
        <Search className="size-4" /> Search Walmart
      </Link>

      {/* AI hero — the only "new" surface introduced */}
      <Card className="bg-walmart-blue text-primary-foreground border-0 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-walmart-yellow text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="size-4" /> New · AI
          </div>
          <h2 className="text-xl font-bold mt-2 leading-snug">
            Plan groceries that fit your budget
          </h2>
          <p className="text-sm text-white/80 mt-1">
            Tell us your budget. We'll build a basket from this week's deals.
          </p>
          <Button
            asChild
            className="mt-4 bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow/90 font-semibold"
          >
            <Link to="/ai">{state.onboarded ? "Open AI Planner" : "Try the AI Planner"}</Link>
          </Button>
        </CardContent>
      </Card>

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
                <div className="size-12 rounded bg-secondary flex items-center justify-center text-walmart-blue font-bold text-lg mb-2">
                  {d.name.charAt(0)}
                </div>
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
