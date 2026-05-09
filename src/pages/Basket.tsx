import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useStore } from "@/contexts/DemoStoreContext";

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
  const { state, removeItemFromBasket, updateItemQty, clearBasket } = useStore();
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

  const totalItems = basket.lines.reduce((n, l) => n + l.qty, 0);
  const motivationLabel = motivation ? MOTIVATION_LABELS[motivation] ?? "Weekly Essentials" : "Weekly Essentials";

  const renderLines = (lines: typeof basket.lines) =>
    lines.map(l => (
      <BasketItemRow
        key={`${l.item.id}-${l.weekIndex ?? 0}`}
        line={l}
        onRemove={removeItemFromBasket}
        onQtyChange={updateItemQty}
      />
    ));

  return (
    <Screen title="Cart" subtitle={`${totalItems} item${totalItems !== 1 ? "s" : ""}`}>
      {/* Totals summary */}
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-2xl font-bold text-walmart-blue">${basket.subtotal.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Rollback savings</p>
            <p className="text-sm font-semibold text-green-600">−${basket.savings.toFixed(2)}</p>
          </div>
          <button
            onClick={clearBasket}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-destructive text-destructive text-xs font-semibold hover:bg-destructive/10 transition"
          >
            <Trash2 className="size-3.5" /> Clear cart
          </button>
        </CardContent>
      </Card>

      {/* Items */}
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
                {renderLines(lines)}
              </CardContent>
            </Card>
          ) : null,
        )
      ) : (
        <Card>
          <CardContent className="p-4">
            {renderLines(sorted)}
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
