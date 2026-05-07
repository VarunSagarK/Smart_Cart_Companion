import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useDemoStore } from "@/hooks/useDemoStore";

const MOTIVATION_LABELS: Record<string, string> = {
  "budget-friendly": "Budget Friendly",
  "comfort-meals": "Comfort Meals",
  "family-gathering": "Family Gathering",
  "fitness-goals": "Fitness Goals",
  "health-conscious": "Health Conscious",
  "high-protein": "High Protein",
  "kids-lunch-prep": "Kids Lunch Prep",
  "meal-prep": "Meal Prep",
  "quick-easy": "Quick & Easy",
  "weekly-essentials": "Weekly Essentials",
};

const Basket = () => {
  const nav = useNavigate();
  const { state } = useDemoStore();
  const basket = state.basket;
  const duration = state.prefs.duration;
  const motivation = state.prefs.motivation;

  const sorted = useMemo(
    () => (basket ? [...basket.lines].sort((a, b) => a.item.name.localeCompare(b.item.name)) : []),
    [basket],
  );

  const grouped = useMemo(() => {
    if (!basket || duration === "weekly") return null;
    const weeks = duration === "monthly" ? 4 : 2;
    const groups: typeof basket.lines[] = Array.from({ length: weeks }, () => []);
    sorted.forEach(l => {
      const idx = Math.min(weeks - 1, l.weekIndex ?? 0);
      groups[idx].push(l);
    });
    return groups;
  }, [basket, duration, sorted]);

  if (!basket || basket.lines.length === 0) {
    return (
      <Screen title="Cart" subtitle="Empty">
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-3">
            <ShoppingCart className="size-10 text-muted-foreground/40 mx-auto" />
            <p>Your cart is empty. Build a basket with the AI planner or browse the catalog.</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => nav("/ai")} className="bg-walmart-blue text-primary-foreground">
            <Sparkles className="size-4 mr-1" /> AI Planner
          </Button>
          <Button variant="outline" onClick={() => nav("/search")}>Browse</Button>
        </div>
      </Screen>
    );
  }

  const motivationLabel = motivation ? MOTIVATION_LABELS[motivation] ?? "Weekly Essentials" : "Weekly Essentials";

  return (
    <Screen title="Cart" subtitle={`${basket.lines.reduce((n, l) => n + l.qty, 0)} items`}>
      <Card>
        <CardContent className="p-4 flex justify-between items-baseline">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold text-walmart-blue">${basket.subtotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">You save</p>
            <p className="text-sm font-semibold text-success">${basket.savings.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {grouped ? (
        grouped.map((lines, i) =>
          lines.length ? (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-walmart-blue-dark">Week {i + 1}</p>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {motivationLabel}
                  </span>
                </div>
                {lines.map(l => (
                  <BasketItemRow key={`${l.item.id}-${i}`} line={l} />
                ))}
              </CardContent>
            </Card>
          ) : null,
        )
      ) : (
        <Card>
          <CardContent className="p-4">
            {sorted.map(l => <BasketItemRow key={l.item.id} line={l} />)}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => nav("/checkout")}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 font-semibold sticky bottom-2 shadow-lg"
      >
        Check out · ${basket.subtotal.toFixed(2)}
      </Button>
    </Screen>
  );
};

export default Basket;
