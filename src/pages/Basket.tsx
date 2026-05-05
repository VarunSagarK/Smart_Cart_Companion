import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen } from "@/components/Screen";
import { BasketItemRow } from "@/components/BasketItemRow";
import { useDemoStore } from "@/hooks/useDemoStore";
import { optimizeBasket, suggestSwap } from "@/lib/budgetEngine";
import { CATALOG } from "@/lib/mockCatalog";
import { dealForItem } from "@/lib/mockDeals";
import { Basket as BasketT, Category } from "@/lib/types";

const CATEGORY_LABEL: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  protein: "Protein",
  pantry: "Pantry",
  snacks: "Snacks",
  beverages: "Beverages",
};

const Basket = () => {
  const nav = useNavigate();
  const { state, setBasket } = useDemoStore();

  const basket = useMemo<BasketT>(
    () => state.basket ?? optimizeBasket(state.prefs, CATALOG),
    [state.basket, state.prefs],
  );

  const grouped = useMemo(() => {
    const map = new Map<Category, typeof basket.lines>();
    for (const l of basket.lines) {
      const arr = map.get(l.item.category) ?? [];
      arr.push(l);
      map.set(l.item.category, arr);
    }
    return [...map.entries()];
  }, [basket]);

  const pct = Math.min(100, (basket.subtotal / basket.budget) * 100);

  const handleSwap = (lineId: string) => {
    const line = basket.lines.find(l => l.item.id === lineId);
    if (!line) return;
    const swap = suggestSwap(line, basket, CATALOG);
    if (!swap) {
      toast("No healthier swap fits your budget right now.");
      return;
    }
    const next: BasketT = {
      ...basket,
      lines: basket.lines.map(l =>
        l.item.id === lineId
          ? { ...l, item: swap, appliedDeal: dealForItem(swap.id) }
          : l,
      ),
    };
    next.subtotal = +next.lines.reduce((s, l) => s + l.item.price * l.qty, 0).toFixed(2);
    next.savings = +next.lines.reduce((s, l) => s + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
    setBasket(next);
    toast.success(`Swapped to ${swap.name}`);
  };

  const handleCheckout = () => {
    setBasket(basket);
    nav("/checkout");
  };

  return (
    <Screen title="Your AI Basket" back subtitle={`${basket.lines.length} items selected`}>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-2xl font-bold text-walmart-blue">
              ${basket.subtotal.toFixed(2)}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Budget ${basket.budget}</span>
            <span className="text-success font-semibold">
              You saved ${basket.savings.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {grouped.map(([cat, lines]) => (
        <Card key={cat}>
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {CATEGORY_LABEL[cat]}
            </p>
            {lines.map(l => (
              <BasketItemRow
                key={l.item.id}
                line={l}
                onSwap={() => handleSwap(l.item.id)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={handleCheckout}
        className="w-full bg-walmart-blue hover:bg-walmart-blue-dark text-primary-foreground h-12 text-base font-semibold"
      >
        Proceed to Walmart Checkout
      </Button>
    </Screen>
  );
};

export default Basket;
