import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles, Trash2, AlertTriangle } from "lucide-react";
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
  const [showOverBudgetDialog, setShowOverBudgetDialog] = useState(false);

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
  // Use basket.budget (period total from the engine) — same source as Results page
  const budget = basket.budget;
  const overBudget = basket.subtotal > budget ? +(basket.subtotal - budget).toFixed(2) : 0;

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
      <Card className={overBudget ? "border-red-300" : ""}>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className={`text-2xl font-bold ${overBudget ? "text-red-500" : "text-walmart-blue"}`}>
                ${basket.subtotal.toFixed(2)}
              </p>
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
          </div>
          {overBudget > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-red-100">
              <span className="text-muted-foreground">Budget ${budget.toFixed(2)}</span>
              <span className="text-red-500 font-semibold">${overBudget.toFixed(2)} over budget</span>
            </div>
          )}
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
        onClick={() => overBudget ? setShowOverBudgetDialog(true) : nav("/checkout")}
        className={`w-full h-12 font-semibold sticky bottom-2 shadow-lg text-primary-foreground ${overBudget ? "bg-red-500 hover:bg-red-600" : "bg-walmart-blue hover:bg-walmart-blue-dark"}`}
      >
        Check out · ${basket.subtotal.toFixed(2)}
        {overBudget > 0 && <span className="ml-2 text-xs font-normal opacity-90">(${overBudget.toFixed(2)} over)</span>}
      </Button>

      {/* Over-budget confirmation dialog */}
      {showOverBudgetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="size-6 text-red-500" />
              </div>
              <h2 className="text-base font-bold text-foreground">Over your budget</h2>
              <p className="text-sm text-muted-foreground">
                Your cart is{" "}
                <span className="font-semibold text-red-500">${overBudget.toFixed(2)} over</span>{" "}
                your ${budget.toFixed(2)} budget. Are you sure you want to proceed to checkout?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                variant="default"
                autoFocus
                onClick={() => setShowOverBudgetDialog(false)}
                className="bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground font-bold"
              >
                No, go back
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowOverBudgetDialog(false); nav("/checkout"); }}
                className="border-red-300 text-red-500 hover:bg-red-50 font-semibold"
              >
                Yes, proceed
              </Button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
};

export default Basket;
