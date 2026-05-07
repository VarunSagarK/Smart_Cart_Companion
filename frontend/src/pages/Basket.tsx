import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useDemoStore } from "@/hooks/useDemoStore";
import { BasketLine } from "@/lib/types";

const MOTIVATION_LABELS: Record<string, string> = {
  "birthday-week": "Birthday Week",
  "budget-friendly": "Budget Friendly",
  "comfort-meals": "Comfort Meals",
  "family-gathering": "Family Gathering",
  "fitness-goals": "Fitness Goals",
  "health-conscious": "Health Conscious",
  "high-protein": "High Protein",
  "kids-lunch-prep": "Kids Lunch Prep",
  "meal-prep": "Meal Prep",
  "quick-easy": "Quick & Easy",
  "special-occasion": "Special Occasion",
  "student-budget": "Student Budget",
  "vacation-prep": "Vacation Prep",
  "weekly-essentials": "Weekly Essentials",
};

const lineSubtotal = (lines: BasketLine[]) =>
  +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
const lineSavings = (lines: BasketLine[]) =>
  +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);

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

  const weekCount = duration === "monthly" ? 4 : duration === "biweekly" ? 2 : 1;

  const grouped = useMemo(() => {
    if (!basket || weekCount === 1) return null;
    const groups: BasketLine[][] = Array.from({ length: weekCount }, () => []);
    sorted.forEach(l => {
      const idx = Math.min(weekCount - 1, l.weekIndex ?? 0);
      groups[idx].push(l);
    });
    return groups;
  }, [basket, weekCount, sorted]);

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
  const totalQty = basket.lines.reduce((n, l) => n + l.qty, 0);

  return (
    <Screen title="Cart" subtitle={`${totalQty} item${totalQty === 1 ? "" : "s"}`}>
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
        grouped.map((lines, i) => {
          if (!lines.length) return null;
          const sub = lineSubtotal(lines);
          const save = lineSavings(lines);
          const qty = lines.reduce((n, l) => n + l.qty, 0);
          return (
            <Card key={i} className="border-l-4 border-l-walmart-blue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-walmart-blue-dark">
                    Week {i + 1} <span className="text-muted-foreground font-normal">— {motivationLabel}</span>
                  </p>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {qty} item{qty === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-border">
                  <span className="text-xs text-muted-foreground">Section subtotal</span>
                  <span className="text-sm font-bold text-walmart-blue">
                    ${sub.toFixed(2)}
                    {save > 0 && (
                      <span className="ml-2 text-[11px] font-semibold text-success">
                        save ${save.toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>
                {lines.map(l => (
                  <BasketItemRow key={`${l.item.id}-${l.weekIndex ?? 0}`} line={l} />
                ))}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
              <p className="text-sm font-bold text-walmart-blue-dark">
                This week <span className="text-muted-foreground font-normal">— {motivationLabel}</span>
              </p>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {totalQty} item{totalQty === 1 ? "" : "s"}
              </span>
            </div>
            {sorted.map(l => <BasketItemRow key={`${l.item.id}-${l.weekIndex ?? 0}`} line={l} />)}
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
