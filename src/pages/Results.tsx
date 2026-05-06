import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useDemoStore } from "@/hooks/useDemoStore";
import { buildAllStrategies, STRATEGY_META, suggestSwap } from "@/lib/budgetEngine";
import { CATALOG } from "@/lib/mockCatalog";
import { dealForItem } from "@/lib/mockDeals";
import { Basket, BasketStrategy } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Results = () => {
  const nav = useNavigate();
  const { state, setBasket } = useDemoStore();

  const allBaskets = useMemo(() => buildAllStrategies(state.prefs, CATALOG), [state.prefs]);
  const [strategy, setStrategy] = useState<BasketStrategy>(state.basket?.strategy ?? "healthiest");
  const [override, setOverride] = useState<Basket | null>(null);

  const basket = override ?? allBaskets[strategy];

  // Sort lines alphabetically ascending per spec
  const sortedLines = useMemo(
    () => [...basket.lines].sort((a, b) => a.item.name.localeCompare(b.item.name)),
    [basket],
  );

  const pct = Math.min(100, (basket.subtotal / basket.budget) * 100);

  const handleSwap = (lineId: string) => {
    const line = basket.lines.find(l => l.item.id === lineId);
    if (!line) return;
    const swap = suggestSwap(line, basket, CATALOG);
    if (!swap) {
      toast("No healthier swap fits your budget right now.");
      return;
    }
    const next: Basket = {
      ...basket,
      lines: basket.lines.map(l =>
        l.item.id === lineId ? { ...l, item: swap, appliedDeal: dealForItem(swap.id) } : l,
      ),
    };
    next.subtotal = +next.lines.reduce((s, l) => s + l.item.price * l.qty, 0).toFixed(2);
    next.savings = +next.lines.reduce((s, l) => s + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
    setOverride(next);
    toast.success(`Swapped to ${swap.name}`);
  };

  const handleAddToCart = () => {
    setBasket(basket);
    nav("/basket");
  };

  return (
    <Screen title="Your AI Basket" back subtitle={STRATEGY_META[strategy].tagline}>
      {/* Strategy chips */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {(Object.keys(STRATEGY_META) as BasketStrategy[]).map(s => (
          <button
            key={s}
            onClick={() => { setStrategy(s); setOverride(null); }}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition",
              strategy === s
                ? "bg-walmart-blue text-primary-foreground border-walmart-blue"
                : "bg-background border-border text-foreground",
            )}
          >
            {STRATEGY_META[s].label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-2xl font-bold text-walmart-blue">${basket.subtotal.toFixed(2)}</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Budget ${basket.budget}</span>
            <span className="text-success font-semibold">You saved ${basket.savings.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-walmart-blue" />
            {sortedLines.length} items · sorted A→Z
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {sortedLines.map(l => (
            <BasketItemRow key={l.item.id} line={l} onSwap={() => handleSwap(l.item.id)} />
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={handleAddToCart}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 text-base font-semibold"
      >
        <ShoppingCart className="size-4 mr-2" /> Add all to Walmart cart
      </Button>
    </Screen>
  );
};

export default Results;
